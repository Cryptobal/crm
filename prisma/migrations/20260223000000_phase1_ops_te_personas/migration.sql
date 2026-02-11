-- ============================================
-- FASE 1 OPI - Ops + TE + Personas (MVP)
-- ============================================

-- Create schema
CREATE SCHEMA IF NOT EXISTS "ops";

-- Extend CRM installations for operational data
ALTER TABLE "crm"."installations"
  ADD COLUMN IF NOT EXISTS "geo_radius_m" INTEGER NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS "te_monto_clp" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- Personas
CREATE TABLE "ops"."personas" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" TEXT NOT NULL,
  "first_name" TEXT NOT NULL,
  "last_name" TEXT NOT NULL,
  "rut" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "status" TEXT NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "personas_pkey" PRIMARY KEY ("id")
);

-- Guardias
CREATE TABLE "ops"."guardias" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" TEXT NOT NULL,
  "persona_id" UUID NOT NULL,
  "code" TEXT,
  "status" TEXT NOT NULL DEFAULT 'active',
  "is_blacklisted" BOOLEAN NOT NULL DEFAULT false,
  "blacklist_reason" TEXT,
  "blacklisted_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "guardias_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "guardias_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "ops"."personas"("id") ON DELETE CASCADE
);

-- Guardia flags
CREATE TABLE "ops"."guardia_flags" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" TEXT NOT NULL,
  "guardia_id" UUID NOT NULL,
  "type" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "severity" TEXT NOT NULL DEFAULT 'info',
  "notes" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_by" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "guardia_flags_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "guardia_flags_guardia_id_fkey" FOREIGN KEY ("guardia_id") REFERENCES "ops"."guardias"("id") ON DELETE CASCADE
);

-- Guardia documents
CREATE TABLE "ops"."documentos_persona" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" TEXT NOT NULL,
  "guardia_id" UUID NOT NULL,
  "type" TEXT NOT NULL,
  "file_url" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "issued_at" DATE,
  "expires_at" DATE,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "documentos_persona_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "documentos_persona_guardia_id_fkey" FOREIGN KEY ("guardia_id") REFERENCES "ops"."guardias"("id") ON DELETE CASCADE
);

-- Bank accounts
CREATE TABLE "ops"."cuentas_bancarias" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" TEXT NOT NULL,
  "guardia_id" UUID NOT NULL,
  "bank_name" TEXT NOT NULL,
  "account_type" TEXT NOT NULL,
  "account_number" TEXT NOT NULL,
  "holder_name" TEXT NOT NULL,
  "holder_rut" TEXT,
  "is_default" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "cuentas_bancarias_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "cuentas_bancarias_guardia_id_fkey" FOREIGN KEY ("guardia_id") REFERENCES "ops"."guardias"("id") ON DELETE CASCADE
);

-- Guardia comments
CREATE TABLE "ops"."comentarios_guardia" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" TEXT NOT NULL,
  "guardia_id" UUID NOT NULL,
  "comment" TEXT NOT NULL,
  "created_by" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "comentarios_guardia_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "comentarios_guardia_guardia_id_fkey" FOREIGN KEY ("guardia_id") REFERENCES "ops"."guardias"("id") ON DELETE CASCADE
);

-- Operational posts
CREATE TABLE "ops"."puestos_operativos" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" TEXT NOT NULL,
  "installation_id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "shift_start" TEXT NOT NULL,
  "shift_end" TEXT NOT NULL,
  "weekdays" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "required_guards" INTEGER NOT NULL DEFAULT 1,
  "te_monto_clp" DECIMAL(12,2),
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_by" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "puestos_operativos_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "puestos_operativos_installation_id_fkey" FOREIGN KEY ("installation_id") REFERENCES "crm"."installations"("id") ON DELETE CASCADE
);

-- Monthly roster
CREATE TABLE "ops"."pauta_mensual" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" TEXT NOT NULL,
  "installation_id" UUID NOT NULL,
  "puesto_id" UUID NOT NULL,
  "date" DATE NOT NULL,
  "planned_guardia_id" UUID,
  "status" TEXT NOT NULL DEFAULT 'planificado',
  "notes" TEXT,
  "created_by" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "pauta_mensual_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "pauta_mensual_installation_id_fkey" FOREIGN KEY ("installation_id") REFERENCES "crm"."installations"("id") ON DELETE CASCADE,
  CONSTRAINT "pauta_mensual_puesto_id_fkey" FOREIGN KEY ("puesto_id") REFERENCES "ops"."puestos_operativos"("id") ON DELETE CASCADE,
  CONSTRAINT "pauta_mensual_planned_guardia_id_fkey" FOREIGN KEY ("planned_guardia_id") REFERENCES "ops"."guardias"("id") ON DELETE SET NULL
);

-- RRHH events
CREATE TABLE "ops"."eventos_rrhh" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" TEXT NOT NULL,
  "guardia_id" UUID,
  "date" DATE NOT NULL,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'approved',
  "notes" TEXT,
  "created_by" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "eventos_rrhh_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "eventos_rrhh_guardia_id_fkey" FOREIGN KEY ("guardia_id") REFERENCES "ops"."guardias"("id") ON DELETE SET NULL
);

