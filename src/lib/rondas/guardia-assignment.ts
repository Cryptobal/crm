import { prisma } from "@/lib/prisma";

type AssignmentSource = "asistencia_actual" | "asistencia_reemplazo" | "asistencia_planificada" | "asignacion_guardia";

export interface GuardiaAssignmentResult {
  guardiaId: string | null;
  source: AssignmentSource | null;
}

function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function endOfDay(date: Date): Date {
  const start = startOfDay(date);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
}

export async function resolveOnDutyGuardiaForInstallation(input: {
  tenantId: string;
  installationId: string;
  scheduledAt: Date;
}): Promise<GuardiaAssignmentResult> {
  const dayStart = startOfDay(input.scheduledAt);
  const dayEnd = endOfDay(input.scheduledAt);

  const attendanceRows = await prisma.opsAsistenciaDiaria.findMany({
    where: {
      tenantId: input.tenantId,
      installationId: input.installationId,
      date: { gte: dayStart, lte: dayEnd },
    },
    select: {
      slotNumber: true,
      plannedGuardiaId: true,
      actualGuardiaId: true,
      replacementGuardiaId: true,
      checkInAt: true,
    },
    orderBy: [{ checkInAt: "desc" }, { slotNumber: "asc" }],
  });

  for (const row of attendanceRows) {
    if (row.actualGuardiaId) return { guardiaId: row.actualGuardiaId, source: "asistencia_actual" };
    if (row.replacementGuardiaId) return { guardiaId: row.replacementGuardiaId, source: "asistencia_reemplazo" };
    if (row.plannedGuardiaId) return { guardiaId: row.plannedGuardiaId, source: "asistencia_planificada" };
  }

  const fallback = await prisma.opsAsignacionGuardia.findFirst({
    where: {
      tenantId: input.tenantId,
      installationId: input.installationId,
      isActive: true,
      startDate: { lte: dayEnd },
      OR: [{ endDate: null }, { endDate: { gte: dayStart } }],
    },
    select: { guardiaId: true },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });

  if (!fallback?.guardiaId) return { guardiaId: null, source: null };
  return { guardiaId: fallback.guardiaId, source: "asignacion_guardia" };
}
