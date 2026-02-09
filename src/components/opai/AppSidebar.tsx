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
  userName?: string;
  userEmail?: string;
  onNavigate?: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  className?: string;
}

export function AppSidebar({
  navItems,
  logo,
  footer,
  userName,
  userEmail,
  onNavigate,
  onToggleSidebar,
  isSidebarOpen = true,
  className,
}: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 h-screen w-60 border-r border-border bg-card",
        "flex flex-col",
        className
      )}
    >
      {/* Logo — compacto */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
        {logo || (
          <Link href="/hub" className="flex items-center gap-2.5" onClick={onNavigate}>
            <Image
              src="/logo escudo blanco.png"
              alt="Gard Security"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />
            <span className="text-sm font-semibold tracking-tight">
              OPAI
            </span>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            if (item.show === false) return null;

            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-accent text-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-primary" />
                )}
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User footer */}
      <div className="border-t border-border p-3">
        {/* User info */}
        {(userName || userEmail) && (
          <Link
            href="/opai/perfil"
            onClick={onNavigate}
            className="mb-2 flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-accent"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
              {userName?.charAt(0)?.toUpperCase() || userEmail?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0 flex-1">
              {userName && (
                <p className="truncate text-xs font-medium text-foreground">{userName}</p>
              )}
              {userEmail && (
                <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
              )}
            </div>
          </Link>
        )}

        {/* Footer actions + collapse toggle */}
        <div className="flex items-center justify-between gap-1">
          <div className="min-w-0 flex-1">{footer}</div>
          {onToggleSidebar && (
            <button
              type="button"
              className="hidden lg:inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={onToggleSidebar}
              aria-label={isSidebarOpen ? 'Cerrar navegación' : 'Abrir navegación'}
            >
              {isSidebarOpen ? <PanelLeftClose className="h-3.5 w-3.5" /> : <PanelLeftOpen className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
