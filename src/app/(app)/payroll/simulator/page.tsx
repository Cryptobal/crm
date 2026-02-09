/**
 * PAYROLL SIMULATOR COMPLETO
 * Todos los conceptos según legislación chilena
 */

"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/opai";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/opai/LoadingState";
import { formatCLP, formatNumber, parseLocalizedNumber } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, Calculator, Info, Settings } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const selectClass =
  "flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export default function PayrollSimulator() {
  const [baseSalary, setBaseSalary] = useState("550000");
  const [includeGrat, setIncludeGrat] = useState(true);
  const [overtimeHours, setOvertimeHours] = useState("");
  const [commissions, setCommissions] = useState("");
  const [bonuses, setBonuses] = useState("");
  const [transport, setTransport] = useState("");
  const [meal, setMeal] = useState("");
  const [numDependents, setNumDependents] = useState("");
  const [contractType, setContractType] = useState<"indefinite" | "fixed_term">("indefinite");
  const [afpName, setAfpName] = useState("capital");
  const [healthSystem, setHealthSystem] = useState<"fonasa" | "isapre">("fonasa");
  const [isapre_additional, setIsapreAdditional] = useState("");
  const [apv, setApv] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [parameters, setParameters] = useState<any>(null);
  const [mobileSection, setMobileSection] = useState<'haberes' | 'descuentos' | 'resultado'>('haberes');

  useEffect(() => {
    fetchParameters();
  }, []);

  const fetchParameters = async () => {
    try {
      const response = await fetch("/api/payroll/parameters?active_only=true");
      const data = await response.json();
      if (data.success) setParameters(data.data.current_version);
    } catch (err) {
      console.error("Error loading parameters:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const base = parseLocalizedNumber(baseSalary);
      const overtime = overtimeHours
        ? Math.round(parseLocalizedNumber(overtimeHours) * base * 0.0077777)
        : 0;
      const baseForGratification = base + overtime;
      const gratification = includeGrat ? Math.round(baseForGratification * 0.25) : 0;

      const totalIncome =
        base +
        gratification +
        overtime +
        (commissions ? parseLocalizedNumber(commissions) : 0) +
        (bonuses ? parseLocalizedNumber(bonuses) : 0);
      let familyAllowance = 0;
      if (numDependents && parseLocalizedNumber(numDependents) > 0) {
        const deps = Math.round(parseLocalizedNumber(numDependents));
        if (totalIncome <= 631976) familyAllowance = deps * 22007;
        else if (totalIncome <= 923067) familyAllowance = deps * 13505;
        else if (totalIncome <= 1439668) familyAllowance = deps * 4267;
      }

      const response = await fetch("/api/payroll/simulator/compute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base_salary_clp: base,
          other_taxable_allowances:
            gratification +
            overtime +
            (commissions ? parseLocalizedNumber(commissions) : 0) +
            (bonuses ? parseLocalizedNumber(bonuses) : 0),
          non_taxable_allowances: {
            transport: transport ? parseLocalizedNumber(transport) : 0,
            meal: meal ? parseLocalizedNumber(meal) : 0,
            family: familyAllowance,
          },
          contract_type: contractType,
          afp_name: afpName,
          health_system: healthSystem,
          health_plan_pct:
            healthSystem === "isapre" && isapre_additional
              ? 0.07 + parseLocalizedNumber(isapre_additional) / 100
              : 0.07,
          additional_deductions: { other: apv ? parseLocalizedNumber(apv) : 0 },
          save_simulation: true,
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error?.message || "Error");
      setResult(data.data);
      setMobileSection('resultado');
    } catch (err: any) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (v: number) => formatCLP(Math.round(v));
  const fmtPct = (v: number, decimals = 2) =>
    `${formatNumber(v * 100, { minDecimals: decimals, maxDecimals: decimals })}%`;
  const baseNum = parseLocalizedNumber(baseSalary || "0");
  const overtimeNum = overtimeHours
    ? Math.round(parseLocalizedNumber(overtimeHours) * baseNum * 0.0077777)
    : 0;
  const gratPreview = includeGrat ? Math.round((baseNum + overtimeNum) * 0.25) : 0;

  const ufValue = parameters?.parameters_snapshot?.references_at_calculation?.uf_clp || 39703.50;
  const utmValue = parameters?.parameters_snapshot?.references_at_calculation?.utm_clp || 69611;
  const ufDate = parameters?.parameters_snapshot?.references_at_calculation?.uf_date || "2026-02-01";

  const mobileTabs = [
    { key: 'haberes' as const, label: 'Haberes' },
    { key: 'descuentos' as const, label: 'Descuentos' },
    { key: 'resultado' as const, label: 'Resultado' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Link href="/payroll">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <PageHeader title="Simulador de Liquidación" description="Cálculo completo según ley chilena" />
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1 text-xs">
            <span className="text-muted-foreground">UF</span>
            <span className="font-mono font-medium">{formatCLP(ufValue)}</span>
            <span className="text-border">|</span>
            <span className="text-muted-foreground">UTM</span>
            <span className="font-mono font-medium">{formatCLP(utmValue)}</span>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Parámetros</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Parámetros Legales Vigentes</DialogTitle>
              </DialogHeader>

              {parameters && (
                <div className="space-y-4">
                  <Badge variant="default">{parameters.effective_from}</Badge>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-border bg-card p-3">
                      <h4 className="mb-2 text-sm font-medium">AFP</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Base:</span>
                          <span className="font-mono">10%</span>
                        </div>
                        <div className="mt-2 space-y-0.5 border-t border-border pt-1">
                          {Object.entries(parameters.data.afp.commissions).map(([name, config]: any) => (
                            <div key={name} className="flex justify-between">
                              <span className="capitalize text-muted-foreground">{name}</span>
                              <span className="font-mono">{fmtPct(parameters.data.afp.base_rate + config.commission_rate)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                      <h4 className="mb-2 text-sm font-medium">SIS (Empleador)</h4>
                      <div className="flex justify-between text-xs">
                        <span className="text-primary">Tasa:</span>
                        <span className="font-mono font-semibold text-primary">{fmtPct(parameters.data.sis.employer_rate)}</span>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-3">
                      <h4 className="mb-2 text-sm font-medium">Mutual</h4>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Base legal:</span>
                        <span className="font-mono">{fmtPct(parameters.data.work_injury.base_rate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-card p-3">
                    <h4 className="mb-2 text-sm font-medium">Topes Imponibles</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pensiones:</span>
                        <span className="font-mono">{parameters.data.caps.pension_uf} UF</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">AFC:</span>
                        <span className="font-mono">{parameters.data.caps.afc_uf} UF</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-400">
                      <Info className="h-3.5 w-3.5" />
                      Referencias Vigentes
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">UF ({ufDate}):</span>
                        <span className="font-mono">{formatCLP(ufValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">UTM:</span>
                        <span className="font-mono">{formatCLP(utmValue)}</span>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      UF se actualiza diariamente. UTM mensualmente. Valores capturados en snapshot inmutable.
                    </p>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ── FORMULARIO ── */}
        <Card className="p-4">
          {/* Mobile tabs */}
          <div className="mb-4 flex gap-1 rounded-md border border-border bg-muted/30 p-1 lg:hidden">
            {mobileTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setMobileSection(tab.key)}
                className={cn(
                  "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                  mobileSection === tab.key
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* HABERES */}
            <div className={cn(mobileSection !== 'haberes' && 'hidden lg:block', 'space-y-3')}>
              <h3 className="text-xs font-medium uppercase tracking-wide text-emerald-400">+ Haberes</h3>

              <div className="space-y-1.5">
                <Label>Sueldo Base</Label>
                <Input type="text" inputMode="numeric" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} className="font-mono" required />
              </div>

              <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="checkbox" checked={includeGrat} onChange={(e) => setIncludeGrat(e.target.checked)} className="h-4 w-4 rounded border-input accent-primary" />
                  Gratificación 25%
                </label>
                {includeGrat && <span className="font-mono text-xs text-emerald-400">+{fmt(gratPreview)}</span>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Horas Extra 50%</Label>
                  <Input type="text" inputMode="numeric" value={overtimeHours} onChange={(e) => setOvertimeHours(e.target.value)} placeholder="0" className="font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label>Comisiones</Label>
                  <Input type="text" inputMode="numeric" value={commissions} onChange={(e) => setCommissions(e.target.value)} placeholder="0" className="font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Bonos</Label>
                  <Input type="text" inputMode="numeric" value={bonuses} onChange={(e) => setBonuses(e.target.value)} placeholder="0" className="font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label>Cargas familiares</Label>
                  <Input type="text" inputMode="numeric" value={numDependents} onChange={(e) => setNumDependents(e.target.value)} placeholder="0" className="font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Colación</Label>
                  <Input type="text" inputMode="numeric" value={meal} onChange={(e) => setMeal(e.target.value)} placeholder="0" className="font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label>Movilización</Label>
                  <Input type="text" inputMode="numeric" value={transport} onChange={(e) => setTransport(e.target.value)} placeholder="0" className="font-mono" />
                </div>
              </div>
            </div>

            {/* DESCUENTOS */}
            <div className={cn(mobileSection !== 'descuentos' && 'hidden lg:block', 'space-y-3 border-t border-border pt-4')}>
              <h3 className="text-xs font-medium uppercase tracking-wide text-red-400">- Descuentos</h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Contrato</Label>
                  <select value={contractType} onChange={(e) => setContractType(e.target.value as any)} className={selectClass}>
                    <option value="indefinite">Indefinido</option>
                    <option value="fixed_term">Plazo Fijo</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Salud</Label>
                  <select value={healthSystem} onChange={(e) => setHealthSystem(e.target.value as any)} className={selectClass}>
                    <option value="fonasa">Fonasa 7%</option>
                    <option value="isapre">Isapre</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>AFP</Label>
                <select value={afpName} onChange={(e) => setAfpName(e.target.value)} className={selectClass}>
                  <option value="capital">Capital (11,44%)</option>
                  <option value="cuprum">Cuprum (11,44%)</option>
                  <option value="habitat">Habitat (11,27%)</option>
                  <option value="modelo">Modelo (10,58%)</option>
                  <option value="planvital">PlanVital (11,16%)</option>
                  <option value="provida">Provida (11,45%)</option>
                  <option value="uno">Uno (10,46%)</option>
                </select>
              </div>

              {healthSystem === "isapre" && (
                <div className="space-y-1.5">
                  <Label>Isapre Adicional (%)</Label>
                  <Input type="text" inputMode="decimal" value={isapre_additional} onChange={(e) => setIsapreAdditional(e.target.value)} placeholder="0" className="font-mono" />
                </div>
              )}

              <div className="space-y-1.5">
                <Label>APV (opcional)</Label>
                <Input type="text" inputMode="numeric" value={apv} onChange={(e) => setApv(e.target.value)} placeholder="0" className="font-mono" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className={cn("w-full gap-2", mobileSection === 'resultado' && 'hidden lg:flex')}
            >
              {loading ? (
                "Calculando..."
              ) : (
                <>
                  <Calculator className="h-4 w-4" />
                  Calcular Liquidación
                </>
              )}
            </Button>
          </form>

          {error && (
            <div className="mt-3 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-xs text-red-400">{error}</div>
          )}
        </Card>

        {/* ── RESULTADOS ── */}
        <div className={cn(mobileSection !== 'resultado' && 'hidden lg:block', 'space-y-4')}>
          {!result ? (
            <Card className="flex min-h-[300px] items-center justify-center">
              <p className="text-sm text-muted-foreground">Completa el formulario y presiona Calcular</p>
            </Card>
          ) : (
            <>
              {/* KPI resumen */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="border-emerald-500/20 bg-emerald-500/5 p-3">
                  <p className="text-xs uppercase text-muted-foreground">Líquido</p>
                  <p className="mt-1 font-mono text-xl font-bold text-emerald-400">{fmt(result.net_salary)}</p>
                </Card>
                <Card className="border-blue-500/20 bg-blue-500/5 p-3">
                  <p className="text-xs uppercase text-muted-foreground">Costo Empresa</p>
                  <p className="mt-1 font-mono text-xl font-bold text-blue-400">{fmt(result.total_employer_cost)}</p>
                </Card>
              </div>

              {/* Desglose */}
              <Card className="p-4 space-y-4">
                {/* Haberes */}
                <div>
                  <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-emerald-400">+ Haberes</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Base</span><span className="font-mono">{fmt(baseNum)}</span></div>
                    {overtimeHours && Number(overtimeHours) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">HE 50% ({overtimeHours}h)</span><span className="font-mono text-emerald-400">+{fmt(overtimeNum)}</span></div>}
                    {includeGrat && <div className="flex justify-between"><span className="text-muted-foreground">Gratif. 25%</span><span className="font-mono text-emerald-400">+{fmt(gratPreview)}</span></div>}
                    {commissions && Number(commissions) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Comisiones</span><span className="font-mono text-emerald-400">+{fmt(Number(commissions))}</span></div>}
                    {bonuses && Number(bonuses) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Bonos</span><span className="font-mono text-emerald-400">+{fmt(Number(bonuses))}</span></div>}
                    <div className="flex justify-between border-t border-border pt-1 font-medium"><span>Imponible</span><span className="font-mono">{fmt(result.total_taxable_income)}</span></div>
                    {(transport || meal || numDependents) && (
                      <>
                        {transport && Number(transport) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Movilización</span><span className="font-mono">+{fmt(Number(transport))}</span></div>}
                        {meal && Number(meal) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Colación</span><span className="font-mono">+{fmt(Number(meal))}</span></div>}
                        {numDependents && Number(numDependents) > 0 && result.total_non_taxable_income > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Asig. Familiar</span><span className="font-mono">+{fmt(result.total_non_taxable_income - (transport ? Number(transport) : 0) - (meal ? Number(meal) : 0))}</span></div>}
                        <div className="flex justify-between border-t border-border pt-1 font-medium"><span>Bruto Total</span><span className="font-mono">{fmt(result.gross_salary)}</span></div>
                      </>
                    )}
                  </div>
                </div>

                {/* Descuentos */}
                <div>
                  <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-red-400">- Descuentos</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">AFP {fmtPct(result.deductions.afp.total_rate)}</span><span className="font-mono text-red-400">-{fmt(result.deductions.afp.amount)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Salud {fmtPct(result.deductions.health.rate, 1)}</span><span className="font-mono text-red-400">-{fmt(result.deductions.health.amount)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">AFC {fmtPct(result.deductions.afc.total_rate, 1)}</span><span className="font-mono text-red-400">-{fmt(result.deductions.afc.amount)}</span></div>
                    {apv && Number(apv) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">APV</span><span className="font-mono text-red-400">-{fmt(Number(apv))}</span></div>}
                    <div className="flex justify-between"><span className="text-muted-foreground">Impuesto</span><span className="font-mono text-red-400">{result.deductions.tax.amount > 0 ? '-' : ''}{fmt(result.deductions.tax.amount)}</span></div>
                  </div>
                </div>

                {/* Líquido destacado */}
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-medium uppercase text-emerald-400">Líquido a Pagar</span>
                    <span className="font-mono text-2xl font-bold text-emerald-400">{fmt(result.net_salary)}</span>
                  </div>
                </div>

                {/* Empleador */}
                <div className="border-t border-border pt-3">
                  <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-blue-400">Aportes Empleador</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">SIS {fmtPct(result.employer_cost.sis.rate)}</span><span className="font-mono text-blue-400">+{fmt(result.employer_cost.sis.amount)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">AFC {fmtPct(result.employer_cost.afc.total_rate, 1)}</span><span className="font-mono text-blue-400">+{fmt(result.employer_cost.afc.total_amount)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Mutual {fmtPct(result.employer_cost.work_injury.rate)}</span><span className="font-mono text-blue-400">+{fmt(result.employer_cost.work_injury.amount)}</span></div>
                    <div className="flex justify-between border-t border-border pt-1 font-medium"><span>Total Empresa</span><span className="font-mono text-blue-400">{fmt(result.total_employer_cost)}</span></div>
                  </div>
                </div>

                {result.simulation_id && (
                  <div className="rounded-md bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                    ID: {result.simulation_id.slice(0, 8)}
                    <Badge variant="outline" className="ml-2">Inmutable</Badge>
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
