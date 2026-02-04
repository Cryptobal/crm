'use client';

/**
 * PresentationHeader - Header premium con glassmorphism
 * Sticky header con efectos profesionales
 */

import { useThemeClasses } from '../presentation/ThemeProvider';
import { cn } from '@/lib/utils';
import { CTALinks } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Sparkles } from 'lucide-react';

interface PresentationHeaderProps {
  logo?: string;
  cta: CTALinks;
  className?: string;
}

export function PresentationHeader({ 
  logo = '/Logo Gard Blanco.png', 
  cta, 
  className 
}: PresentationHeaderProps) {
  const theme = useThemeClasses();
  
  return (
    <header className={cn('sticky-header', className)}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-20 md:h-24">
          {/* Logo con hover effect */}
          <Link href="/" className="flex-shrink-0 group">
            <div className="relative w-28 h-10 md:w-36 md:h-12 transition-transform group-hover:scale-110">
              <Image
                src={logo}
                alt="Gard Security"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </Link>
          
          {/* CTA Principal (Desktop) */}
          <div className="hidden md:flex items-center gap-6">
            {cta.phone && (
              <a
                href={`tel:${cta.phone}`}
                className="text-base font-semibold text-white/80 hover:text-teal-400 transition-colors"
              >
                {cta.phone}
              </a>
            )}
            
            <a
              href={cta.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'btn-premium group relative',
                'inline-flex items-center justify-center gap-3',
                'px-8 py-4 rounded-xl',
                'text-base font-bold text-white',
                'bg-gradient-to-r from-teal-500 to-teal-400',
                'hover:from-teal-400 hover:to-teal-300',
                'transition-all duration-300',
                'hover:scale-105',
                'shadow-lg shadow-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/50',
                'border-2 border-teal-400/30 hover:border-teal-300/50'
              )}
            >
              <Sparkles className="w-5 h-5 animate-pulse" />
              <Calendar className="w-5 h-5" />
              <span>Agendar visita técnica</span>
            </a>
          </div>
          
          {/* Botón compacto premium (Mobile) */}
          <a
            href={cta.meeting_link}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'md:hidden',
              'inline-flex items-center gap-2',
              'px-6 py-3 rounded-lg',
              'text-sm font-bold text-white',
              'bg-gradient-to-r from-teal-500 to-teal-400',
              'shadow-lg shadow-teal-500/30',
              'border border-teal-400/30'
            )}
          >
            <Calendar className="w-4 h-4" />
            Agendar
          </a>
        </div>
      </div>
    </header>
  );
}
