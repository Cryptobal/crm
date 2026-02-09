-- Phase 1: CRM/CPQ Redesign Migration
-- 1. CrmInstallation table
-- 2. CpqQuote: CRM context + currency + AI
-- 3. CrmLead: firstName/lastName (replace name)
-- 4. CrmContact: firstName/lastName (replace name)

-- ============================================
-- 1. Create CrmInstallation table
-- ============================================
CREATE TABLE "crm"."installations" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" TEXT NOT NULL,
    "account_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "commune" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "installations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_crm_installations_tenant" ON "crm"."installations"("tenant_id");
CREATE INDEX "idx_crm_installations_account" ON "crm"."installations"("account_id");

ALTER TABLE "crm"."installations"
    ADD CONSTRAINT "installations_account_id_fkey"
    FOREIGN KEY ("account_id") REFERENCES "crm"."accounts"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- 2. Add CRM context columns to CpqQuote
-- ============================================
ALTER TABLE "cpq"."quotes" ADD COLUMN "account_id" UUID;
ALTER TABLE "cpq"."quotes" ADD COLUMN "contact_id" UUID;
ALTER TABLE "cpq"."quotes" ADD COLUMN "deal_id" UUID;
ALTER TABLE "cpq"."quotes" ADD COLUMN "installation_id" UUID;
ALTER TABLE "cpq"."quotes" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'CLP';
ALTER TABLE "cpq"."quotes" ADD COLUMN "ai_description" TEXT;

CREATE INDEX "idx_cpq_quotes_account" ON "cpq"."quotes"("account_id");
CREATE INDEX "idx_cpq_quotes_deal" ON "cpq"."quotes"("deal_id");
CREATE INDEX "idx_cpq_quotes_installation" ON "cpq"."quotes"("installation_id");

ALTER TABLE "cpq"."quotes"
    ADD CONSTRAINT "quotes_installation_id_fkey"
    FOREIGN KEY ("installation_id") REFERENCES "crm"."installations"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================
-- 3. CrmLead: add firstName/lastName, backfill from name
-- ============================================
ALTER TABLE "crm"."leads" ADD COLUMN "first_name" TEXT;
ALTER TABLE "crm"."leads" ADD COLUMN "last_name" TEXT;

-- Backfill: split existing name into firstName (first word) and lastName (rest)
UPDATE "crm"."leads"
SET
    "first_name" = CASE
        WHEN "name" IS NOT NULL AND "name" != '' THEN split_part("name", ' ', 1)
        ELSE NULL
    END,
    "last_name" = CASE
        WHEN "name" IS NOT NULL AND position(' ' IN "name") > 0 THEN substring("name" FROM position(' ' IN "name") + 1)
        ELSE NULL
    END;

-- Drop old name column
ALTER TABLE "crm"."leads" DROP COLUMN "name";

-- ============================================
-- 4. CrmContact: add firstName/lastName, backfill from name
-- ============================================
ALTER TABLE "crm"."contacts" ADD COLUMN "first_name" TEXT NOT NULL DEFAULT '';
ALTER TABLE "crm"."contacts" ADD COLUMN "last_name" TEXT NOT NULL DEFAULT '';

-- Backfill: split existing name into firstName (first word) and lastName (rest)
UPDATE "crm"."contacts"
SET
    "first_name" = CASE
        WHEN "name" IS NOT NULL AND "name" != '' THEN split_part("name", ' ', 1)
        ELSE ''
    END,
    "last_name" = CASE
        WHEN "name" IS NOT NULL AND position(' ' IN "name") > 0 THEN substring("name" FROM position(' ' IN "name") + 1)
        ELSE ''
    END;

-- Drop old name column
ALTER TABLE "crm"."contacts" DROP COLUMN "name";