-- Daily attendance
CREATE TABLE "ops"."asistencia_diaria" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" TEXT NOT NULL,
  "installation_id" UUID NOT NULL,
  "puesto_id" UUID NOT NULL,
  "date" DATE NOT NULL,
  "planned_guardia_id" UUID,
  "actual_guardia_id" UUID,
  "replacement_guardia_id" UUID,
  "attendance_status" TEXT NOT NULL DEFAULT 'pendiente',
  "check_in_at" TIMESTAMPTZ(6),
  "check_out_at" TIMESTAMPTZ(6),
  "notes" TEXT,
  "te_generated" BOOLEAN NOT NULL DEFAULT false,
  "created_by" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "asistencia_diaria_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "asistencia_diaria_installation_id_fkey" FOREIGN KEY ("installation_id") REFERENCES "crm"."installations"("id") ON DELETE CASCADE,
  CONSTRAINT "asistencia_diaria_puesto_id_fkey" FOREIGN KEY ("puesto_id") REFERENCES "ops"."puestos_operativos"("id") ON DELETE CASCADE,
  CONSTRAINT "asistencia_diaria_planned_guardia_id_fkey" FOREIGN KEY ("planned_guardia_id") REFERENCES "ops"."guardias"("id") ON DELETE SET NULL,
  CONSTRAINT "asistencia_diaria_actual_guardia_id_fkey" FOREIGN KEY ("actual_guardia_id") REFERENCES "ops"."guardias"("id") ON DELETE SET NULL,
  CONSTRAINT "asistencia_diaria_replacement_guardia_id_fkey" FOREIGN KEY ("replacement_guardia_id") REFERENCES "ops"."guardias"("id") ON DELETE SET NULL
);

-- Extra shifts
CREATE TABLE "ops"."turnos_extra" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" TEXT NOT NULL,
  "asistencia_id" UUID,
  "installation_id" UUID NOT NULL,
  "puesto_id" UUID,
  "guardia_id" UUID NOT NULL,
  "date" DATE NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "amount_clp" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "approved_by" TEXT,
  "approved_at" TIMESTAMPTZ(6),
  "rejected_by" TEXT,
  "rejected_at" TIMESTAMPTZ(6),
  "rejection_reason" TEXT,
  "paid_at" TIMESTAMPTZ(6),
  "created_by" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "turnos_extra_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "turnos_extra_asistencia_id_fkey" FOREIGN KEY ("asistencia_id") REFERENCES "ops"."asistencia_diaria"("id") ON DELETE SET NULL,
  CONSTRAINT "turnos_extra_installation_id_fkey" FOREIGN KEY ("installation_id") REFERENCES "crm"."installations"("id") ON DELETE CASCADE,
  CONSTRAINT "turnos_extra_puesto_id_fkey" FOREIGN KEY ("puesto_id") REFERENCES "ops"."puestos_operativos"("id") ON DELETE SET NULL,
  CONSTRAINT "turnos_extra_guardia_id_fkey" FOREIGN KEY ("guardia_id") REFERENCES "ops"."guardias"("id") ON DELETE RESTRICT
);

-- Payment batches
CREATE TABLE "ops"."pago_te_lotes" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "week_start" DATE NOT NULL,
  "week_end" DATE NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "total_amount_clp" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "created_by" TEXT,
  "paid_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "pago_te_lotes_pkey" PRIMARY KEY ("id")
);

-- Payment items
CREATE TABLE "ops"."pago_te_items" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "tenant_id" TEXT NOT NULL,
  "lote_id" UUID NOT NULL,
  "turno_extra_id" UUID NOT NULL,
  "guardia_id" UUID NOT NULL,
  "amount_clp" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "paid_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "pago_te_items_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "pago_te_items_lote_id_fkey" FOREIGN KEY ("lote_id") REFERENCES "ops"."pago_te_lotes"("id") ON DELETE CASCADE,
  CONSTRAINT "pago_te_items_turno_extra_id_fkey" FOREIGN KEY ("turno_extra_id") REFERENCES "ops"."turnos_extra"("id") ON DELETE CASCADE,
  CONSTRAINT "pago_te_items_guardia_id_fkey" FOREIGN KEY ("guardia_id") REFERENCES "ops"."guardias"("id") ON DELETE RESTRICT
);

-- Unique constraints
CREATE UNIQUE INDEX "uq_ops_guardias_tenant_code" ON "ops"."guardias"("tenant_id", "code");
CREATE UNIQUE INDEX "guardias_persona_id_key" ON "ops"."guardias"("persona_id");
CREATE UNIQUE INDEX "uq_ops_pauta_puesto_fecha" ON "ops"."pauta_mensual"("puesto_id", "date");
CREATE UNIQUE INDEX "uq_ops_asistencia_puesto_fecha" ON "ops"."asistencia_diaria"("puesto_id", "date");
CREATE UNIQUE INDEX "turnos_extra_asistencia_id_key" ON "ops"."turnos_extra"("asistencia_id");
CREATE UNIQUE INDEX "pago_te_lotes_code_key" ON "ops"."pago_te_lotes"("code");
CREATE UNIQUE INDEX "pago_te_items_turno_extra_id_key" ON "ops"."pago_te_items"("turno_extra_id");

