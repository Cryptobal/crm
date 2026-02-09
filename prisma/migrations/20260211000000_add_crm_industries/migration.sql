-- CreateTable
CREATE TABLE "crm"."industries" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "industries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "industries_name_key" ON "crm"."industries"("name");

-- CreateIndex
CREATE INDEX "idx_crm_industries_active" ON "crm"."industries"("active");

-- Seed default industries (matching Gard cotizador)
INSERT INTO "crm"."industries" ("id", "name", "order", "active", "created_at", "updated_at")
VALUES
  (uuid_generate_v4(), 'Banca y Finanzas', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'Retail y Centros Comerciales', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'Salud (Hospitales y Clínicas)', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'Educación (Colegios y Universidades)', 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'Infraestructura Crítica', 5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'Transporte y Logística', 6, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'Construcción e Inmobiliario', 7, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'Minería y Energía', 8, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'Corporativo y Oficinas', 9, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (uuid_generate_v4(), 'Condominios y Residencias', 10, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
