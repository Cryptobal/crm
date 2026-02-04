'use client';

/**
 * PresentationHeader - Header persistente con CTA
 * Sticky header con logo y botón de acción
 */

import { useThemeClasses } from '../presentation/ThemeProvider';
import { cn } from '@/lib/utils';
import { CTALinks } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar } from 'lucide-react';

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
    <header
      className={cn(
        'sticky-header',
        'top-0 z-50',
        'border-b',
        theme.border,
        className
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="relative w-24 h-8 md:w-32 md:h-10">
              <Image
                src={logo}
                alt="Gard Security"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
          
          {/* CTA Principal (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {cta.phone && (
              <a
                href={`tel:${cta.phone}`}
                className={cn(
                  'text-sm font-medium',
                  theme.textMuted,
                  'hover:' + theme.text.replace('text-', 'text-'),
                  'transition-colors'
                )}
              >
                {cta.phone}
              </a>
            )}
            
            <a
              href={cta.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex items-center gap-2',
                'px-6 py-3 rounded-lg',
                'text-sm font-semibold text-white',
                theme.accent,
                theme.accentHover,
                'transition-all hover:scale-105',
                'shadow-lg'
              )}
            >
              <Calendar className="w-4 h-4" />
              Agendar visita técnica
            </a>
          </div>
          
          {/* Botón compacto (Mobile) */}
          <a
            href={cta.meeting_link}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'md:hidden',
              'px-4 py-2 rounded-lg',
              'text-sm font-semibold text-white',
              theme.accent,
              theme.accentHover,
              'transition-all'
            )}
          >
            Agendar
          </a>
        </div>
      </div>
    </header>
  );
}
