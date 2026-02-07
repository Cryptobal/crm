import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type TrendType = 'up' | 'down' | 'neutral';
export type KpiVariant = 'default' | 'blue' | 'emerald' | 'purple' | 'amber' | 'indigo' | 'sky' | 'teal';
export type KpiSize = 'sm' | 'md' | 'lg';

export interface KpiCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: TrendType;
  trendValue?: string;
  className?: string;
  variant?: KpiVariant;
  size?: KpiSize;
  tooltip?: ReactNode;
}

/**
 * KpiCard - Card estándar para mostrar métricas y KPIs
 * 
 * Características:
 * - Icono opcional (top-right)
 * - Valor destacado grande
 * - Descripción/subtitle opcional
 * - Indicador de tendencia con color semántico
 * 
 * @example
 * ```tsx
 * <KpiCard
 *   title="Total Presentaciones"
 *   value="127"
 *   description="Este mes"
 *   icon={<FileText />}
 *   trend="up"
 *   trendValue="+12%"
 * />
 * ```
 */
export function KpiCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend,
  trendValue,
  className,
  variant = 'default',
  size = 'md',
  tooltip,
}: KpiCardProps) {
  const trendIcons = {
    up: ArrowUp,
    down: ArrowDown,
    neutral: Minus,
  };

  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-muted-foreground',
  };

  const variantClasses: Record<KpiVariant, string> = {
    default: 'border-border/40 bg-card',
    blue: 'border-blue-500/20 bg-blue-500/5',
    emerald: 'border-emerald-500/20 bg-emerald-500/5',
    purple: 'border-purple-500/20 bg-purple-500/5',
    amber: 'border-amber-500/20 bg-amber-500/5',
    indigo: 'border-indigo-500/20 bg-indigo-500/5',
    sky: 'border-sky-500/20 bg-sky-500/5',
    teal: 'border-teal-500/20 bg-teal-500/5',
  };

  const variantTextClasses: Record<KpiVariant, string> = {
    default: 'text-foreground',
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
    purple: 'text-purple-400',
    amber: 'text-amber-300',
    indigo: 'text-indigo-300',
    sky: 'text-sky-300',
    teal: 'text-teal-300',
  };

  const sizeClasses: Record<KpiSize, { padding: string; title: string; value: string }> = {
    sm: {
      padding: 'p-2',
      title: 'text-[10px]',
      value: 'text-base',
    },
    md: {
      padding: 'p-3',
      title: 'text-xs',
      value: 'text-lg',
    },
    lg: {
      padding: 'p-4',
      title: 'text-xs sm:text-sm',
      value: 'text-lg sm:text-2xl',
    },
  };

  const TrendIcon = trend ? trendIcons[trend] : null;
  const sizeConfig = sizeClasses[size];

  const cardContent = (
    <Card className={cn("relative flex h-full flex-col overflow-hidden", variantClasses[variant], className)}>
      <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-1", sizeConfig.padding)}>
        <CardTitle className={cn(sizeConfig.title, "font-medium uppercase text-muted-foreground")}>
          {title}
        </CardTitle>
        {icon && (
          <div className="text-muted-foreground opacity-60">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className={cn("flex-1 pb-3", sizeConfig.padding.replace('p-', 'px-'))}>
        <div className="flex h-full flex-col justify-between">
          <div className={cn(sizeConfig.value, "font-mono font-bold tracking-tight", variantTextClasses[variant])}>
            {value}
          </div>
          {(description || (trend && trendValue)) && (
            <div className="mt-1 flex items-center gap-2 text-[11px] sm:text-xs">
              {trend && TrendIcon && trendValue && (
                <div className={cn("flex items-center gap-1", trendColors[trend])}>
                  <TrendIcon className="h-3 w-3" />
                  <span className="font-medium">{trendValue}</span>
                </div>
              )}
              {description && (
                <span className="text-muted-foreground">
                  {description}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (tooltip) {
    return (
      <div className="group relative">
        {cardContent}
        <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 hidden w-max max-w-xs -translate-x-1/2 rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg group-hover:block">
          {tooltip}
        </div>
      </div>
    );
  }

  return cardContent;
}
