-- Add type column to distinguish prospects from clients
ALTER TABLE "crm"."accounts" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'prospect';

-- Create index for filtering by type
CREATE INDEX "idx_crm_accounts_type" ON "crm"."accounts" ("tenant_id", "type");

-- Backfill: existing accounts with deals that have status 'won' become clients
UPDATE "crm"."accounts" a
SET "type" = 'client'
WHERE EXISTS (
  SELECT 1 FROM "crm"."deals" d
  WHERE d."account_id" = a."id" AND d."status" = 'won'
);
