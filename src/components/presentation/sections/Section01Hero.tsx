'use client';

/**
 * Section01Hero - Sección de portada/hero
 * Primera sección con headline, subheadline y CTA principal
 */

import { Section01_Hero, PresentationPayload } from '@/types/presentation';
import { SectionWrapper, ContainerWrapper } from '../SectionWrapper';
import { useThemeClasses } from '../ThemeProvider';
import { cn } from '@/lib/utils';
import { replaceTokens } from '@/lib/tokens';
import Image from 'next/image';
import { Calendar, ArrowRight } from 'lucide-react';

interface Section01HeroProps {
  data: Section01_Hero;
  payload: PresentationPayload;
}

export function Section01Hero({ data, payload }: Section01HeroProps) {
  const theme = useThemeClasses();
  
  // Reemplazar tokens en el texto
  const headline = replaceTokens(data.headline, payload);
  const subheadline = replaceTokens(data.subheadline, payload);
  const microcopy = replaceTokens(data.microcopy, payload);
  const personalization = replaceTokens(data.personalization, payload);
  
  return (
    <SectionWrapper id="s01-hero" animation="fade" className="relative overflow-hidden p-0">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={data.background_image}
          alt="Hero background"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
      </div>
      
      {/* Content */}
      <ContainerWrapper size="xl" className="relative z-10 min-h-screen flex flex-col justify-center py-20">
        {/* KPI Overlay (esquina superior derecha) */}
        {data.kpi_overlay && (
          <div className="absolute top-8 right-8 hidden md:block">
            <div className={cn(
              'px-6 py-4 rounded-lg backdrop-blur-md',
              'bg-white/10 border border-white/20'
            )}>
              <div className="text-3xl font-bold text-white mb-1">
                {data.kpi_overlay.value}
              </div>
              <div className="text-sm text-white/80">
                {data.kpi_overlay.label}
              </div>
            </div>
          </div>
        )}
        
        {/* Main Content */}
        <div className="max-w-4xl">
          {/* Personalization (cotización) */}
          <div className="mb-6">
            <span className={cn(
              'inline-block px-4 py-2 rounded-full text-sm font-semibold',
              'bg-white/10 backdrop-blur-sm border border-white/20',
              'text-white'
            )}>
              {personalization}
            </span>
          </div>
          
          {/* Headline */}
          <h1 className={cn(
            'text-4xl md:text-6xl lg:text-7xl font-bold mb-6',
            'text-white leading-tight',
            theme.headlineWeight
          )}>
            {headline}
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl lg:text-3xl text-white/90 mb-4 font-medium">
            {subheadline}
          </p>
          
          {/* Microcopy */}
          <p className="text-base md:text-lg text-white/70 mb-12 max-w-2xl">
            {microcopy}
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={payload.cta.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex items-center justify-center gap-2',
                'px-8 py-4 rounded-lg',
                'text-base font-semibold text-white',
                theme.accent,
                theme.accentHover,
                'transition-all hover:scale-105',
                'shadow-xl'
              )}
            >
              <Calendar className="w-5 h-5" />
              {data.cta_primary_text}
            </a>
            
            <a
              href={`mailto:${payload.contact.email}`}
              className={cn(
                'inline-flex items-center justify-center gap-2',
                'px-8 py-4 rounded-lg',
                'text-base font-semibold text-white',
                'bg-white/10 backdrop-blur-sm border-2 border-white/30',
                'hover:bg-white/20 transition-all'
              )}
            >
              {data.cta_secondary_text}
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden md:block">
          <div className="animate-bounce">
            <ArrowRight className="w-6 h-6 text-white/60 rotate-90" />
          </div>
        </div>
      </ContainerWrapper>
    </SectionWrapper>
  );
}
