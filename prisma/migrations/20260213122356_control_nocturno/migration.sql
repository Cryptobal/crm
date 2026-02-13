-- CreateTable
CREATE TABLE "ops"."control_nocturno" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "central_operator_name" TEXT NOT NULL,
    "central_label" TEXT,
    "shift_start" TEXT NOT NULL DEFAULT '19:00',
    "shift_end" TEXT NOT NULL DEFAULT '08:00',
    "status" TEXT NOT NULL DEFAULT 'borrador',
    "general_notes" TEXT,
    "submitted_at" TIMESTAMPTZ(6),
    "submitted_by" TEXT,
    "approved_at" TIMESTAMPTZ(6),
    "approved_by" TEXT,
    "rejected_at" TIMESTAMPTZ(6),
    "rejected_by" TEXT,
    "rejection_reason" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "control_nocturno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ops"."control_nocturno_instalaciones" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "control_nocturno_id" UUID NOT NULL,
    "installation_id" UUID,
    "installation_name" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "guardias_requeridos" INTEGER NOT NULL DEFAULT 1,
    "guardias_presentes" INTEGER NOT NULL DEFAULT 0,
    "hora_llegada_turno_dia" TEXT,
    "guardia_dia_nombres" TEXT,
    "status_instalacion" TEXT NOT NULL DEFAULT 'normal',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "control_nocturno_instalaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ops"."control_nocturno_guardias" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "control_instalacion_id" UUID NOT NULL,
    "guardia_id" UUID,
    "guardia_nombre" TEXT NOT NULL,
    "is_extra" BOOLEAN NOT NULL DEFAULT false,
    "hora_llegada" TEXT,
    "foto_evidencia_url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "control_nocturno_guardias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ops"."control_nocturno_rondas" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "control_instalacion_id" UUID NOT NULL,
    "ronda_number" INTEGER NOT NULL,
    "hora_esperada" TEXT NOT NULL,
    "hora_marcada" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendiente',
    "ejecucion_ronda_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "control_nocturno_rondas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_ops_control_nocturno_date_central" ON "ops"."control_nocturno"("tenant_id", "date", "central_label");

-- CreateIndex
CREATE INDEX "idx_ops_control_nocturno_tenant" ON "ops"."control_nocturno"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_ops_control_nocturno_tenant_date" ON "ops"."control_nocturno"("tenant_id", "date");

-- CreateIndex
CREATE INDEX "idx_ops_control_nocturno_status" ON "ops"."control_nocturno"("status");

-- CreateIndex
CREATE INDEX "idx_ops_cn_instalacion_control" ON "ops"."control_nocturno_instalaciones"("control_nocturno_id");

-- CreateIndex
CREATE INDEX "idx_ops_cn_instalacion_installation" ON "ops"."control_nocturno_instalaciones"("installation_id");

-- CreateIndex
CREATE INDEX "idx_ops_cn_guardia_instalacion" ON "ops"."control_nocturno_guardias"("control_instalacion_id");

-- CreateIndex
CREATE INDEX "idx_ops_cn_guardia_guardia" ON "ops"."control_nocturno_guardias"("guardia_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_ops_cn_ronda_inst_number" ON "ops"."control_nocturno_rondas"("control_instalacion_id", "ronda_number");

-- CreateIndex
CREATE INDEX "idx_ops_cn_ronda_instalacion" ON "ops"."control_nocturno_rondas"("control_instalacion_id");

-- AddForeignKey
ALTER TABLE "ops"."control_nocturno_instalaciones" ADD CONSTRAINT "control_nocturno_instalaciones_control_nocturno_id_fkey" FOREIGN KEY ("control_nocturno_id") REFERENCES "ops"."control_nocturno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ops"."control_nocturno_instalaciones" ADD CONSTRAINT "control_nocturno_instalaciones_installation_id_fkey" FOREIGN KEY ("installation_id") REFERENCES "crm"."installations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ops"."control_nocturno_guardias" ADD CONSTRAINT "control_nocturno_guardias_control_instalacion_id_fkey" FOREIGN KEY ("control_instalacion_id") REFERENCES "ops"."control_nocturno_instalaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ops"."control_nocturno_guardias" ADD CONSTRAINT "control_nocturno_guardias_guardia_id_fkey" FOREIGN KEY ("guardia_id") REFERENCES "ops"."guardias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ops"."control_nocturno_rondas" ADD CONSTRAINT "control_nocturno_rondas_control_instalacion_id_fkey" FOREIGN KEY ("control_instalacion_id") REFERENCES "ops"."control_nocturno_instalaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
