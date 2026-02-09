/**
 * API Route: /api/crm/leads
 * GET  - Listar prospectos
 * POST - Crear prospecto
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized, parseBody } from "@/lib/api-auth";
import { createLeadSchema } from "@/lib/validations/crm";

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return unauthorized();

    const status = request.nextUrl.searchParams.get("status") || undefined;

    const leads = await prisma.crmLead.findMany({
      where: {
        tenantId: ctx.tenantId,
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: leads });
  } catch (error) {
    console.error("Error fetching CRM leads:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return unauthorized();

    const parsed = await parseBody(request, createLeadSchema);
    if (parsed.error) return parsed.error;
    const body = parsed.data;

    const lead = await prisma.crmLead.create({
      data: {
        tenantId: ctx.tenantId,
        status: "pending",
        source: body.source || null,
        firstName: body.firstName || null,
        lastName: body.lastName || null,
        email: body.email || null,
        phone: body.phone || null,
        companyName: body.companyName || null,
        notes: body.notes || null,
      },
    });

    return NextResponse.json({ success: true, data: lead }, { status: 201 });
  } catch (error) {
    console.error("Error creating CRM lead:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
