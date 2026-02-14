import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HubCompactStat } from './HubCompactStat';
import type { HubEstadoOperacionalProps } from '../_lib/hub-types';

export function HubEstadoOperacional({
  opsMetrics,
}: HubEstadoOperacionalProps) {
  const { attendance, rounds } = opsMetrics;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Attendance today */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">Asistencia hoy</CardTitle>
            <Link
              href="/ops/pauta-diaria"
              className="text-xs font-medium text-primary hover:underline"
            >
              Ver pauta diaria
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <HubCompactStat label="Presente" value={attendance.present} />
            <HubCompactStat label="Ausente" value={attendance.absent} />
            <HubCompactStat label="Pendiente" value={attendance.pending} />
            <HubCompactStat label="Reemplazo" value={attendance.replacement} />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Cobertura: {attendance.coveragePercent}% (
              {attendance.present + attendance.replacement}/{attendance.total})
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Rounds today */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">Rondas hoy</CardTitle>
            <Link
              href="/ops/rondas"
              className="text-xs font-medium text-primary hover:underline"
            >
              Ver rondas
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <HubCompactStat label="Programadas" value={rounds.scheduled} />
            <HubCompactStat label="Completadas" value={rounds.completed} />
            <HubCompactStat label="En curso" value={rounds.inProgress} />
            <HubCompactStat label="Perdidas" value={rounds.missed} />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Completadas: {rounds.completionPercent}% (
              {rounds.completed}/{rounds.scheduled})
            </span>
            {opsMetrics.unresolvedAlerts > 0 && (
              <Link
                href="/ops/rondas/alertas"
                className="font-medium text-amber-400 hover:underline"
              >
                {opsMetrics.unresolvedAlerts} alerta(s) sin resolver
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
