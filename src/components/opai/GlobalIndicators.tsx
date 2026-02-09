'use client';

import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { NotificationBell } from './NotificationBell';

interface FxData {
  value: number;
  date?: string;
  month?: string;
}

interface IndicatorsData {
  uf: FxData | null;
  utm: FxData | null;
}

const formatCLP = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

/**
 * GlobalIndicators - Campana + UF + UTM siempre visibles
 *
 * Se muestra en la barra superior (desktop y mobile).
 * Única fuente de verdad: no duplicar en páginas individuales.
 */
export function GlobalIndicators({ compact = false }: { compact?: boolean }) {
  const [data, setData] = useState<IndicatorsData | null>(null);

  const fetchIndicators = useCallback(async () => {
    try {
      const res = await fetch('/api/fx/indicators', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (error) {
      console.error('Error fetching FX indicators:', error);
    }
  }, []);

  useEffect(() => {
    fetchIndicators();
    const interval = setInterval(fetchIndicators, 5 * 60 * 1000); // cada 5 min
    return () => clearInterval(interval);
  }, [fetchIndicators]);

  return (
    <div
      className={cn(
        'flex items-center gap-4',
        compact && 'gap-3'
      )}
    >
      {/* UF */}
      {data?.uf && (
        <div
          className={cn(
            'rounded-lg border border-border bg-card px-3 py-1.5 text-center shrink-0',
            compact && 'px-2 py-1'
          )}
          title={`UF vigente ${data.uf.date || ''}`}
        >
          <p className={cn('text-xs uppercase text-muted-foreground', compact && 'text-[10px]')}>
            UF {data.uf.date || ''}
          </p>
          <p className={cn('text-xs font-mono font-semibold', compact && 'text-[10px]')}>
            {formatCLP(data.uf.value)}
          </p>
        </div>
      )}

      {/* UTM */}
      {data?.utm && (
        <div
          className={cn(
            'rounded-lg border border-border bg-card px-3 py-1.5 text-center shrink-0',
            compact && 'px-2 py-1'
          )}
          title={`UTM ${data.utm.month || ''}`}
        >
          <p className={cn('text-xs uppercase text-muted-foreground', compact && 'text-[10px]')}>
            UTM
          </p>
          <p className={cn('text-xs font-mono font-semibold', compact && 'text-[10px]')}>
            {formatCLP(data.utm.value)}
          </p>
        </div>
      )}

      {/* Campana - siempre visible */}
      <NotificationBell />
    </div>
  );
}
