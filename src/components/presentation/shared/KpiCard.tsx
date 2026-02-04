'use client';

/**
 * KpiCard - Componente para mostrar métricas clave
 * Usado en múltiples secciones para mostrar KPIs de forma consistente
 */

import { KpiMetric } from '@/types/presentation';
import { useThemeClasses } from '../ThemeProvider';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  metric: KpiMetric;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function KpiCard({ metric, className, size = 'md' }: KpiCardProps) {
  const theme = useThemeClasses();
  
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const valueSizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-5xl',
  };
  
  return (
    <div
      className={cn(
        'rounded-lg border backdrop-blur-sm transition-all hover:scale-105',
        theme.border,
        theme.secondary,
        sizeClasses[size],
        className
      )}
    >
      <div className="flex flex-col gap-2">
        {/* Valor principal */}
        <div className={cn(
          'font-bold',
          theme.accent.replace('bg-', 'text-'),
          valueSizeClasses[size]
        )}>
          {metric.value}
        </div>
        
        {/* Label */}
        <div className={cn('text-sm font-medium', theme.text)}>
          {metric.label}
        </div>
        
        {/* Delta (opcional) */}
        {metric.delta && (
          <div className="text-xs text-green-400 font-medium">
            {metric.delta}
          </div>
        )}
        
        {/* Nota (opcional) */}
        {metric.note && (
          <div className={cn('text-xs mt-2', theme.textMuted)}>
            {metric.note}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Grid de KPI Cards
 */
interface KpiGridProps {
  metrics: KpiMetric[];
  columns?: 2 | 3 | 4;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function KpiGrid({ 
  metrics, 
  columns = 4, 
  size = 'md',
  className 
}: KpiGridProps) {
  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };
  
  return (
    <div className={cn(
      'grid gap-4',
      gridClasses[columns],
      className
    )}>
      {metrics.map((metric, index) => (
        <KpiCard key={index} metric={metric} size={size} />
      ))}
    </div>
  );
}
