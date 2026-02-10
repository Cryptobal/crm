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
      include: {
        signatureRequests: {
          where: { status: "completed" },
          orderBy: { completedAt: "desc" },
          take: 1,
          include: {
            recipients: {
              where: { role: "signer" },
              orderBy: [{ signingOrder: "asc" }, { createdAt: "asc" }],
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
        signers: (request?.recipients ?? []).map((r) => ({
          name: r.name,
          email: r.email,
          rut: r.rut,
          signingOrder: r.signingOrder,
          signedAt: r.signedAt,
          signatureMethod: r.signatureMethod,
          signatureTypedName: r.signatureTypedName,
          signatureImageUrl: r.signatureImageUrl,
        })),
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
