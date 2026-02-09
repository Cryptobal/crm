/**
 * API Route: /api/crm/emails
 * GET - Listar emails con tracking por deal o contacto
 *
 * Query params:
 *   dealId    - filtrar por negocio
 *   contactId - filtrar por contacto (busca en toEmails)
 *   accountId - filtrar por cuenta
 *   limit     - máximo de resultados (default 50)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return unauthorized();

    const { searchParams } = new URL(request.url);
    const dealId = searchParams.get("dealId");
    const contactId = searchParams.get("contactId");
    const accountId = searchParams.get("accountId");
    const limit = Math.min(Number(searchParams.get("limit") || "50"), 200);

    if (!dealId && !contactId && !accountId) {
      return NextResponse.json(
        { success: false, error: "Se requiere dealId, contactId o accountId" },
        { status: 400 }
      );
    }

    // Build thread filter
    const threadWhere: Record<string, unknown> = {
      tenantId: ctx.tenantId,
    };
    if (dealId) threadWhere.dealId = dealId;
    if (accountId) threadWhere.accountId = accountId;

    // If filtering by contact, we need to find threads linked to that contact
    // OR messages sent to the contact's email
    if (contactId) {
      const contact = await prisma.crmContact.findFirst({
        where: { id: contactId, tenantId: ctx.tenantId },
        select: { email: true },
      });

      if (!contact?.email) {
        return NextResponse.json({ success: true, data: [] });
      }

      // Get threads linked to this contact OR messages sent to this email
      const threads = await prisma.crmEmailThread.findMany({
        where: {
          tenantId: ctx.tenantId,
          OR: [
            { contactId },
            {
              messages: {
                some: {
                  toEmails: { has: contact.email },
                },
              },
            },
          ],
        },
        select: { id: true },
      });

      const threadIds = threads.map((t) => t.id);

      if (threadIds.length === 0) {
        return NextResponse.json({ success: true, data: [] });
      }

      const messages = await prisma.crmEmailMessage.findMany({
        where: {
          tenantId: ctx.tenantId,
          threadId: { in: threadIds },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          thread: {
            select: {
              dealId: true,
              accountId: true,
              contactId: true,
              subject: true,
            },
          },
        },
      });

      return NextResponse.json({ success: true, data: messages });
    }

    // Default: filter by thread
    const threads = await prisma.crmEmailThread.findMany({
      where: threadWhere,
      select: { id: true },
    });

    const threadIds = threads.map((t) => t.id);

    if (threadIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const messages = await prisma.crmEmailMessage.findMany({
      where: {
        tenantId: ctx.tenantId,
        threadId: { in: threadIds },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        thread: {
          select: {
            dealId: true,
            accountId: true,
            contactId: true,
            subject: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch emails" },
      { status: 500 }
    );
  }
}
