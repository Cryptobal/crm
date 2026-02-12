"use client";

import { SubNav } from "@/components/opai";
import { ClipboardList, CalendarDays, UserRoundCheck, ShieldAlert } from "lucide-react";

export function OpsSubnav() {
  return (
    <SubNav
      items={[
        { href: "/ops/puestos", label: "Puestos", icon: ClipboardList },
        { href: "/ops/pauta-mensual", label: "Pauta mensual", icon: CalendarDays },
        { href: "/ops/pauta-diaria", label: "Pauta diaria", icon: UserRoundCheck },
        { href: "/ops/ppc", label: "PPC", icon: ShieldAlert },
      ]}
    />
  );
}
