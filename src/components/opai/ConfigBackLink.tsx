"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function ConfigBackLink() {
  return (
    <Link
      href="/opai/configuracion"
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      Configuración
    </Link>
  );
}
