import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { parseBody, requireAuth, unauthorized } from "@/lib/api-auth";
import { createOpsAuditLog, ensureOpsAccess, parseDateOnly, toISODate } from "@/lib/ops";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const asignarSchema = z.object({
  guardiaId: z.string().uuid(),
  puestoId: z.string().uuid(),
  slotNumber: z.number().int().min(1).max(20),
  startDate: z.string().regex(dateRegex).optional(),
  reason: z.string().max(500).optional().nullable(),
});

const desasignarSchema = z.object({
  asignacionId: z.string().uuid(),
  endDate: z.string().regex(dateRegex).optional(),
  reason: z.string().max(500).optional().nullable(),
});

/**
 * GET /api/ops/asignaciones
 * Query params: installationId, puestoId, guardiaId, activeOnly
 */
export async function GET(request: NextRequest) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return unauthorized();
    const forbidden = ensureOpsAccess(ctx);
    if (forbidden) return forbidden;

    const installationId = request.nextUrl.searchParams.get("installationId") || undefined;
    const puestoId = request.nextUrl.searchParams.get("puestoId") || undefined;
    const guardiaId = request.nextUrl.searchParams.get("guardiaId") || undefined;
    const activeOnly = request.nextUrl.searchParams.get("activeOnly") !== "false";

    const asignaciones = await prisma.opsAsignacionGuardia.findMany({
      where: {
        tenantId: ctx.tenantId,
        ...(installationId ? { installationId } : {}),
        ...(puestoId ? { puestoId } : {}),
        ...(guardiaId ? { guardiaId } : {}),
        ...(activeOnly ? { isActive: true } : {}),
      },
      include: {
        guardia: {
          select: {
            id: true,
            code: true,
            status: true,
            lifecycleStatus: true,
            persona: {
              select: { firstName: true, lastName: true, rut: true },
            },
          },
        },
        puesto: {
          select: {
            id: true,
            name: true,
            shiftStart: true,
            shiftEnd: true,
            requiredGuards: true,
          },
        },
        installation: {
          select: {
            id: true,
            name: true,
            account: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: [{ isActive: "desc" }, { startDate: "desc" }],
    });

    return NextResponse.json({ success: true, data: asignaciones });
  } catch (error) {
    console.error("[OPS] Error listing asignaciones:", error);
    return NextResponse.json(
      { success: false, error: "No se pudieron obtener las asignaciones" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ops/asignaciones
 * Action: "asignar" or "desasignar"
 */
export async function POST(request: NextRequest) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return unauthorized();
    const forbidden = ensureOpsAccess(ctx);
    if (forbidden) return forbidden;

    const rawBody = await request.json();
    const action = rawBody?.action as string;

    if (action === "desasignar") {
      return handleDesasignar(ctx, rawBody);
    }

    // Default: asignar
    const parsed = asignarSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }
    const body = parsed.data;

    // Validate guardia exists and is assignable
    const guardia = await prisma.opsGuardia.findFirst({
      where: { id: body.guardiaId, tenantId: ctx.tenantId },
      select: { id: true, status: true, lifecycleStatus: true, isBlacklisted: true },
    });
    if (!guardia) {
      return NextResponse.json({ success: false, error: "Guardia no encontrado" }, { status: 404 });
    }
    if (!["seleccionado", "contratado_activo"].includes(guardia.lifecycleStatus)) {
      return NextResponse.json(
        { success: false, error: `Guardia debe estar en estado 'seleccionado' o 'contratado_activo' (actual: ${guardia.lifecycleStatus})` },
        { status: 400 }
      );
    }
    if (guardia.isBlacklisted) {
      return NextResponse.json(
        { success: false, error: "No se puede asignar un guardia en lista negra" },
        { status: 400 }
      );
    }

    // Validate puesto exists
    const puesto = await prisma.opsPuestoOperativo.findFirst({
      where: { id: body.puestoId, tenantId: ctx.tenantId },
      select: { id: true, installationId: true, requiredGuards: true },
    });
    if (!puesto) {
      return NextResponse.json({ success: false, error: "Puesto no encontrado" }, { status: 404 });
    }
    if (body.slotNumber > puesto.requiredGuards) {
      return NextResponse.json(
        { success: false, error: `Slot ${body.slotNumber} excede la dotación del puesto (${puesto.requiredGuards})` },
        { status: 400 }
      );
    }

    // Check if guardia already has active assignment → close it
    const existingGuardiaAssignment = await prisma.opsAsignacionGuardia.findFirst({
      where: { guardiaId: body.guardiaId, tenantId: ctx.tenantId, isActive: true },
    });

    const startDate = body.startDate ? parseDateOnly(body.startDate) : parseDateOnly(toISODate(new Date()));

    if (existingGuardiaAssignment) {
      await prisma.opsAsignacionGuardia.update({
        where: { id: existingGuardiaAssignment.id },
        data: {
          isActive: false,
          endDate: startDate,
          reason: body.reason || "Traslado a otro puesto",
        },
      });

      await createOpsAuditLog(ctx, "ops.asignacion.closed", "ops_asignacion", existingGuardiaAssignment.id, {
        guardiaId: body.guardiaId,
        previousPuestoId: existingGuardiaAssignment.puestoId,
        reason: body.reason || "Traslado a otro puesto",
      });
    }

    // Check if slot is already occupied → close that assignment
    const existingSlotAssignment = await prisma.opsAsignacionGuardia.findFirst({
      where: {
        puestoId: body.puestoId,
        slotNumber: body.slotNumber,
        tenantId: ctx.tenantId,
        isActive: true,
      },
    });

    if (existingSlotAssignment) {
      await prisma.opsAsignacionGuardia.update({
        where: { id: existingSlotAssignment.id },
        data: {
          isActive: false,
          endDate: startDate,
          reason: "Reemplazado por otro guardia",
        },
      });
    }

    // Create new assignment
    const asignacion = await prisma.opsAsignacionGuardia.create({
      data: {
        tenantId: ctx.tenantId,
        guardiaId: body.guardiaId,
        puestoId: body.puestoId,
        slotNumber: body.slotNumber,
        installationId: puesto.installationId,
        startDate,
        isActive: true,
        reason: body.reason || "Asignación inicial",
        createdBy: ctx.userId,
      },
      include: {
        guardia: {
          select: {
            id: true,
            code: true,
            persona: { select: { firstName: true, lastName: true } },
          },
        },
        puesto: { select: { id: true, name: true } },
      },
    });

    await createOpsAuditLog(ctx, "ops.asignacion.created", "ops_asignacion", asignacion.id, {
      guardiaId: body.guardiaId,
      puestoId: body.puestoId,
      slotNumber: body.slotNumber,
      startDate: toISODate(startDate),
    });

    return NextResponse.json({ success: true, data: asignacion }, { status: 201 });
  } catch (error) {
    console.error("[OPS] Error creating asignacion:", error);
    return NextResponse.json(
      { success: false, error: "No se pudo crear la asignación" },
      { status: 500 }
    );
  }
}

async function handleDesasignar(ctx: any, rawBody: any) {
  const parsed = desasignarSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message || "Datos inválidos" },
      { status: 400 }
    );
  }
  const body = parsed.data;

  const asignacion = await prisma.opsAsignacionGuardia.findFirst({
    where: { id: body.asignacionId, tenantId: ctx.tenantId, isActive: true },
  });
  if (!asignacion) {
    return NextResponse.json(
      { success: false, error: "Asignación activa no encontrada" },
      { status: 404 }
    );
  }

  const endDate = body.endDate ? parseDateOnly(body.endDate) : parseDateOnly(toISODate(new Date()));

  const updated = await prisma.opsAsignacionGuardia.update({
    where: { id: asignacion.id },
    data: {
      isActive: false,
      endDate,
      reason: body.reason || "Desasignado manualmente",
    },
  });

  await createOpsAuditLog(ctx, "ops.asignacion.closed", "ops_asignacion", asignacion.id, {
    guardiaId: asignacion.guardiaId,
    puestoId: asignacion.puestoId,
    reason: body.reason || "Desasignado manualmente",
  });

  return NextResponse.json({ success: true, data: updated });
}
