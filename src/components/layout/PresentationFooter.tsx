'use client';

/**
 * PresentationFooter - Footer con información de contacto
 */

import { useThemeClasses } from '../presentation/ThemeProvider';
import { cn } from '@/lib/utils';
import { ContactInfo } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone, Globe, MapPin, Linkedin, Instagram, Youtube } from 'lucide-react';

interface PresentationFooterProps {
  logo?: string;
  contact: ContactInfo;
  address?: string;
  website?: string;
  social_media?: {
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
  className?: string;
}

export function PresentationFooter({ 
  logo = '/Logo Gard Blanco.png',
  contact,
  address,
  website,
  social_media,
  className 
}: PresentationFooterProps) {
  const theme = useThemeClasses();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={cn(theme.backgroundAlt, 'border-t', theme.border, className)}>
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo y descripción */}
          <div>
            <div className="relative w-32 h-10 mb-4">
              <Image
                src={logo}
                alt="Gard Security"
                fill
                className="object-contain"
              />
            </div>
            <p className={cn('text-sm mb-4', theme.textMuted)}>
              Seguridad privada diseñada para continuidad operacional
            </p>
          </div>
          
          {/* Contacto */}
          <div>
            <h3 className={cn('text-sm font-semibold mb-4', theme.text)}>
              Contacto
            </h3>
            <div className="space-y-2">
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className={cn(
                    'flex items-center gap-2 text-sm',
                    theme.textMuted,
                    'hover:' + theme.text.replace('text-', 'text-'),
                    'transition-colors'
                  )}
                >
                  <Mail className="w-4 h-4" />
                  {contact.email}
                </a>
              )}
              
              {contact.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className={cn(
                    'flex items-center gap-2 text-sm',
                    theme.textMuted,
                    'hover:' + theme.text.replace('text-', 'text-'),
                    'transition-colors'
                  )}
                >
                  <Phone className="w-4 h-4" />
                  {contact.phone}
                </a>
              )}
              
              {website && (
                <a
                  href={`https://${website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center gap-2 text-sm',
                    theme.textMuted,
                    'hover:' + theme.text.replace('text-', 'text-'),
                    'transition-colors'
                  )}
                >
                  <Globe className="w-4 h-4" />
                  {website}
                </a>
              )}
              
              {address && (
                <div className={cn('flex items-start gap-2 text-sm', theme.textMuted)}>
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{address}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Redes sociales */}
          {social_media && (
            <div>
              <h3 className={cn('text-sm font-semibold mb-4', theme.text)}>
                Síguenos
              </h3>
              <div className="flex gap-4">
                {social_media.linkedin && (
                  <a
                    href={social_media.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'p-2 rounded-lg',
                      theme.secondary,
                      'hover:' + theme.accent.replace('bg-', 'bg-'),
                      'transition-colors'
                    )}
                  >
                    <Linkedin className={cn('w-5 h-5', theme.text)} />
                  </a>
                )}
                
                {social_media.instagram && (
                  <a
                    href={social_media.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'p-2 rounded-lg',
                      theme.secondary,
                      'hover:' + theme.accent.replace('bg-', 'bg-'),
                      'transition-colors'
                    )}
                  >
                    <Instagram className={cn('w-5 h-5', theme.text)} />
                  </a>
                )}
                
                {social_media.youtube && (
                  <a
                    href={social_media.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'p-2 rounded-lg',
                      theme.secondary,
                      'hover:' + theme.accent.replace('bg-', 'bg-'),
                      'transition-colors'
                    )}
                  >
                    <Youtube className={cn('w-5 h-5', theme.text)} />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Copyright */}
        <div className={cn(
          'pt-8 border-t text-center text-sm',
          theme.border,
          theme.textMuted
        )}>
          <p>
            © {currentYear} Gard Security. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
