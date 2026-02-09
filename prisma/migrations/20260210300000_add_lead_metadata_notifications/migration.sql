-- Add new fields to CRM leads for web form integration
ALTER TABLE crm.leads ADD COLUMN IF NOT EXISTS "industry" TEXT;
ALTER TABLE crm.leads ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE crm.leads ADD COLUMN IF NOT EXISTS "commune" TEXT;
ALTER TABLE crm.leads ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE crm.leads ADD COLUMN IF NOT EXISTS "website" TEXT;
ALTER TABLE crm.leads ADD COLUMN IF NOT EXISTS "service_type" TEXT;
ALTER TABLE crm.leads ADD COLUMN IF NOT EXISTS "metadata" JSONB;

-- Create notifications table
CREATE TABLE IF NOT EXISTS crm."notifications" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "data" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS "idx_notifications_tenant" ON crm."notifications"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_notifications_tenant_read" ON crm."notifications"("tenant_id", "read");
CREATE INDEX IF NOT EXISTS "idx_notifications_created_desc" ON crm."notifications"("created_at" DESC);
