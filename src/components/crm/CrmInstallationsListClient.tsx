"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";

export type InstallationRow = {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  commune?: string | null;
  lat?: number | null;
  lng?: number | null;
  account?: { id: string; name: string } | null;
};

export function CrmInstallationsListClient({
  initialInstallations,
}: {
  initialInstallations: InstallationRow[];
}) {
  if (initialInstallations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        <MapPin className="mx-auto h-10 w-10 opacity-50" />
        <p className="mt-2 text-sm">No hay instalaciones registradas.</p>
        <p className="text-xs mt-1">Crea instalaciones desde el detalle de una cuenta.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {initialInstallations.map((inst) => (
        <Link
          key={inst.id}
          href={`/crm/installations/${inst.id}`}
          className="block rounded-lg border p-3 transition-colors hover:bg-accent/30"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">{inst.name}</p>
              {inst.account && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {inst.account.name}
                </p>
              )}
              {inst.address && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {inst.address}
                </p>
              )}
              {(inst.city || inst.commune) && (
                <p className="text-xs text-muted-foreground ml-4">
                  {[inst.commune, inst.city].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
