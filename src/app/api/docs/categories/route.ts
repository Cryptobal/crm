/**
 * API: /api/docs/categories
 * GET  - Listar categorías por tenant (opcional ?module=)
 * POST - Crear categoría
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized, parseBody } from "@/lib/api-auth";
import { z } from "zod";

const createCategorySchema = z.object({
  module: z.string().min(1),
  key: z.string().min(1).regex(/^[a-z0-9_]+$/, "Solo minúsculas, números y _"),
  label: z.string().min(1),
  sortOrder: z.number().int().optional().default(0),
});

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return unauthorized();

    const { searchParams } = new URL(request.url);
    const module = searchParams.get("module");

    const categories = await prisma.docCategory.findMany({
      where: {
        tenantId: ctx.tenantId,
        ...(module ? { module } : {}),
      },
      orderBy: [{ module: "asc" }, { sortOrder: "asc" }, { label: "asc" }],
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error fetching doc categories:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener categorías" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return unauthorized();

    const parsed = await parseBody(request, createCategorySchema);
    if (parsed.error) return parsed.error;

    const { module, key, label, sortOrder } = parsed.data;

    const existing = await prisma.docCategory.findUnique({
      where: {
        tenantId_module_key: { tenantId: ctx.tenantId, module, key },
      },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Ya existe una categoría con ese módulo y clave" },
        { status: 409 }
      );
    }

    const category = await prisma.docCategory.create({
      data: {
        tenantId: ctx.tenantId,
        module,
        key,
        label,
        sortOrder,
      },
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error("Error creating doc category:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear categoría" },
      { status: 500 }
    );
  }
}
