'use client';

/**
 * Stats Cards
 * 
 * Tarjetas de estadísticas principales del dashboard
 * Mobile-first, responsive, grid adaptativo
 */

import { 
  FileText, 
  Send, 
  Eye, 
  Mail, 
  MousePointer,
  TrendingUp,
  BarChart3,
  Info
} from 'lucide-react';
import { KpiCard } from '@/components/opai';

interface StatsCardsProps {
  stats: {
    total: number;
    sent: number;
    viewed: number;
    pending: number;
    opened: number;
    clicked: number;
    totalViews: number;
    totalOpens: number;
    totalClicks: number;
  };
  conversionRate: number;
  openRate: number;
  clickRate: number;
  activeFilter?: string;
  onFilterClick?: (filter: string) => void;
}

export function StatsCards({ 
  stats, 
  conversionRate, 
  openRate, 
  clickRate,
  activeFilter = 'all',
  onFilterClick
}: StatsCardsProps) {
  return (
    <div className="space-y-2">
      {/* Tooltip de ayuda */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-blue-500/10 border border-blue-500/20">
        <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
        <p className="text-xs sm:text-sm text-blue-300">
          <strong>Vistas:</strong> Cliente hizo click en "Ver Propuesta" y abrió la presentación | <strong>Sin Leer:</strong> Enviadas pero no vistas aún
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-2">
        <button onClick={() => onFilterClick?.('all')} className="text-left">
          <KpiCard
            title="Total"
            value={stats.total}
            icon={<FileText className="h-4 w-4" />}
            description="Todas"
            variant="blue"
            size="sm"
            className={activeFilter === 'all' ? 'ring-2 ring-primary' : 'hover:ring-2 hover:ring-muted cursor-pointer'}
          />
        </button>
        <button onClick={() => onFilterClick?.('sent')} className="text-left">
          <KpiCard
            title="Enviadas"
            value={stats.sent}
            icon={<Send className="h-4 w-4" />}
            variant="purple"
            size="sm"
            className={activeFilter === 'sent' ? 'ring-2 ring-primary' : 'hover:ring-2 hover:ring-muted cursor-pointer'}
          />
        </button>
        <button onClick={() => onFilterClick?.('viewed')} className="text-left">
          <KpiCard
            title="Vistas"
            value={stats.viewed}
            description={`${stats.totalViews} totales`}
            icon={<Eye className="h-4 w-4" />}
            variant="emerald"
            size="sm"
            className={activeFilter === 'viewed' ? 'ring-2 ring-primary' : 'hover:ring-2 hover:ring-muted cursor-pointer'}
          />
        </button>
        <button onClick={() => onFilterClick?.('pending')} className="text-left">
          <KpiCard
            title="Sin Leer"
            value={stats.pending}
            description={`${stats.sent > 0 ? ((stats.pending / stats.sent) * 100).toFixed(0) : 0}% pend`}
            icon={<Mail className="h-4 w-4" />}
            variant="amber"
            size="sm"
            className={activeFilter === 'pending' ? 'ring-2 ring-primary' : 'hover:ring-2 hover:ring-muted cursor-pointer'}
          />
        </button>
        <div className="text-left hidden sm:block">
          <KpiCard
            title="Conversión"
            value={`${conversionRate.toFixed(1)}%`}
            description="Vista/Env"
            icon={<TrendingUp className="h-4 w-4" />}
            variant="sky"
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}
