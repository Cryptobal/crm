"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface SubNavItem {
  href: string;
  label: string;
}

interface SubNavProps {
  items: SubNavItem[];
  className?: string;
}

/**
 * SubNav - Navegación secundaria horizontal reutilizable.
 *
 * Pills scrollables horizontalmente en TODAS las resoluciones.
 * Mobile-first: se scrollea con el pulgar naturalmente.
 */
export function SubNav({ items, className }: SubNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("mb-6", className)}>
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {items.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors shrink-0",
                  isActive
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground border border-transparent"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
