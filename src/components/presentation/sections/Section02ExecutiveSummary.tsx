'use client';

/**
 * Section02ExecutiveSummary - Resumen ejecutivo premium
 * Con efectos glassmorphism y animaciones marcadas
 */

import { Section02_ExecutiveSummary } from '@/types/presentation';
import { SectionWrapper, ContainerWrapper, StaggerContainer, StaggerItem } from '../SectionWrapper';
import { useThemeClasses } from '../ThemeProvider';
import { cn } from '@/lib/utils';
import { KpiGrid } from '../shared/KpiCard';
import { CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface Section02ExecutiveSummaryProps {
  data: Section02_ExecutiveSummary;
}

export function Section02ExecutiveSummary({ data }: Section02ExecutiveSummaryProps) {
  const theme = useThemeClasses();
  
  return (
    <SectionWrapper id="s02-executive-summary" className="section-darker">
      <ContainerWrapper size="xl">
        {/* Commitment header espectacular */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-card border border-teal-400/30 glow-teal mb-8"
          >
            <Sparkles className="w-5 h-5 text-teal-400" />
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              Resumen Ejecutivo
            </span>
          </motion.div>
          
          <h2 className={cn(
            'text-4xl md:text-6xl lg:text-7xl font-black mb-6',
            'text-white leading-tight tracking-tight'
          )}>
            {data.commitment_title}
          </h2>
          
          <p className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-teal-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
            {data.commitment_text}
          </p>
        </div>
        
        {/* Two columns con efectos premium */}
        <div className="grid lg:grid-cols-2 gap-8 mb-20">
          {/* GARD es diferente - Con glow verde */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
            
            <div className={cn('relative glass-card rounded-2xl p-8 md:p-10 border-2 border-teal-400/30 hover:border-teal-400/50 transition-all')}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center glow-teal">
                  <CheckCircle className="w-7 h-7 text-white" strokeWidth={3} />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white">
                  Cómo GARD es diferente
                </h3>
              </div>
              
              <StaggerContainer>
                <div className="space-y-4">
                  {data.differentiators.map((item, index) => (
                    <StaggerItem key={index}>
                      <div className="flex items-start gap-4 group/item">
                        <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1 text-teal-400 group-hover/item:scale-110 transition-transform" strokeWidth={2.5} />
                        <span className="text-base md:text-lg text-white/90 font-medium leading-relaxed">
                          {item}
                        </span>
                      </div>
                    </StaggerItem>
                  ))}
                </div>
              </StaggerContainer>
            </div>
          </motion.div>
          
          {/* Modelo tradicional - Con glow rojo */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
            
            <div className="relative glass-card rounded-2xl p-8 md:p-10 border-2 border-red-500/30 hover:border-red-500/50 transition-all">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                  <XCircle className="w-7 h-7 text-white" strokeWidth={3} />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white">
                  Modelo tradicional
                </h3>
              </div>
              
              <StaggerContainer>
                <div className="space-y-4">
                  {data.traditional_model_reality.map((item, index) => (
                    <StaggerItem key={index}>
                      <div className="flex items-start gap-4 group/item">
                        <XCircle className="w-6 h-6 flex-shrink-0 mt-1 text-red-400 group-hover/item:scale-110 transition-transform" strokeWidth={2.5} />
                        <span className="text-base md:text-lg text-white/70 font-medium leading-relaxed">
                          {item}
                        </span>
                      </div>
                    </StaggerItem>
                  ))}
                </div>
              </StaggerContainer>
            </div>
          </motion.div>
        </div>
        
        {/* Impact Metrics - Espectaculares */}
        <div>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black text-center mb-12 text-white"
          >
            Impacto <span className="bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">medible</span>
          </motion.h3>
          
          <KpiGrid metrics={data.impact_metrics} columns={4} size="lg" />
        </div>
      </ContainerWrapper>
    </SectionWrapper>
  );
}
