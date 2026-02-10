-- AlterTable: add signed_view_token to documents (public view without login)
ALTER TABLE "docs"."documents" ADD COLUMN "signed_view_token" TEXT;

CREATE UNIQUE INDEX "documents_signed_view_token_key" ON "docs"."documents"("signed_view_token");
