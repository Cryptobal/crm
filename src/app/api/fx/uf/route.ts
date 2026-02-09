/**
 * API Route: /api/fx/uf
 * GET - Obtiene el valor actual de la UF para conversiones CLP/UF
 */

import { NextResponse } from "next/server";
import { getUfValue } from "@/lib/uf";

export async function GET() {
  try {
    const value = await getUfValue();
    return NextResponse.json({ success: true, value });
  } catch (error) {
    console.error("Error fetching UF:", error);
    return NextResponse.json(
      { success: false, error: "No se pudo obtener el valor UF" },
      { status: 500 }
    );
  }
}
