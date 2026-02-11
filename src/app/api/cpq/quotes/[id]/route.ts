/**
 * API Route: /api/cpq/quotes/[id]
 * GET    - Detalle de cotización
 * PATCH  - Actualizar cotización
 * DELETE - Eliminar cotización
 */

import { NextRequest, NextResponse } from "next/server";
import { hasAppAccess } from "@/lib/app-access";
import { requireAuth, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

function forbiddenCpq() {
  return NextResponse.json(
    { success: false, error: "Sin permisos para módulo CPQ" },
    { status: 403 }
  );
}

async function reconcileQuoteCrmContext(
  tenantId: string,
  quote: Awaited<ReturnType<typeof prisma.cpqQuote.findFirst>>
) {
  if (!quote) return quote;

  const patch: {
    dealId?: string | null;
    accountId?: string | null;
    contactId?: string | null;
    installationId?: string | null;
    clientName?: string | null;
  } = {};

  const [accountRecord, contactRecord, installationRecord] = await Promise.all([
    quote.accountId
      ? prisma.crmAccount.findFirst({
          where: { id: quote.accountId, tenantId },
          select: { id: true },
        })
      : Promise.resolve(null),
    quote.contactId
      ? prisma.crmContact.findFirst({
          where: { id: quote.contactId, tenantId },
          select: { id: true, accountId: true },
        })
      : Promise.resolve(null),
    quote.installationId
      ? prisma.crmInstallation.findFirst({
          where: { id: quote.installationId, tenantId },
          select: { id: true, accountId: true },
        })
      : Promise.resolve(null),
  ]);

  // Sanitize invalid references first (common on legacy/broken records).
  if (quote.accountId && !accountRecord) {
    patch.accountId = null;
  }
  if (
    quote.contactId &&
    (!contactRecord ||
      (accountRecord && contactRecord.accountId !== quote.accountId))
  ) {
    patch.contactId = null;
  }
  if (
    quote.installationId &&
    (!installationRecord ||
      (accountRecord &&
        installationRecord.accountId &&
        installationRecord.accountId !== quote.accountId))
  ) {
    patch.installationId = null;
  }

  const effectiveAccountId =
    patch.accountId !== undefined ? patch.accountId : quote.accountId;
  const effectiveContactId =
    patch.contactId !== undefined ? patch.contactId : quote.contactId;

  let effectiveDealId = quote.dealId ?? null;
  let dealRecord =
    effectiveDealId
      ? await prisma.crmDeal.findFirst({
          where: { id: effectiveDealId, tenantId },
          select: {
            id: true,
            accountId: true,
            primaryContactId: true,
            account: { select: { name: true } },
          },
        })
      : null;

  // Existing dealId points outside tenant / stale relation.
  if (effectiveDealId && !dealRecord) {
    patch.dealId = null;
    effectiveDealId = null;
  }

  // Backfill from crm.deal_quotes link when cpq.quote.dealId is empty.
  if (!dealRecord) {
    const linkedDeal = await prisma.crmDealQuote.findFirst({
      where: { tenantId, quoteId: quote.id },
      orderBy: { createdAt: "desc" },
      select: { dealId: true },
    });
    if (linkedDeal?.dealId) {
      dealRecord = await prisma.crmDeal.findFirst({
        where: { id: linkedDeal.dealId, tenantId },
        select: {
          id: true,
          accountId: true,
          primaryContactId: true,
          account: { select: { name: true } },
        },
      });
      if (dealRecord) {
        effectiveDealId = linkedDeal.dealId;
        patch.dealId = linkedDeal.dealId;
      }
    }
  }

  // If there is a deal, infer missing account/contact/client fields.
  if (dealRecord) {
    if (!effectiveAccountId) patch.accountId = dealRecord.accountId;
    if (!effectiveContactId && dealRecord.primaryContactId) {
      patch.contactId = dealRecord.primaryContactId;
    }
    if (!quote.clientName && dealRecord.account?.name) {
      patch.clientName = dealRecord.account.name;
    }
  }

  if (!Object.keys(patch).length) return quote;

  await prisma.cpqQuote.update({
    where: { id: quote.id },
    data: patch,
  });

  return { ...quote, ...patch };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ctx = await requireAuth();
    if (!ctx) return unauthorized();
    if (!hasAppAccess(ctx.userRole, "cpq")) return forbiddenCpq();
    const tenantId = ctx.tenantId;

    const quote = await prisma.cpqQuote.findFirst({
      where: { id, tenantId },
      include: {
        positions: {
          include: {
            puestoTrabajo: true,
            cargo: true,
            rol: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!quote) {
      return NextResponse.json(
        { success: false, error: "Quote not found" },
        { status: 404 }
      );
    }

    const reconciledQuote = await reconcileQuoteCrmContext(tenantId, quote);
    return NextResponse.json({ success: true, data: reconciledQuote });
  } catch (error) {
    console.error("Error fetching CPQ quote:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch quote" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ctx = await requireAuth();
    if (!ctx) return unauthorized();
    if (!hasAppAccess(ctx.userRole, "cpq")) return forbiddenCpq();
    const tenantId = ctx.tenantId;
    const body = await request.json();

    // Build update data - only include fields that are present in the body
    const updateData: Record<string, unknown> = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.clientName !== undefined) updateData.clientName = body.clientName?.trim() || null;
    if (body.validUntil !== undefined) updateData.validUntil = body.validUntil ? new Date(body.validUntil) : null;
    if (body.notes !== undefined) updateData.notes = body.notes?.trim() || null;
    // CRM context fields
    if (body.accountId !== undefined) updateData.accountId = body.accountId || null;
    if (body.contactId !== undefined) updateData.contactId = body.contactId || null;
    if (body.dealId !== undefined) updateData.dealId = body.dealId || null;
    if (body.installationId !== undefined) updateData.installationId = body.installationId || null;
    if (body.currency !== undefined) updateData.currency = body.currency || "CLP";
    if (body.aiDescription !== undefined) updateData.aiDescription = body.aiDescription || null;

    const updated = await prisma.cpqQuote.updateMany({
      where: { id, tenantId },
      data: updateData,
    });

    if (!updated.count) {
      return NextResponse.json(
        { success: false, error: "Quote not found" },
        { status: 404 }
      );
    }

    const quote = await prisma.cpqQuote.findUnique({ where: { id } });
    return NextResponse.json({ success: true, data: quote });
  } catch (error) {
    console.error("Error updating CPQ quote:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update quote" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ctx = await requireAuth();
    if (!ctx) return unauthorized();
    if (!hasAppAccess(ctx.userRole, "cpq")) return forbiddenCpq();
    const tenantId = ctx.tenantId;

    const existing = await prisma.cpqQuote.findFirst({
      where: { id, tenantId },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Quote not found" },
        { status: 404 }
      );
    }

    await prisma.cpqQuote.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting CPQ quote:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete quote" },
      { status: 500 }
    );
  }
}
