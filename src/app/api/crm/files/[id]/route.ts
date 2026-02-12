/**
 * API Route: /api/crm/files/[id]
 * DELETE - Eliminar archivo de R2 y de la base de datos
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized } from "@/lib/api-auth";
import { deleteFile } from "@/lib/storage";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return unauthorized();

    const { id: fileId } = await params;

    const file = await prisma.crmFile.findFirst({
      where: {
        id: fileId,
        tenantId: ctx.tenantId,
      },
      include: { links: true },
    });

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Archivo no encontrado" },
        { status: 404 }
      );
    }

    await deleteFile(file.storageKey);
    await prisma.crmFile.delete({
      where: { id: fileId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CRM] Error deleting file:", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar archivo" },
      { status: 500 }
    );
  }
}
