"use client";

import { SubNav } from "@/components/opai";
import { Shield, Ban } from "lucide-react";

export function PersonasSubnav() {
  return (
    <SubNav
      items={[
        { href: "/personas/guardias", label: "Guardias", icon: Shield },
        { href: "/personas/lista-negra", label: "Lista negra", icon: Ban },
      ]}
    />
  );
}
