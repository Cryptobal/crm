'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getBottomNavItems } from '@/lib/module-nav';

interface BottomNavProps {
  userRole?: string;
}

/**
 * BottomNav — Barra de navegación inferior contextual (mobile-first).
 *
 * Patrón Salesforce/HubSpot Mobile:
 * - En rutas generales: muestra módulos principales (Inicio, Docs, CRM, Payroll, Ops, Config)
 * - Dentro de un módulo: muestra subcategorías del módulo con iconos
 *   (ej. en CRM: Leads, Cuentas, Instalaciones, Negocios, Contactos, CPQ)
 *
 * Se oculta en desktop (lg+) donde la sidebar maneja la navegación.
 */
export function BottomNav({ userRole }: BottomNavProps) {
  const pathname = usePathname();

  if (!userRole || !pathname) return null;

  const items = getBottomNavItems(pathname, userRole);

  if (items.length === 0) return null;

  // Si hay muchos items (> 5), hacemos labels más compactos
  const compact = items.length > 5;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 lg:hidden">
      <div
        className={cn(
          "flex items-center justify-around px-1 pb-[env(safe-area-inset-bottom)]",
          compact ? "h-14" : "h-14"
        )}
      >
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1 transition-colors min-w-0",
                compact ? "px-1.5" : "px-3",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground active:text-foreground"
              )}
            >
              {/* Active dot indicator */}
              {isActive && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-primary" />
              )}
              <Icon className={cn("shrink-0", compact ? "h-4.5 w-4.5" : "h-5 w-5")} />
              <span
                className={cn(
                  "font-medium truncate max-w-full",
                  compact ? "text-[9px]" : "text-[10px]"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
