-- CPQ: tenant-aware catalog + defaults
ALTER TABLE cpq.catalog_items
  ADD COLUMN tenant_id TEXT,
  ADD COLUMN is_default BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_cpq_catalog_tenant ON cpq.catalog_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cpq_catalog_tenant_type ON cpq.catalog_items(tenant_id, type);
