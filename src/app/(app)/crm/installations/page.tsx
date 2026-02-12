/**
 * CRM Installations Page - Listado global de instalaciones
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasCrmSubmoduleAccess } from "@/lib/module-access";
import { prisma } from "@/lib/prisma";
import { getDefaultTenantId } from "@/lib/tenant";
import { PageHeader } from "@/components/opai";
import { CrmInstallationsListClient, CrmSubnav } from "@/components/crm";

export default async function CrmInstallationsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/opai/login?callbackUrl=/crm/installations");
  }
  const role = session.user.role;

  if (!hasCrmSubmoduleAccess(role, "installations")) {
    redirect("/crm");
  }

  const tenantId = session.user?.tenantId ?? (await getDefaultTenantId());
  const [installations, accounts] = await Promise.all([
    prisma.crmInstallation.findMany({
      where: { tenantId },
      include: { account: { select: { id: true, name: true, type: true, isActive: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.crmAccount.findMany({
      where: { tenantId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const initialInstallations = JSON.parse(JSON.stringify(installations));
  const initialAccounts = JSON.parse(JSON.stringify(accounts));

  return (
    <>
      <PageHeader
        title="Instalaciones"
        description="Sedes y ubicaciones de clientes"
      />
      <CrmSubnav role={role} />
      <CrmInstallationsListClient
        initialInstallations={initialInstallations}
        accounts={initialAccounts}
      />
    </>
  );
}
