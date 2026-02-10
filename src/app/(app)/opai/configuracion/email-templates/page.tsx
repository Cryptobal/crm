import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/opai";
import { prisma } from "@/lib/prisma";
import { getDefaultTenantId } from "@/lib/tenant";
import { ConfigBackLink, EmailTemplatesClient } from "@/components/opai";
import { hasConfigSubmoduleAccess } from "@/lib/module-access";

export default async function EmailTemplatesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/opai/login?callbackUrl=/opai/configuracion/email-templates");
  }

  const role = session.user.role;
  if (!hasConfigSubmoduleAccess(role, "email_templates")) {
    redirect("/opai/configuracion");
  }

  const tenantId = session.user?.tenantId ?? (await getDefaultTenantId());
  const templates = await prisma.crmEmailTemplate.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });

  const initialTemplates = JSON.parse(JSON.stringify(templates));

  return (
    <>
      <ConfigBackLink />
      <PageHeader
        title="Templates de email"
        description="Crea templates con placeholders para seguimiento"
      />
      <EmailTemplatesClient initialTemplates={initialTemplates} />
    </>
  );
}
