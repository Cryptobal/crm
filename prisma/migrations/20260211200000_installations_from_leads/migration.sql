-- Installations from web leads: add leadId, make accountId optional
-- When lead arrives with address+lat+lng → create installation with leadId (pending)
-- When lead is approved → create account, link installation to accountId

ALTER TABLE "crm"."installations" ADD COLUMN "lead_id" UUID;

-- Make accountId nullable (installations from leads have no account yet)
ALTER TABLE "crm"."installations" ALTER COLUMN "account_id" DROP NOT NULL;

ALTER TABLE "crm"."installations"
  ADD CONSTRAINT "installations_lead_id_fkey"
  FOREIGN KEY ("lead_id") REFERENCES "crm"."leads"("id") ON DELETE SET NULL;

CREATE INDEX "idx_crm_installations_lead" ON "crm"."installations"("lead_id");
