import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardCheck, Banknote, Wallet } from 'lucide-react';
import { formatCLP } from '../_lib/hub-utils';
import type { HubFinanceSectionProps } from '../_lib/hub-types';

export function HubFinanceSection({
  financeMetrics,
}: HubFinanceSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            Finanzas - Rendiciones
          </CardTitle>
          <Link
            href="/finanzas"
            className="text-xs font-medium text-primary hover:underline"
          >
            Ir a Finanzas
          </Link>
        </div>
        <CardDescription>
          Resumen de rendiciones pendientes de gestión.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/finanzas?tab=aprobaciones"
            className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/40"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <ClipboardCheck className="h-4 w-4" />
              <p className="text-[11px] uppercase tracking-wider">
                Pendientes de aprobación
              </p>
            </div>
            <p className="mt-2 text-2xl font-semibold">
              {financeMetrics.pendingApprovalCount}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatCLP(financeMetrics.pendingApprovalAmount)} en total
            </p>
          </Link>
          <Link
            href="/finanzas?tab=pagos"
            className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/40"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <Banknote className="h-4 w-4" />
              <p className="text-[11px] uppercase tracking-wider">
                Aprobadas sin pagar
              </p>
            </div>
            <p className="mt-2 text-2xl font-semibold">
              {financeMetrics.approvedUnpaidCount}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatCLP(financeMetrics.approvedUnpaidAmount)} en total
            </p>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
