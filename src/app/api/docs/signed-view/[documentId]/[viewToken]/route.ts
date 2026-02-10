/**
 * GET - Obtener documento firmado para vista pública (sin login).
 * Valida signedViewToken y devuelve documento + registro de firma.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ documentId: string; viewToken: string }> }
) {
  try {
    const { documentId, viewToken } = await params;
    const doc = await prisma.document.findFirst({
      where: { id: documentId, signedViewToken: viewToken },
      select: {
        id: true,
        title: true,
        content: true,
        signedAt: true,
        signatureStatus: true,
        signatureData: true,
      },
      include: {
        signatureRequests: {
          where: { status: "completed" },
          orderBy: { completedAt: "desc" },
          take: 1,
          include: {
            recipients: {
              where: { role: "signer" },
              orderBy: [{ signingOrder: "asc" }, { createdAt: "asc" }],
              select: {
                name: true,
                email: true,
                rut: true,
                signingOrder: true,
                signedAt: true,
                signatureMethod: true,
                signatureTypedName: true,
                signatureImageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Enlace inválido o expirado" },
        { status: 404 }
      );
    }

    const request = doc.signatureRequests[0];
    return NextResponse.json({
      success: true,
      data: {
        document: {
          id: doc.id,
          title: doc.title,
          content: doc.content,
          signedAt: doc.signedAt,
          signatureStatus: doc.signatureStatus,
          signatureData: doc.signatureData,
        },
        signers: request?.recipients ?? [],
        completedAt: request?.completedAt ?? doc.signedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching signed view:", error);
    return NextResponse.json(
      { success: false, error: "Error al cargar documento" },
      { status: 500 }
    );
  }
}
