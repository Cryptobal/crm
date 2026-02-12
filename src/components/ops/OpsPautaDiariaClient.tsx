"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState, StatusBadge } from "@/components/opai";
import { CalendarCheck2, RefreshCw } from "lucide-react";
import { Label } from "@/components/ui/label";

/* ── types ─────────────────────────────────────── */

type ClientOption = {
  id: string;
  name: string;
  installations: { id: string; name: string }[];
};

type GuardiaOption = {
  id: string;
  code?: string | null;
  persona: { firstName: string; lastName: string };
};

type AsistenciaItem = {
  id: string;
  date: string;
  slotNumber: number;
  attendanceStatus: string;
  plannedGuardiaId?: string | null;
  actualGuardiaId?: string | null;
  replacementGuardiaId?: string | null;
  checkInAt?: string | null;
  checkOutAt?: string | null;
  lockedAt?: string | null;
  installation: { id: string; name: string };
  puesto: {
    id: string;
    name: string;
    shiftStart: string;
    shiftEnd: string;
    teMontoClp?: string | number | null;
    requiredGuards?: number;
  };
  plannedGuardia?: {
    id: string;
    code?: string | null;
    persona: { firstName: string; lastName: string };
  } | null;
  actualGuardia?: {
    id: string;
    code?: string | null;
    persona: { firstName: string; lastName: string };
  } | null;
  replacementGuardia?: {
    id: string;
    code?: string | null;
    persona: { firstName: string; lastName: string };
  } | null;
  turnosExtra?: Array<{
    id: string;
    status: string;
    amountClp: string | number;
  }>;
};

interface OpsPautaDiariaClientProps {
  initialClients: ClientOption[];
  guardias: GuardiaOption[];
}

function toDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const STATUS_ICONS: Record<string, string> = {
  pendiente: "⏳",
  asistio: "✅",
  no_asistio: "❌",
  reemplazo: "🔄",
  ppc: "🟡",
};

/* ── component ─────────────────────────────────── */

