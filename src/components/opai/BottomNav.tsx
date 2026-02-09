'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Grid3x3, FileText, Building2, Calculator, Settings } from 'lucide-react';

const BOTTOM_NAV_ITEMS = [
  { href: '/hub', label: 'Inicio', icon: Grid3x3 },
  { href: '/opai/inicio', label: 'Docs', icon: FileText },
  { href: '/crm', label: 'CRM', icon: Building2 },
  { href: '/payroll', label: 'Payroll', icon: Calculator },
  { href: '/opai/configuracion/integraciones', label: 'Config', icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 lg:hidden">
      <div className="flex h-14 items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
