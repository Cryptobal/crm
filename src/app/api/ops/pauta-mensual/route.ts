import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseBody, requireAuth, unauthorized } from "@/lib/api-auth";
import { upsertPautaItemSchema } from "@/lib/validations/ops";
import {
  createOpsAuditLog,
  ensureOpsAccess,
  getMonthDateRange,
  parseDateOnly,
} from "@/lib/ops";

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return unauthorized();
    const forbidden = ensureOpsAccess(ctx);
    if (forbidden) return forbidden;

    const installationId = request.nextUrl.searchParams.get("installationId") || undefined;
    const month = Number(request.nextUrl.searchParams.get("month") || new Date().getUTCMonth() + 1);
    const year = Number(request.nextUrl.searchParams.get("year") || new Date().getUTCFullYear());

    if (!installationId) {
      return NextResponse.json(
        { success: false, error: "installationId es requerido" },
        { status: 400 }
      );
    }

    const { start, end } = getMonthDateRange(year, month);

    const pauta = await prisma.opsPautaMensual.findMany({
      where: {
        tenantId: ctx.tenantId,
        installationId,
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        puesto: {
          select: {
            id: true,
            name: true,
            shiftStart: true,
            shiftEnd: true,
            weekdays: true,
            requiredGuards: true,
          },
        },
        plannedGuardia: {
          select: {
            id: true,
            code: true,
            status: true,
            persona: {
              select: {
                firstName: true,
                lastName: true,
                rut: true,
              },
            },
          },
        },
      },
      orderBy: [{ puestoId: "asc" }, { slotNumber: "asc" }, { date: "asc" }],
    });

    // Also get active series for this installation
    const puestoIds = [...new Set(pauta.map((p) => p.puestoId))];
    const series = puestoIds.length > 0
      ? await prisma.opsSerieAsignacion.findMany({
          where: {
            tenantId: ctx.tenantId,
            puestoId: { in: puestoIds },
            isActive: true,
          },
          include: {
            guardia: {
              select: {
                id: true,
                code: true,
                persona: {
                  select: { firstName: true, lastName: true },
                },
              },
            },
          },
        })
      : [];

    // Also get active guard assignments for this installation
    const asignaciones = await prisma.opsAsignacionGuardia.findMany({
      where: {
        tenantId: ctx.tenantId,
        installationId,
        isActive: true,
      },
      select: {
        puestoId: true,
        slotNumber: true,
        guardiaId: true,
        guardia: {
          select: {
            id: true,
            code: true,
            persona: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        month,
        year,
        installationId,
        items: pauta,
        series,
        asignaciones,
      },
    });
  } catch (error) {
    console.error("[OPS] Error listing pauta mensual:", error);
    return NextResponse.json(
      { success: false, error: "No se pudo obtener la pauta mensual" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return unauthorized();
    const forbidden = ensureOpsAccess(ctx);
    if (forbidden) return forbidden;

    const parsed = await parseBody(request, upsertPautaItemSchema);
    if (parsed.error) return parsed.error;
    const body = parsed.data;

    const puesto = await prisma.opsPuestoOperativo.findFirst({
      where: { id: body.puestoId, tenantId: ctx.tenantId },
      select: { id: true, installationId: true },
    });
    if (!puesto) {
      return NextResponse.json(
        { success: false, error: "Puesto operativo no encontrado" },
        { status: 404 }
      );
    }

    if (body.plannedGuardiaId) {
      const guardia = await prisma.opsGuardia.findFirst({
        where: { id: body.plannedGuardiaId, tenantId: ctx.tenantId },
        select: { id: true, isBlacklisted: true, status: true },
      });
      if (!guardia) {
        return NextResponse.json(
          { success: false, error: "Guardia no encontrado" },
          { status: 404 }
        );
      }
      if (guardia.isBlacklisted || guardia.status !== "active") {
        return NextResponse.json(
          { success: false, error: "No se puede asignar un guardia inactivo o en lista negra" },
          { status: 400 }
        );
      }
    }

    const date = parseDateOnly(body.date);

    const pauta = await prisma.opsPautaMensual.upsert({
      where: {
        puestoId_slotNumber_date: {
          puestoId: body.puestoId,
          slotNumber: body.slotNumber,
          date,
        },
      },
      create: {
        tenantId: ctx.tenantId,
        installationId: puesto.installationId,
        puestoId: body.puestoId,
        slotNumber: body.slotNumber,
        date,
        plannedGuardiaId: body.plannedGuardiaId ?? null,
        shiftCode: body.shiftCode ?? null,
        status: body.status,
        notes: body.notes ?? null,
        createdBy: ctx.userId,
      },
      update: {
        plannedGuardiaId: body.plannedGuardiaId ?? null,
        shiftCode: body.shiftCode ?? null,
        status: body.status,
        notes: body.notes ?? null,
      },
      include: {
        puesto: {
          select: { id: true, name: true, shiftStart: true, shiftEnd: true },
        },
        plannedGuardia: {
          select: {
            id: true,
            code: true,
            persona: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    await createOpsAuditLog(ctx, "ops.pauta.upsert", "ops_pauta", pauta.id, {
      puestoId: body.puestoId,
      slotNumber: body.slotNumber,
      date: body.date,
      plannedGuardiaId: body.plannedGuardiaId ?? null,
      shiftCode: body.shiftCode ?? null,
    });

    return NextResponse.json({ success: true, data: pauta });
  } catch (error) {
    console.error("[OPS] Error upserting pauta item:", error);
    return NextResponse.json(
      { success: false, error: "No se pudo guardar la pauta" },
      { status: 500 }
    );
  }
}
