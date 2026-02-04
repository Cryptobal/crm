'use client';

/**
 * Section02ExecutiveSummary - Resumen ejecutivo
 * Muestra el compromiso, diferenciadores y métricas de impacto
 */

import { Section02_ExecutiveSummary } from '@/types/presentation';
import { SectionWrapper, ContainerWrapper, StaggerContainer, StaggerItem } from '../SectionWrapper';
import { useThemeClasses } from '../ThemeProvider';
import { cn } from '@/lib/utils';
import { KpiGrid } from '../shared/KpiCard';
import { CheckCircle, XCircle } from 'lucide-react';

interface Section02ExecutiveSummaryProps {
  data: Section02_ExecutiveSummary;
}

export function Section02ExecutiveSummary({ data }: Section02ExecutiveSummaryProps) {
  const theme = useThemeClasses();
  
  return (
    <SectionWrapper id="s02-executive-summary" className={theme.backgroundAlt}>
      <ContainerWrapper size="xl">
        {/* Commitment */}
        <div className="text-center mb-16">
          <h2 className={cn(
            'text-3xl md:text-5xl font-bold mb-4',
            theme.text,
            theme.headlineWeight
          )}>
            {data.commitment_title}
          </h2>
          <p className={cn('text-xl md:text-2xl', theme.accent.replace('bg-', 'text-'))}>
            {data.commitment_text}
          </p>
        </div>
        
        {/* Two columns: Differentiators vs Traditional Model */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Cómo GARD es diferente */}
          <div className={cn('rounded-lg p-6 md:p-8 border', theme.border, theme.secondary)}>
            <h3 className={cn('text-xl font-bold mb-6', theme.text)}>
              Cómo GARD es diferente
            </h3>
            <StaggerContainer>
              <div className="space-y-4">
                {data.differentiators.map((item, index) => (
                  <StaggerItem key={index}>
                    <div className="flex items-start gap-3">
                      <CheckCircle className={cn('w-5 h-5 flex-shrink-0 mt-0.5', theme.accent.replace('bg-', 'text-'))} />
                      <span className={cn('text-sm md:text-base', theme.text)}>
                        {item}
                      </span>
                    </div>
                  </StaggerItem>
                ))}
              </div>
            </StaggerContainer>
          </div>
          
          {/* Modelo tradicional: la realidad */}
          <div className={cn('rounded-lg p-6 md:p-8 border border-red-500/30', 'bg-red-900/10')}>
            <h3 className={cn('text-xl font-bold mb-6', 'text-red-400')}>
              Modelo tradicional: la realidad
            </h3>
            <StaggerContainer>
              <div className="space-y-4">
                {data.traditional_model_reality.map((item, index) => (
                  <StaggerItem key={index}>
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                      <span className={cn('text-sm md:text-base', theme.textMuted)}>
                        {item}
                      </span>
                    </div>
                  </StaggerItem>
                ))}
              </div>
            </StaggerContainer>
          </div>
        </div>
        
        {/* Impact Metrics */}
        <div>
          <h3 className={cn('text-2xl font-bold text-center mb-8', theme.text)}>
            Impacto medible
          </h3>
          <KpiGrid metrics={data.impact_metrics} columns={4} size="md" />
        </div>
      </ContainerWrapper>
    </SectionWrapper>
  );
}
