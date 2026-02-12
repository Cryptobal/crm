"use client";

import { SubNav } from "@/components/opai";
import { Calculator, FileText } from "lucide-react";

export function PayrollSubnav() {
  return (
    <SubNav
      items={[
        { href: "/payroll/simulator", label: "Simulador", icon: Calculator },
        { href: "/payroll/parameters", label: "Parámetros", icon: FileText },
      ]}
    />
  );
}
