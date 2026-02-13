import type { Metadata } from "next";
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AppLayoutClient } from '@/components/opai/AppLayoutClient';
import { resolvePermissions } from '@/lib/permissions-server';
import { PermissionsProvider } from '@/lib/permissions-context';

/** Evita pre-render en build; todas las rutas requieren auth/DB */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "OPAI Suite - Gard Security",
  description: "Suite de aplicaciones inteligentes para Gard Security",
};

/**
 * Layout para rutas privadas de la aplicación (App UI)
 * 
 * Server Component que valida autenticación, resuelve permisos
 * y provee el contexto de permisos a toda la app.
 * 
 * Aplica a:
 * - /opai/* (dashboard, usuarios, etc)
 * - /crm
 * - /hub
 */
export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Auth check (Server Component)
  const session = await auth();
  if (!session?.user) {
    redirect('/opai/login');
  }

  // Resolver permisos desde role template (BD) o role legacy (defaults)
  const permissions = await resolvePermissions({
    role: session.user.role,
    roleTemplateId: session.user.roleTemplateId,
  });

  // Delegar UI al Client Component con permisos resueltos
  return (
    <PermissionsProvider permissions={permissions}>
      <AppLayoutClient
        userName={session.user?.name}
        userEmail={session.user?.email}
        userRole={session.user.role}
        permissions={permissions}
      >
        {children}
      </AppLayoutClient>
    </PermissionsProvider>
  );
}
