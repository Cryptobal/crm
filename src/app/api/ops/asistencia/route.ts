import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized } from "@/lib/api-auth";
import { ensureOpsAccess, parseDateOnly, toISODate } from "@/lib/ops";

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return unauthorized();
    const forbidden = ensureOpsAccess(ctx);
    if (forbidden) return forbidden;

    const installationId = request.nextUrl.searchParams.get("installationId") || undefined;
    const dateRaw = request.nextUrl.searchParams.get("date") || toISODate(new Date());

    const date = parseDateOnly(dateRaw);

    // If installationId = "all", get all installations
    const installationFilter = installationId && installationId !== "all"
      ? { installationId }
      : {};

    // Auto-create asistencia rows from pauta mensual (for the date)
    const pauta = await prisma.opsPautaMensual.findMany({
      where: {
        tenantId: ctx.tenantId,
        ...installationFilter,
        date,
      },
      select: {
        puestoId: true,
        slotNumber: true,
        plannedGuardiaId: true,
        installationId: true,
      },
    });

    if (pauta.length > 0) {
      await prisma.opsAsistenciaDiaria.createMany({
        data: pauta.map((item) => ({
          tenantId: ctx.tenantId,
          installationId: item.installationId,
          puestoId: item.puestoId,
          slotNumber: item.slotNumber,
          date,
          plannedGuardiaId: item.plannedGuardiaId,
          attendanceStatus: "pendiente",
          createdBy: ctx.userId,
        })),
        skipDuplicates: true,
      });
    }

    const asistencia = await prisma.opsAsistenciaDiaria.findMany({
      where: {
        tenantId: ctx.tenantId,
        ...installationFilter,
        date,
      },
      include: {
        installation: {
          select: { id: true, name: true },
        },
        puesto: {
          select: {
            id: true,
            name: true,
            shiftStart: true,
            shiftEnd: true,
            teMontoClp: true,
            requiredGuards: true,
          },
        },
        plannedGuardia: {
          select: {
            id: true,
            code: true,
            persona: { select: { firstName: true, lastName: true, rut: true } },
          },
        },
        actualGuardia: {
          select: {
            id: true,
            code: true,
            persona: { select: { firstName: true, lastName: true, rut: true } },
          },
        },
        replacementGuardia: {
          select: {
            id: true,
            code: true,
            persona: { select: { firstName: true, lastName: true, rut: true } },
          },
        },
        turnosExtra: {
          select: {
            id: true,
            status: true,
            amountClp: true,
            guardiaId: true,
          },
        },
      },
      orderBy: [
        { installation: { name: "asc" } },
        { puesto: { name: "asc" } },
        { slotNumber: "asc" },
      ],
    });

    return NextResponse.json({
      success: true,
      data: {
        date: dateRaw,
        items: asistencia,
      },
    });
  } catch (error) {
    console.error("[OPS] Error listing asistencia:", error);
    return NextResponse.json(
      { success: false, error: "No se pudo obtener la asistencia diaria" },
      { status: 500 }
    );
  }
}
