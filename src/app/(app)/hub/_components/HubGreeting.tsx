import { PageHeader } from '@/components/opai';
import { getGreeting } from '../_lib/hub-utils';
import type { HubGreetingProps } from '../_lib/hub-types';

export function HubGreeting({
  firstName,
  perms,
  opsMetrics,
  crmMetrics,
  financeMetrics,
}: HubGreetingProps) {
  const greeting = getGreeting();

  // Build adaptive subtitle with most relevant info
  const parts: string[] = [];

  if (opsMetrics && perms.hasOps) {
    if (opsMetrics.criticalAlerts > 0) {
      parts.push(`${opsMetrics.criticalAlerts} alerta(s) crítica(s)`);
    }
    if (opsMetrics.attendance.absent > 0) {
      parts.push(`${opsMetrics.attendance.absent} ausencia(s) hoy`);
    }
    if (opsMetrics.pendingTE > 0) {
      parts.push(`${opsMetrics.pendingTE} TE por aprobar`);
    }
  }

  if (crmMetrics && perms.hasCrm) {
    if (crmMetrics.followUpsOverdueCount > 0) {
      parts.push(
        `${crmMetrics.followUpsOverdueCount} seguimiento(s) vencido(s)`,
      );
    } else if (crmMetrics.pendingLeadsCount > 0) {
      parts.push(`${crmMetrics.pendingLeadsCount} leads abiertos`);
    }
  }

  if (financeMetrics && perms.hasFinance) {
    if (financeMetrics.pendingApprovalCount > 0) {
      parts.push(
        `${financeMetrics.pendingApprovalCount} rendición(es) pendiente(s)`,
      );
    }
  }

  const subtitle =
    parts.length > 0
      ? parts.join(' · ')
      : 'Centro de control operacional.';

  return (
    <PageHeader
      title={`${greeting}, ${firstName}`}
      description={subtitle}
    />
  );
}
