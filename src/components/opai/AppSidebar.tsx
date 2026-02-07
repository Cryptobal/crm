'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { LucideIcon, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  show?: boolean;
}

export interface AppSidebarProps {
  navItems: NavItem[];
  logo?: ReactNode;
  footer?: ReactNode;
  onNavigate?: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  className?: string;
}

/**
 * AppSidebar - Barra lateral de navegación principal
 * 
 * Sidebar fijo de 240px con:
 * - Logo en la parte superior
 * - Items de navegación con iconos
 * - Active state según la ruta actual
 * - Footer opcional (ej: user info, logout)
 * 
 * @example
 * ```tsx
 * <AppSidebar
 *   navItems={[
 *     { href: '/opai/inicio', label: 'Inicio', icon: Home, show: true },
 *     { href: '/opai/usuarios', label: 'Usuarios', icon: Users, show: isAdmin }
 *   ]}
 *   logo={<Logo />}
 *   footer={<UserMenu />}
 * />
 * ```
 */
export function AppSidebar({ navItems, logo, footer, onNavigate, onToggleSidebar, isSidebarOpen = true, className }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 h-screen w-60 border-r border-border bg-card",
        "flex flex-col",
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-6">
        {logo || (
          <Link href="/opai/inicio" className="flex items-center gap-3" onClick={onNavigate}>
            <Image 
              src="/logo escudo blanco.png" 
              alt="Gard Security" 
              width={32} 
              height={32}
              className="h-8 w-8 object-contain"
            />
            <span className="text-lg font-bold">
              Gard Security
            </span>
          </Link>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          // Solo mostrar si show !== false
          if (item.show === false) return null;

          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {(footer || onToggleSidebar) && (
        <div className="border-t border-border p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">{footer}</div>
            {onToggleSidebar && (
              <button
                type="button"
                className="hidden lg:inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card/95 text-foreground shadow-sm"
                onClick={onToggleSidebar}
                aria-label={isSidebarOpen ? "Cerrar navegación" : "Abrir navegación"}
                aria-expanded={isSidebarOpen}
              >
                {isSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
