/**
 * Zod schemas for CRM API validation
 */

import { z } from "zod";

// ── Lead ──
export const createLeadSchema = z.object({
  companyName: z.string().trim().max(200).optional().nullable(),
  name: z.string().trim().max(200).optional().nullable(),
  email: z.string().trim().email("Email inválido").max(200).optional().nullable().or(z.literal("")),
  phone: z.string().trim().max(30).optional().nullable(),
  source: z.string().trim().max(200).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export const approveLeadSchema = z.object({
  accountName: z.string().trim().min(1, "Nombre de empresa es requerido").max(200).optional(),
  contactName: z.string().trim().max(200).optional(),
  email: z.string().trim().email("Email inválido").max(200).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional(),
  dealTitle: z.string().trim().max(200).optional(),
  rut: z.string().trim().max(20).optional(),
  industry: z.string().trim().max(100).optional(),
  segment: z.string().trim().max(100).optional(),
  size: z.string().trim().max(50).optional(),
  website: z.string().trim().url("URL inválida").max(500).optional().or(z.literal("")),
  address: z.string().trim().max(500).optional(),
  roleTitle: z.string().trim().max(100).optional(),
  accountNotes: z.string().trim().max(2000).optional(),
  amount: z.number().min(0).optional(),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.string().optional(),
});

// ── Account ──
export const createAccountSchema = z.object({
  name: z.string().trim().min(1, "Nombre es requerido").max(200),
  type: z.enum(["prospect", "client"]).default("prospect"),
  rut: z.string().trim().max(20).optional().nullable(),
  industry: z.string().trim().max(100).optional().nullable(),
  size: z.string().trim().max(50).optional().nullable(),
  segment: z.string().trim().max(100).optional().nullable(),
  status: z.string().trim().max(50).default("active"),
  website: z.string().trim().url("URL inválida").max(500).optional().nullable().or(z.literal("")),
  address: z.string().trim().max(500).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

// ── Contact ──
export const createContactSchema = z.object({
  accountId: z.string().uuid("accountId inválido"),
  name: z.string().trim().min(1, "Nombre es requerido").max(200),
  email: z.string().trim().email("Email inválido").max(200).optional().nullable().or(z.literal("")),
  phone: z.string().trim().max(30).optional().nullable(),
  roleTitle: z.string().trim().max(100).optional().nullable(),
  isPrimary: z.boolean().default(false),
});

// ── Deal ──
export const createDealSchema = z.object({
  accountId: z.string().uuid("accountId inválido"),
  title: z.string().trim().max(200).optional(),
  stageId: z.string().uuid("stageId inválido").optional(),
  primaryContactId: z.string().uuid("primaryContactId inválido").optional().nullable(),
  amount: z.number().min(0).default(0),
  probability: z.number().min(0).max(100).default(0),
  expectedCloseDate: z.string().optional(),
});

export const updateDealStageSchema = z.object({
  stageId: z.string().uuid("stageId inválido"),
});

export const linkDealQuoteSchema = z.object({
  quoteId: z.string().uuid("quoteId inválido"),
});

// ── Pipeline ──
export const createPipelineStageSchema = z.object({
  name: z.string().trim().min(1, "Nombre es requerido").max(100),
  order: z.number().int().min(0).default(1),
  color: z.string().max(20).optional().nullable(),
  isClosedWon: z.boolean().default(false),
  isClosedLost: z.boolean().default(false),
});

// ── Email Template ──
export const createEmailTemplateSchema = z.object({
  name: z.string().trim().min(1, "Nombre es requerido").max(200),
  subject: z.string().trim().min(1, "Asunto es requerido").max(500),
  body: z.string().trim().min(1, "Cuerpo es requerido").max(10000),
  scope: z.enum(["global", "stage", "deal"]).default("global"),
  stageId: z.string().uuid().optional().nullable(),
});

// ── Gmail Send ──
export const sendEmailSchema = z.object({
  to: z.string().trim().email("Email destinatario inválido"),
  cc: z.array(z.string().email()).default([]),
  bcc: z.array(z.string().email()).default([]),
  subject: z.string().trim().min(1, "Asunto es requerido").max(500),
  html: z.string().max(50000).optional(),
  text: z.string().max(50000).optional(),
  dealId: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),
  contactId: z.string().uuid().optional(),
});

// ── Custom Field ──
export const createCustomFieldSchema = z.object({
  name: z.string().trim().min(1, "Nombre es requerido").max(100),
  entityType: z.string().trim().min(1, "Tipo de entidad es requerido").max(50),
  type: z.enum(["text", "number", "date", "select", "select_multiple", "boolean", "url"]),
  options: z.any().optional(),
  urlLabel: z.string().trim().max(100).optional(),
});
