-- ============================================================
-- Migration: Add email tracking, follow-up sequences & signatures
-- ============================================================

-- 1. Add tracking columns to crm.email_messages
ALTER TABLE crm.email_messages
  ADD COLUMN IF NOT EXISTS resend_id          TEXT,
  ADD COLUMN IF NOT EXISTS email_status       TEXT NOT NULL DEFAULT 'queued',
  ADD COLUMN IF NOT EXISTS delivered_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS first_opened_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_opened_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS open_count         INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS first_clicked_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS click_count        INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bounced_at         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS bounce_type        TEXT,
  ADD COLUMN IF NOT EXISTS signature_id       UUID,
  ADD COLUMN IF NOT EXISTS followup_log_id    UUID,
  ADD COLUMN IF NOT EXISTS source             TEXT NOT NULL DEFAULT 'manual';

CREATE INDEX IF NOT EXISTS idx_crm_email_messages_resend
  ON crm.email_messages (resend_id);

CREATE INDEX IF NOT EXISTS idx_crm_email_messages_followup
  ON crm.email_messages (followup_log_id);

-- 2. Follow-up configuration (one per tenant)
CREATE TABLE IF NOT EXISTS crm.crm_followup_config (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id               TEXT NOT NULL UNIQUE,
  first_followup_days     INT NOT NULL DEFAULT 3,
  second_followup_days    INT NOT NULL DEFAULT 7,
  first_email_template_id UUID,
  second_email_template_id UUID,
  whatsapp_first_enabled  BOOLEAN NOT NULL DEFAULT true,
  whatsapp_second_enabled BOOLEAN NOT NULL DEFAULT true,
  auto_advance_stage      BOOLEAN NOT NULL DEFAULT true,
  pause_on_reply          BOOLEAN NOT NULL DEFAULT true,
  send_hour               INT NOT NULL DEFAULT 9,
  is_active               BOOLEAN NOT NULL DEFAULT true,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_followup_config_tenant
  ON crm.crm_followup_config (tenant_id);

-- 3. Follow-up log (tracks each scheduled / sent follow-up)
CREATE TABLE IF NOT EXISTS crm.crm_followup_logs (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id         TEXT NOT NULL,
  deal_id           UUID NOT NULL REFERENCES crm.deals(id) ON DELETE CASCADE,
  sequence          INT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending',
  scheduled_at      TIMESTAMPTZ NOT NULL,
  sent_at           TIMESTAMPTZ,
  email_message_id  UUID,
  template_id       UUID,
  error             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_followup_logs_tenant_status
  ON crm.crm_followup_logs (tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_crm_followup_logs_scheduled
  ON crm.crm_followup_logs (scheduled_at);

CREATE INDEX IF NOT EXISTS idx_crm_followup_logs_deal
  ON crm.crm_followup_logs (deal_id);

-- 4. Email signatures
CREATE TABLE IF NOT EXISTS crm.email_signatures (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id    TEXT NOT NULL,
  user_id      TEXT,
  name         TEXT NOT NULL,
  content      JSONB NOT NULL,
  html_content TEXT,
  is_default   BOOLEAN NOT NULL DEFAULT false,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_signatures_tenant
  ON crm.email_signatures (tenant_id);

CREATE INDEX IF NOT EXISTS idx_crm_signatures_user
  ON crm.email_signatures (user_id);

CREATE INDEX IF NOT EXISTS idx_crm_signatures_default
  ON crm.email_signatures (tenant_id, is_default);
