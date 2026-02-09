import { prisma } from "@/lib/prisma";

/**
 * Get the latest UF value from the fx_rates table.
 * Falls back to CMF API if not available.
 */
export async function getUfValue(): Promise<number> {
  try {
    // Try to get from database first (most recent)
    const rate = await prisma.fxUfRate.findFirst({
      orderBy: { date: "desc" },
    });

    if (rate) {
      return Number(rate.value);
    }
  } catch {
    // DB query failed, try API fallback
  }

  // Fallback: CMF API
  const cmfApiKey = process.env.CMF_API_KEY;
  if (cmfApiKey) {
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const url = `https://api.cmfchile.cl/api-sbifv3/recursos_api/uf/${year}/${month}/dias/${day}?apikey=${cmfApiKey}&formato=json`;

      const response = await fetch(url, { next: { revalidate: 3600 } });
      if (response.ok) {
        const data = await response.json();
        const ufStr = data?.UFs?.[0]?.Valor;
        if (ufStr) {
          return parseFloat(ufStr.replace(/\./g, "").replace(",", "."));
        }
      }
    } catch {
      // API failed too
    }
  }

  // Ultimate fallback: approximate UF value
  return 38000;
}

/**
 * Convert CLP to UF
 */
export function clpToUf(clp: number, ufValue: number): number {
  if (!ufValue || ufValue <= 0) return 0;
  return clp / ufValue;
}

/**
 * Convert UF to CLP
 */
export function ufToClp(uf: number, ufValue: number): number {
  return uf * ufValue;
}
