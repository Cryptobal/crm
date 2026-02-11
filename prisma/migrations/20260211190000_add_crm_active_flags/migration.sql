-- Add rigid active flags for CRM accounts/installations.
ALTER TABLE "crm"."accounts"
ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "crm"."installations"
ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT false;

-- Backfill account active flag from current status.
UPDATE "crm"."accounts"
SET "is_active" = CASE
  WHEN LOWER(COALESCE("status", "active")) = 'inactive' THEN false
  ELSE true
END;

-- Backfill installation active flag from legacy metadata marker when present.
UPDATE "crm"."installations"
SET "is_active" = CASE
  WHEN "metadata" IS NOT NULL AND ("metadata" ? 'isActive')
    THEN COALESCE(("metadata"->>'isActive')::boolean, false)
  ELSE false
END;

CREATE INDEX "idx_crm_accounts_is_active"
ON "crm"."accounts"("is_active");

CREATE INDEX "idx_crm_installations_is_active"
ON "crm"."installations"("is_active");
