-- Agregar industrias "Otra" y "Sector Privado" (evitar duplicados)
INSERT INTO "crm"."industries" ("id", "name", "order", "active", "created_at", "updated_at")
SELECT uuid_generate_v4(), 'Otra', 11, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "crm"."industries" WHERE "name" = 'Otra');

INSERT INTO "crm"."industries" ("id", "name", "order", "active", "created_at", "updated_at")
SELECT uuid_generate_v4(), 'Sector Privado', 12, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "crm"."industries" WHERE "name" = 'Sector Privado');
