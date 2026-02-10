/**
 * Tarjeta de puesto de trabajo CPQ
 */

"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditPositionModal } from "@/components/cpq/EditPositionModal";
import { CostBreakdownModal } from "@/components/cpq/CostBreakdownModal";
import { formatCurrency, sortWeekdays } from "@/components/cpq/utils";
import { cn } from "@/lib/utils";
import type { CpqPosition } from "@/types/cpq";
import { Copy, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface CpqPositionCardProps {
  quoteId: string;
  position: CpqPosition;
  onUpdated?: () => void;
  readOnly?: boolean;
  totalGuards?: number;
  baseAdditionalCostsTotal?: number;
  marginPct?: number;
  financialRatePct?: number;
  policyRatePct?: number;
  monthlyHours?: number;
  policyContractMonths?: number;
  policyContractPct?: number;
  contractMonths?: number;
}

export function CpqPositionCard({
  quoteId,
  position,
  onUpdated,
  readOnly = false,
  totalGuards = 1,
  baseAdditionalCostsTotal = 0,
  marginPct = 20,
  financialRatePct = 0,
  policyRatePct = 0,
  monthlyHours = 180,
  policyContractMonths = 12,
  policyContractPct = 100,
  contractMonths = 12,
}: CpqPositionCardProps) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openBreakdown, setOpenBreakdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const positionGuards = position.numGuards;
  const proportion = totalGuards > 0 ? positionGuards / totalGuards : 0;
  const baseAdditionalCostsForPosition = baseAdditionalCostsTotal * proportion;
  const totalCostPosition = Number(position.monthlyPositionCost) + baseAdditionalCostsForPosition;
  const marginRate = marginPct / 100;
  const baseWithMargin = marginRate < 1 ? totalCostPosition / (1 - marginRate) : totalCostPosition;
  const policyFactor =
    contractMonths > 0 ? (policyContractMonths * (policyContractPct / 100)) / contractMonths : 0;
  const financialCost = baseWithMargin * (financialRatePct / 100);
  const policyCost = baseWithMargin * (policyRatePct / 100) * policyFactor;
  const salePricePosition = baseWithMargin + financialCost + policyCost;
  const hourlyRate = monthlyHours > 0 ? salePricePosition / monthlyHours : 0;

  const handleRecalculate = async () => {
    setLoading(true);
    try {
      await fetch(`/api/cpq/quotes/${quoteId}/positions/${position.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceRecalculate: true }),
      });
      onUpdated?.();
    } catch (err) {
      console.error("Error recalculating position:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Eliminar este puesto?")) return;
    setLoading(true);
    try {
      await fetch(`/api/cpq/quotes/${quoteId}/positions/${position.id}`, {
        method: "DELETE",
      });
      onUpdated?.();
    } catch (err) {
      console.error("Error deleting position:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClone = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cpq/quotes/${quoteId}/positions/${position.id}/clone`, {
        method: "POST",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success("Puesto clonado");
      onUpdated?.();
    } catch (err) {
      console.error("Error cloning position:", err);
      toast.error("No se pudo clonar el puesto");
    } finally {
      setLoading(false);
    }
  };

  const dayAlias: Record<string, string> = {
    lun: "Lun", lunes: "Lun",
    mar: "Mar", martes: "Mar",
    mie: "Mié", "mié": "Mié", miercoles: "Mié", miércoles: "Mié",
    jue: "Jue", jueves: "Jue",
    vie: "Vie", viernes: "Vie",
    sab: "Sáb", "sáb": "Sáb", sabado: "Sáb", sábado: "Sáb",
    dom: "Dom", domingo: "Dom",
  };
  const dayOrder = new Map([["Lun", 0], ["Mar", 1], ["Mié", 2], ["Jue", 3], ["Vie", 4], ["Sáb", 5], ["Dom", 6]]);
  const dayChips = sortWeekdays(
    Array.from(
      new Set(
        (position.weekdays || [])
          .map((d) => dayAlias[String(d).trim().toLowerCase()] || null)
          .filter((d): d is string => Boolean(d))
      )
    )
  ).sort((a, b) => (dayOrder.get(a) ?? 99) - (dayOrder.get(b) ?? 99));
  const isAllDays = dayChips.length === 7;
  const title = position.customName || position.puestoTrabajo?.name || "Puesto";
  const roleName = position.rol?.name || "—";

  return (
    <Card className="overflow-hidden border border-muted/40">
      <div className="flex items-start justify-between gap-3 border-b bg-muted/20 p-3">
        <div
          className={cn("flex-1", !readOnly && "cursor-pointer hover:text-primary transition-colors")}
          onClick={readOnly ? undefined : () => setOpenEdit(true)}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-300">
              {position.numGuards} {position.numGuards === 1 ? "guardia" : "guardias"}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">{roleName}</Badge>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {isAllDays ? (
              <Badge className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" variant="outline">
                Todos los días
              </Badge>
            ) : dayChips.length > 0 ? (
              dayChips.map((day) => (
                <Badge
                  key={day}
                  className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  variant="outline"
                >
                  {day}
                </Badge>
              ))
            ) : (
              <Badge className="text-[10px]" variant="outline">Sin días</Badge>
            )}
          </div>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setOpenEdit(true)} title="Editar">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleClone} disabled={loading} title="Clonar">
              <Copy className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleRecalculate} disabled={loading} title="Recalcular costo">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={handleDelete} disabled={loading} title="Eliminar">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3">
        <div className="rounded-md border border-border/60 bg-muted/20 p-2 text-foreground">
          <p className="text-xs uppercase text-muted-foreground">Base c/u</p>
          <p className="text-sm sm:text-xs font-semibold">{formatCurrency(Number(position.baseSalary))}</p>
        </div>
        <div className="rounded-md border border-border/60 bg-muted/20 p-2 text-foreground">
          <p className="text-xs uppercase text-muted-foreground">Líquido c/u</p>
          <p className="text-sm sm:text-xs font-semibold">
            {formatCurrency(Number(position.netSalary || 0))}
          </p>
        </div>
        <div className="rounded-md border border-border/60 bg-muted/20 p-2 text-foreground">
          <p className="text-xs uppercase text-muted-foreground">Empresa c/u</p>
          <p className="text-sm sm:text-xs font-semibold">
            {formatCurrency(Number(position.employerCost))}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t bg-muted/10 px-3 py-2">
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
          <p className="text-xs sm:text-xs text-muted-foreground">
            Total puesto ({position.numGuards}):{" "}
            <span className="font-mono text-foreground">
              {formatCurrency(Number(position.monthlyPositionCost))}
            </span>
          </p>
          <p className="text-xs sm:text-xs text-emerald-400">
            Valor hora:{" "}
            <span className="font-mono font-semibold">
              {formatCurrency(hourlyRate)}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-9 sm:h-7 px-3 sm:px-2 text-xs sm:text-xs" onClick={() => setOpenBreakdown(true)}>
            Ver desglose
          </Button>
        </div>
        <EditPositionModal
          quoteId={quoteId}
          position={position}
          open={openEdit}
          onOpenChange={setOpenEdit}
          onUpdated={onUpdated}
        />
        <CostBreakdownModal
          open={openBreakdown}
          onOpenChange={setOpenBreakdown}
          position={position}
        />
      </div>
    </Card>
  );
}
