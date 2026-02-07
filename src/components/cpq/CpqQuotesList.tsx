/**
 * Lista de cotizaciones CPQ
 */

"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/components/cpq/utils";
import type { CpqQuote } from "@/types/cpq";

interface CpqQuotesListProps {
  quotes: CpqQuote[];
  loading?: boolean;
}

export function CpqQuotesList({ quotes, loading }: CpqQuotesListProps) {
  if (loading) {
    return <div className="text-sm text-muted-foreground">Cargando...</div>;
  }

  if (!quotes.length) {
    return <div className="text-sm text-muted-foreground">No hay cotizaciones aún.</div>;
  }

  return (
    <div className="space-y-2">
      {quotes.map((quote) => (
        <Link key={quote.id} href={`/cpq/${quote.id}`}>
          <Card className="flex items-center justify-between gap-3 p-3 hover:bg-muted/20">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">{quote.code}</p>
                <Badge variant="outline" className="text-xs">
                  {quote.status}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {quote.clientName || "Cliente sin nombre"} · {quote.totalPositions} puestos · {quote.totalGuards} guardias
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm uppercase text-muted-foreground">Costo mensual</p>
              <p className="font-mono text-base sm:text-sm">{formatCurrency(Number(quote.monthlyCost))}</p>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
