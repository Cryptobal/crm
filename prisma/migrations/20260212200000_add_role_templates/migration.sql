-- CreateTable: RoleTemplate
CREATE TABLE "public"."role_templates" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "permissions" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_role_templates_tenant" ON "public"."role_templates"("tenant_id");

-- CreateUniqueIndex
CREATE UNIQUE INDEX "uq_role_template_tenant_slug" ON "public"."role_templates"("tenant_id", "slug");

-- AlterTable: Add roleTemplateId to Admin
ALTER TABLE "public"."Admin" ADD COLUMN "role_template_id" TEXT;

-- CreateIndex
CREATE INDEX "Admin_role_template_id_idx" ON "public"."Admin"("role_template_id");

-- AddForeignKey
ALTER TABLE "public"."role_templates" ADD CONSTRAINT "role_templates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Admin" ADD CONSTRAINT "Admin_role_template_id_fkey" FOREIGN KEY ("role_template_id") REFERENCES "public"."role_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed default role templates for all existing tenants
INSERT INTO "public"."role_templates" ("id", "tenant_id", "name", "slug", "description", "is_system", "permissions", "created_at", "updated_at")
SELECT
    gen_random_uuid()::text,
    t.id,
    r.name,
    r.slug,
    r.description,
    r.is_system,
    r.permissions::jsonb,
    NOW(),
    NOW()
FROM "public"."Tenant" t
CROSS JOIN (VALUES
    ('owner', 'Propietario', 'Acceso total a todos los módulos y funciones. No se puede modificar.', true,
     '{"modules":{"hub":"full","ops":"full","crm":"full","docs":"full","payroll":"full","cpq":"full","config":"full"},"submodules":{},"capabilities":{"invite_users":true,"manage_users":true,"te_approve":true,"te_pay":true,"guardias_blacklist":true,"manage_settings":true}}'),
    ('admin', 'Administrador', 'Acceso total a todos los módulos y funciones.', true,
     '{"modules":{"hub":"full","ops":"full","crm":"full","docs":"full","payroll":"full","cpq":"full","config":"full"},"submodules":{},"capabilities":{"invite_users":true,"manage_users":true,"te_approve":true,"te_pay":true,"guardias_blacklist":true,"manage_settings":true}}'),
    ('editor', 'Editor', 'Puede editar en todos los módulos excepto configuración.', false,
     '{"modules":{"hub":"full","ops":"edit","crm":"edit","docs":"edit","payroll":"edit","cpq":"edit","config":"none"},"submodules":{},"capabilities":{"te_approve":true}}'),
    ('rrhh', 'RRHH', 'Operaciones con foco en gestión de guardias y lista negra.', false,
     '{"modules":{"hub":"view","ops":"edit","crm":"none","docs":"none","payroll":"none","cpq":"none","config":"none"},"submodules":{},"capabilities":{"guardias_blacklist":true}}'),
    ('operaciones', 'Operaciones', 'Gestión operativa completa: puestos, pauta, asistencia, turnos extra.', false,
     '{"modules":{"hub":"view","ops":"edit","crm":"none","docs":"none","payroll":"none","cpq":"none","config":"none"},"submodules":{},"capabilities":{"te_approve":true}}'),
    ('reclutamiento', 'Reclutamiento', 'Gestión de guardias para procesos de selección.', false,
     '{"modules":{"hub":"view","ops":"edit","crm":"none","docs":"none","payroll":"none","cpq":"none","config":"none"},"submodules":{},"capabilities":{}}'),
    ('solo_ops', 'Solo Operaciones', 'Acceso exclusivo al módulo de operaciones.', false,
     '{"modules":{"hub":"view","ops":"edit","crm":"none","docs":"none","payroll":"none","cpq":"none","config":"none"},"submodules":{},"capabilities":{}}'),
    ('solo_crm', 'Solo CRM', 'Acceso exclusivo al módulo CRM.', false,
     '{"modules":{"hub":"view","ops":"none","crm":"edit","docs":"none","payroll":"none","cpq":"none","config":"none"},"submodules":{},"capabilities":{}}'),
    ('solo_documentos', 'Solo Documentos', 'Acceso de visualización al módulo de documentos.', false,
     '{"modules":{"hub":"view","ops":"none","crm":"none","docs":"view","payroll":"none","cpq":"none","config":"none"},"submodules":{},"capabilities":{}}'),
    ('solo_payroll', 'Solo Payroll', 'Acceso exclusivo al módulo de payroll.', false,
     '{"modules":{"hub":"view","ops":"none","crm":"none","docs":"none","payroll":"edit","cpq":"none","config":"none"},"submodules":{},"capabilities":{}}'),
    ('viewer', 'Viewer', 'Solo lectura en documentos.', false,
     '{"modules":{"hub":"view","ops":"none","crm":"none","docs":"view","payroll":"none","cpq":"none","config":"none"},"submodules":{},"capabilities":{}}')
) AS r(slug, name, description, is_system, permissions);

-- Link existing admins to their matching role templates
UPDATE "public"."Admin" a
SET "role_template_id" = rt.id
FROM "public"."role_templates" rt
WHERE rt."tenant_id" = a."tenantId"
  AND rt."slug" = a."role";
