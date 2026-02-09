/**
 * API Route: /api/crm/contacts
 * GET  - Listar contactos
 * POST - Crear contacto
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized, parseBody } from "@/lib/api-auth";
import { createContactSchema } from "@/lib/validations/crm";

export async function GET() {
  try {
    const ctx = await requireAuth();
    if (!ctx) return unauthorized();

    const contacts = await prisma.crmContact.findMany({
      where: { tenantId: ctx.tenantId },
      include: { account: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: contacts });
  } catch (error) {
    console.error("Error fetching CRM contacts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return unauthorized();

    const parsed = await parseBody(request, createContactSchema);
    if (parsed.error) return parsed.error;
    const body = parsed.data;

    const contact = await prisma.crmContact.create({
      data: {
        tenantId: ctx.tenantId,
        accountId: body.accountId,
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        roleTitle: body.roleTitle || null,
        isPrimary: body.isPrimary,
      },
      include: { account: true },
    });

    return NextResponse.json({ success: true, data: contact }, { status: 201 });
  } catch (error) {
    console.error("Error creating CRM contact:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create contact" },
      { status: 500 }
    );
  }
}
