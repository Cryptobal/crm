/**
 * API Route: /api/cpq/cargos/[id]
 * PUT    - Actualizar cargo
 * DELETE - Desactivar cargo
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized } from "@/lib/api-auth";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return unauthorized();

    const { id } = await params;
    const body = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json(
        { success: false, error: "Nombre es requerido" },
        { status: 400 }
      );
    }

    const cargo = await prisma.cpqCargo.update({
      where: { id },
      data: {
        name: body.name.trim(),
        description: body.description?.trim() || null,
        active: body.active ?? true,
      },
    });

    return NextResponse.json({ success: true, data: cargo });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Cargo no encontrado" },
        { status: 404 }
      );
    }
    if (error?.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "Ya existe un cargo con ese nombre" },
        { status: 409 }
      );
    }
    console.error("Error updating cargo:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update cargo" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return unauthorized();

    const { id } = await params;

    await prisma.cpqCargo.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Cargo no encontrado" },
        { status: 404 }
      );
    }
    console.error("Error deactivating cargo:", error);
    return NextResponse.json(
      { success: false, error: "Failed to deactivate cargo" },
      { status: 500 }
    );
  }
}
