import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/opai";
import { ConfigBackLink } from "@/components/opai";
import { hasConfigSubmoduleAccess } from "@/lib/module-access";
import { DocCategoriesClient } from "@/components/docs/DocCategoriesClient";

export default async function CategoriasPlantillasPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/opai/login?callbackUrl=/opai/configuracion/categorias-plantillas");
  }

  const role = session.user.role;
  if (!hasConfigSubmoduleAccess(role, "doc_categories")) {
    redirect("/opai/configuracion");
  }

  return (
    <>
      <ConfigBackLink />
      <PageHeader
        title="Categorías de plantillas"
        description="Gestiona las categorías por módulo para Gestión Documental (documentos y mails)"
      />
      <DocCategoriesClient />
    </>
  );
}
