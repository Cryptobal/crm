-- CreateTable
CREATE TABLE "docs"."doc_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "doc_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_doc_categories_tenant" ON "docs"."doc_categories"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_doc_categories_tenant_module" ON "docs"."doc_categories"("tenant_id", "module");

-- CreateIndex
CREATE UNIQUE INDEX "uq_doc_category_tenant_module_key" ON "docs"."doc_categories"("tenant_id", "module", "key");