export function OpsPautaDiariaClient({
  initialClients,
  guardias,
}: OpsPautaDiariaClientProps) {
  const [clients] = useState<ClientOption[]>(initialClients);
  const [clientId, setClientId] = useState<string>("all");
  const [installationId, setInstallationId] = useState<string>("all");
  const [date, setDate] = useState<string>(toDateInput(new Date()));
  const [loading, setLoading] = useState<boolean>(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [items, setItems] = useState<AsistenciaItem[]>([]);

  // Installations from selected client
  const installations = useMemo(() => {
    if (clientId === "all") {
      return clients.flatMap((c) => c.installations);
    }
    return clients.find((c) => c.id === clientId)?.installations ?? [];
  }, [clients, clientId]);

  const fetchAsistencia = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ date });
      if (installationId !== "all") params.set("installationId", installationId);
      const res = await fetch(`/api/ops/asistencia?${params.toString()}`, {
        cache: "no-store",
      });
      const payload = await res.json();
      if (!res.ok || !payload.success)
        throw new Error(payload.error || "Error cargando asistencia");
      setItems(payload.data.items as AsistenciaItem[]);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo cargar la asistencia diaria");
    } finally {
      setLoading(false);
    }
  }, [installationId, date]);

  useEffect(() => {
    void fetchAsistencia();
  }, [fetchAsistencia]);

  // Group by installation
  const grouped = useMemo(() => {
    const map = new Map<string, { name: string; items: AsistenciaItem[] }>();
    for (const item of items) {
      const key = item.installation.id;
      if (!map.has(key)) {
        map.set(key, { name: item.installation.name, items: [] });
      }
      map.get(key)!.items.push(item);
    }
    return Array.from(map.entries()).sort(([, a], [, b]) => a.name.localeCompare(b.name));
  }, [items]);

  // Summary
  const summary = useMemo(() => {
    let total = 0, cubiertos = 0, ppc = 0, te = 0;
    for (const item of items) {
      total++;
      if (item.attendanceStatus === "asistio" || item.attendanceStatus === "reemplazo") cubiertos++;
      if (!item.plannedGuardiaId) ppc++;
      if (item.turnosExtra && item.turnosExtra.length > 0) te++;
    }
    const cobertura = total > 0 ? Math.round((cubiertos / total) * 100) : 0;
    return { total, cubiertos, ppc, te, cobertura };
  }, [items]);

  const patchAsistencia = async (
    id: string,
    payload: Record<string, unknown>,
    successMessage?: string
  ) => {
    setSavingId(id);
    try {
      const res = await fetch(`/api/ops/asistencia/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error || "Error actualizando asistencia");
      setItems((prev) =>
        prev.map((row) => (row.id === id ? (data.data as AsistenciaItem) : row))
      );
      if (successMessage) toast.success(successMessage);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo actualizar la asistencia");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-5">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="space-y-1.5">
              <Label>Cliente</Label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={clientId}
                onChange={(e) => {
                  setClientId(e.target.value);
                  setInstallationId("all");
                }}
              >
                <option value="all">Todos los clientes</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Instalación</Label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={installationId}
                onChange={(e) => setInstallationId(e.target.value)}
              >
                <option value="all">Todas</option>
                {installations.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Fecha</Label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => void fetchAsistencia()} disabled={loading}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Recargar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary bar */}
      {items.length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          {[
            { label: "Total puestos", value: summary.total, color: "text-foreground" },
            { label: "Cubiertos", value: summary.cubiertos, color: "text-emerald-400" },
            { label: "PPC", value: summary.ppc, color: "text-amber-400" },
            { label: "Turnos Extra", value: summary.te, color: "text-rose-400" },
            { label: "Cobertura", value: `${summary.cobertura}%`, color: summary.cobertura >= 80 ? "text-emerald-400" : "text-amber-400" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-3 pb-3 text-center">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Content grouped by installation */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="pt-5">
            <EmptyState
              icon={<CalendarCheck2 className="h-8 w-8" />}
              title="Sin asistencia"
              description="No hay puestos para la fecha seleccionada. Genera primero la pauta mensual."
              compact
            />
          </CardContent>
        </Card>
      ) : (
        grouped.map(([instId, group]) => (
          <Card key={instId}>
            <CardContent className="pt-5 space-y-3">
              <h3 className="text-sm font-semibold text-primary/80 uppercase tracking-wide">
                {group.name}
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="px-2 py-1.5 w-[180px]">Puesto</th>
                      <th className="px-2 py-1.5 w-[140px]">Planificado</th>
                      <th className="px-2 py-1.5 w-[140px]">Real / Reemplazo</th>
                      <th className="px-2 py-1.5 w-[80px] text-center">Horario</th>
                      <th className="px-2 py-1.5 w-[80px] text-center">Check In/Out</th>
                      <th className="px-2 py-1.5 w-[80px] text-center">Estado</th>
                      <th className="px-2 py-1.5 w-[180px]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((item) => {
                      const te = item.turnosExtra?.[0];
                      const isLocked = Boolean(item.lockedAt);
                      return (
                        <tr
                          key={item.id}
                          className={`border-b border-border/50 hover:bg-muted/10 ${
                            isLocked ? "opacity-60" : ""
                          }`}
                        >
                          <td className="px-2 py-2">
                            <div className="font-medium">{item.puesto.name}</div>
                            <div className="text-[10px] text-muted-foreground">Slot {item.slotNumber}</div>
                          </td>
                          <td className="px-2 py-2">
                            {item.plannedGuardia ? (
                              <div>
                                <div>{item.plannedGuardia.persona.firstName} {item.plannedGuardia.persona.lastName}</div>
                                {item.plannedGuardia.code && (
                                  <div className="text-[10px] text-muted-foreground">{item.plannedGuardia.code}</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-amber-400">Sin asignar (PPC)</span>
                            )}
                          </td>
                          <td className="px-2 py-2">
                            {item.attendanceStatus === "reemplazo" && item.replacementGuardia ? (
                              <div>
                                <div className="text-rose-300">
                                  {item.replacementGuardia.persona.firstName} {item.replacementGuardia.persona.lastName}
                                </div>
                                {te && (
                                  <div className="text-[10px] text-amber-400">
                                    TE {te.status} (${Number(te.amountClp).toLocaleString("es-CL")})
                                  </div>
                                )}
                              </div>
                            ) : (
                              <select
                                className="h-7 w-full rounded border border-input bg-background px-1 text-[11px]"
                                value={item.replacementGuardiaId ?? ""}
                                onChange={(e) =>
                                  void patchAsistencia(
                                    item.id,
                                    {
                                      replacementGuardiaId: e.target.value || null,
                                      attendanceStatus: e.target.value ? "reemplazo" : "pendiente",
                                    },
                                    e.target.value ? "Reemplazo asignado" : undefined
                                  )
                                }
                                disabled={savingId === item.id || isLocked}
                              >
                                <option value="">—</option>
                                {guardias.map((g) => (
                                  <option key={g.id} value={g.id}>
                                    {g.persona.firstName} {g.persona.lastName}
                                    {g.code ? ` (${g.code})` : ""}
                                  </option>
                                ))}
                              </select>
                            )}
                          </td>
                          <td className="px-2 py-2 text-center text-muted-foreground">
                            {item.puesto.shiftStart}-{item.puesto.shiftEnd}
                          </td>
                          <td className="px-2 py-2 text-center text-[10px] text-muted-foreground">
                            {item.checkInAt
                              ? new Date(item.checkInAt).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })
                              : "—"}
                            {" / "}
                            {item.checkOutAt
                              ? new Date(item.checkOutAt).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })
                              : "—"}
                          </td>
                          <td className="px-2 py-2 text-center">
                            <span title={item.attendanceStatus} className="text-base">
                              {STATUS_ICONS[item.attendanceStatus] ?? "—"}
                            </span>
                          </td>
                          <td className="px-2 py-2">
                            <div className="flex flex-wrap gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-[10px] px-2"
                                disabled={savingId === item.id || isLocked}
                                onClick={() =>
                                  void patchAsistencia(
                                    item.id,
                                    {
                                      attendanceStatus: "asistio",
                                      actualGuardiaId:
                                        item.replacementGuardiaId ??
                                        item.actualGuardiaId ??
                                        item.plannedGuardiaId ??
                                        null,
                                    },
                                    "Asistencia marcada"
                                  )
                                }
                              >
                                Asistió
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-[10px] px-2"
                                disabled={savingId === item.id || isLocked}
                                onClick={() =>
                                  void patchAsistencia(
                                    item.id,
                                    { attendanceStatus: "no_asistio", actualGuardiaId: null },
                                    "No asistió"
                                  )
                                }
                              >
                                No asistió
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
