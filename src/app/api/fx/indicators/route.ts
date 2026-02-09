/**
 * API Route: /api/fx/indicators
 * GET - Retorna UF y UTM actuales para la barra global (campana, UF, UTM)
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [latestUf, latestUtm] = await Promise.all([
      prisma.fxUfRate.findFirst({ orderBy: { date: "desc" } }),
      prisma.fxUtmRate.findFirst({ orderBy: { month: "desc" } }),
    ]);

    const ufValue = latestUf ? Number(latestUf.value) : null;
    const utmValue = latestUtm ? Number(latestUtm.value) : null;
    const ufDate = latestUf?.date
      ? new Date(latestUf.date).toLocaleDateString("es-CL", { day: "2-digit", month: "short" })
      : null;
    const utmMonth = latestUtm?.month
      ? new Date(latestUtm.month).toLocaleDateString("es-CL", { month: "long", year: "numeric" })
      : null;

    return NextResponse.json({
      success: true,
      data: {
        uf: ufValue ? { value: ufValue, date: ufDate } : null,
        utm: utmValue ? { value: utmValue, month: utmMonth } : null,
      },
    });
  } catch (error) {
    console.error("Error fetching FX indicators:", error);
    return NextResponse.json(
      { success: false, error: "No se pudieron obtener los indicadores" },
      { status: 500 }
    );
  }
}
