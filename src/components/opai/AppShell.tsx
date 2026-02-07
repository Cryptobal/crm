'use client';

import { cloneElement, isValidElement, ReactElement, ReactNode, useEffect, useState } from 'react';
import { Menu, PanelLeftOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AppShellProps {
  sidebar?: ReactNode;
  topbar?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * AppShell - Layout principal de la aplicación
 * 
 * Estructura de 3 zonas:
 * - Sidebar fijo (240px) a la izquierda
 * - Topbar sticky (64px) arriba
 * - Content area con scroll independiente
 * 
 * El sidebar se oculta en mobile (TODO: implementar drawer/toggle)
 * 
 * @example
 * ```tsx
 * <AppShell
 *   sidebar={<AppSidebar navItems={items} />}
 *   topbar={<AppTopbar userMenu={<UserMenu />} />}
 * >
 *   <PageContent />
 * </AppShell>
 * ```
 */
export function AppShell({ sidebar, topbar, children, className }: AppShellProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isMobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileOpen]);

  const mobileSidebar = isValidElement(sidebar)
    ? cloneElement(
        sidebar as ReactElement<{
          className?: string;
          onNavigate?: () => void;
          onToggleSidebar?: () => void;
          isSidebarOpen?: boolean;
        }>,
        {
          className: cn(
            (sidebar as ReactElement<{ className?: string }>).props.className,
            "z-50 transition-transform duration-300 ease-out",
            isMobileOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
          ),
          onNavigate: () => setIsMobileOpen(false),
          onToggleSidebar: () => setIsSidebarOpen((open) => !open),
          isSidebarOpen,
        }
      )
    : sidebar;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Mobile menu button */}
      {sidebar && (
        <button
          type="button"
          className="fixed left-4 top-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card/95 text-foreground shadow-lg backdrop-blur lg:hidden"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Abrir navegación"
          aria-controls="app-sidebar-mobile"
          aria-expanded={isMobileOpen}
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {/* Sidebar */}
      {sidebar && (
        <div className={cn("hidden lg:block", !isSidebarOpen && "lg:hidden")}>
          {isValidElement(sidebar)
            ? cloneElement(
                sidebar as ReactElement<{
                  onToggleSidebar?: () => void;
                  isSidebarOpen?: boolean;
                }>,
                {
                  onToggleSidebar: () => setIsSidebarOpen((open) => !open),
                  isSidebarOpen,
                }
              )
            : sidebar}
        </div>
      )}

      {/* Desktop reopen toggle (when sidebar closed) */}
      {sidebar && !isSidebarOpen && (
        <button
          type="button"
          className="fixed bottom-6 left-6 z-40 hidden h-10 w-10 items-center justify-center rounded-lg border border-border bg-card/95 text-foreground shadow-lg backdrop-blur lg:inline-flex"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Abrir navegación"
          aria-expanded={false}
        >
          <PanelLeftOpen className="h-5 w-5" />
        </button>
      )}

      {/* Mobile sidebar drawer */}
      {sidebar && (
        <div className={cn("lg:hidden", isMobileOpen ? "pointer-events-auto" : "pointer-events-none")}>
          <div
            className={cn(
              "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity",
              isMobileOpen ? "opacity-100" : "opacity-0"
            )}
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />
          <div id="app-sidebar-mobile" className="fixed left-0 top-0 z-50 h-screen w-60 max-w-[85vw]">
            {mobileSidebar}
          </div>
        </div>
      )}

      {/* Main content area (offset por sidebar) */}
      <div className={cn(isSidebarOpen ? "lg:pl-60" : "lg:pl-0", className)}>
        {/* Topbar (opcional) */}
        {topbar}

        {/* Page content */}
        <main className="flex-1">
          <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