-- Indexes
CREATE INDEX "idx_ops_personas_tenant" ON "ops"."personas"("tenant_id");
CREATE INDEX "idx_ops_personas_status" ON "ops"."personas"("status");
CREATE INDEX "idx_ops_personas_rut" ON "ops"."personas"("rut");

CREATE INDEX "idx_ops_guardias_tenant" ON "ops"."guardias"("tenant_id");
CREATE INDEX "idx_ops_guardias_status" ON "ops"."guardias"("status");
CREATE INDEX "idx_ops_guardias_blacklist" ON "ops"."guardias"("is_blacklisted");

CREATE INDEX "idx_ops_guardia_flags_tenant" ON "ops"."guardia_flags"("tenant_id");
CREATE INDEX "idx_ops_guardia_flags_guardia" ON "ops"."guardia_flags"("guardia_id");
CREATE INDEX "idx_ops_guardia_flags_active" ON "ops"."guardia_flags"("active");

CREATE INDEX "idx_ops_docs_persona_tenant" ON "ops"."documentos_persona"("tenant_id");
CREATE INDEX "idx_ops_docs_persona_guardia" ON "ops"."documentos_persona"("guardia_id");
CREATE INDEX "idx_ops_docs_persona_expires" ON "ops"."documentos_persona"("expires_at");

CREATE INDEX "idx_ops_cuentas_bancarias_tenant" ON "ops"."cuentas_bancarias"("tenant_id");
CREATE INDEX "idx_ops_cuentas_bancarias_guardia" ON "ops"."cuentas_bancarias"("guardia_id");
CREATE INDEX "idx_ops_cuentas_bancarias_default" ON "ops"."cuentas_bancarias"("is_default");

CREATE INDEX "idx_ops_comentarios_guardia_tenant" ON "ops"."comentarios_guardia"("tenant_id");
CREATE INDEX "idx_ops_comentarios_guardia_guardia" ON "ops"."comentarios_guardia"("guardia_id");

CREATE INDEX "idx_ops_puestos_tenant" ON "ops"."puestos_operativos"("tenant_id");
CREATE INDEX "idx_ops_puestos_installation" ON "ops"."puestos_operativos"("installation_id");
CREATE INDEX "idx_ops_puestos_active" ON "ops"."puestos_operativos"("active");

CREATE INDEX "idx_ops_pauta_tenant" ON "ops"."pauta_mensual"("tenant_id");
CREATE INDEX "idx_ops_pauta_installation_date" ON "ops"."pauta_mensual"("installation_id", "date");
CREATE INDEX "idx_ops_pauta_guardia" ON "ops"."pauta_mensual"("planned_guardia_id");

CREATE INDEX "idx_ops_eventos_rrhh_tenant" ON "ops"."eventos_rrhh"("tenant_id");
CREATE INDEX "idx_ops_eventos_rrhh_guardia" ON "ops"."eventos_rrhh"("guardia_id");
CREATE INDEX "idx_ops_eventos_rrhh_date" ON "ops"."eventos_rrhh"("date");

CREATE INDEX "idx_ops_asistencia_tenant" ON "ops"."asistencia_diaria"("tenant_id");
CREATE INDEX "idx_ops_asistencia_installation_date" ON "ops"."asistencia_diaria"("installation_id", "date");
CREATE INDEX "idx_ops_asistencia_status" ON "ops"."asistencia_diaria"("attendance_status");

CREATE INDEX "idx_ops_turnos_extra_tenant" ON "ops"."turnos_extra"("tenant_id");
CREATE INDEX "idx_ops_turnos_extra_status" ON "ops"."turnos_extra"("status");
CREATE INDEX "idx_ops_turnos_extra_date" ON "ops"."turnos_extra"("date");
CREATE INDEX "idx_ops_turnos_extra_guardia" ON "ops"."turnos_extra"("guardia_id");
CREATE INDEX "idx_ops_turnos_extra_installation" ON "ops"."turnos_extra"("installation_id");

CREATE INDEX "idx_ops_pago_te_lotes_tenant" ON "ops"."pago_te_lotes"("tenant_id");
CREATE INDEX "idx_ops_pago_te_lotes_status" ON "ops"."pago_te_lotes"("status");
CREATE INDEX "idx_ops_pago_te_lotes_week" ON "ops"."pago_te_lotes"("week_start", "week_end");

CREATE INDEX "idx_ops_pago_te_items_tenant" ON "ops"."pago_te_items"("tenant_id");
CREATE INDEX "idx_ops_pago_te_items_lote" ON "ops"."pago_te_items"("lote_id");
CREATE INDEX "idx_ops_pago_te_items_guardia" ON "ops"."pago_te_items"("guardia_id");
CREATE INDEX "idx_ops_pago_te_items_status" ON "ops"."pago_te_items"("status");
