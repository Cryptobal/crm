/**
 * PAYROLL MODULE - DASHBOARD
 */

import Link from "next/link";
import { PageHeader } from "@/components/opai";
import { PayrollSubnav } from "@/components/payroll/PayrollSubnav";
import { Card } from "@/components/ui/card";
import { Calculator, FileText, Settings, ChevronRight } from "lucide-react";

export default function PayrollDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll"
        description="Sistema de liquidaciones y costeo para Chile"
      />
      <PayrollSubnav />

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/payroll/simulator">
          <div className="group flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-all hover:border-border/80 hover:bg-accent/40 hover:shadow-md cursor-pointer">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400">
              <Calculator className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Simulador de Liquidación</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Simula liquidaciones con descuentos legales y costo empleador.
              </p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
          </div>
        </Link>

        <Link href="/payroll/parameters">
          <div className="group flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-all hover:border-border/80 hover:bg-accent/40 hover:shadow-md cursor-pointer">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-400/10 text-blue-400">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Parámetros Legales</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Versiones de tasas, topes y tramos impositivos vigentes.
              </p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
          </div>
        </Link>
      </div>

      {/* Info */}
      <Card className="border-primary/20 bg-primary/5 p-4">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
          <Settings className="h-4 w-4" />
          Información del Sistema
        </h3>
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-primary">·</span>
            <span>
              <strong className="text-foreground">Snapshots inmutables:</strong> Cada simulación guarda los
              parámetros exactos usados
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-primary">·</span>
            <span>
              <strong className="text-foreground">Versionado:</strong> Los parámetros legales se versionan
              por fecha de vigencia
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-primary">·</span>
            <span>
              <strong className="text-foreground">Referencias UF/UTM:</strong> Se obtienen automáticamente
              del schema fx
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
