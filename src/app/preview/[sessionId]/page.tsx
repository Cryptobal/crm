/**
 * Preview Draft Page
 * 
 * Muestra vista previa del borrador de presentación
 * con datos reales de Zoho CRM
 * 
 * Ruta: /preview/[sessionId]
 */

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PresentationRenderer } from '@/components/presentation/PresentationRenderer';
import { mapZohoDataToPresentation } from '@/lib/zoho-mapper';
import Link from 'next/link';

interface PreviewPageProps {
  params: Promise<{
    sessionId: string;
  }>;
  searchParams: Promise<{
    template?: string;
  }>;
}

export default async function PreviewPage({ params, searchParams }: PreviewPageProps) {
  const { sessionId } = await params;
  const { template: templateSlug } = await searchParams;

  // 1. Buscar sesión de webhook
  const webhookSession = await prisma.webhookSession.findUnique({
    where: { sessionId },
  });

  // 2. Validar que existe y no expiró
  if (!webhookSession) {
    notFound();
  }

  if (webhookSession.status === 'expired' || new Date() > webhookSession.expiresAt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-4">⏰ Sesión Expirada</h1>
          <p className="text-white/70 mb-6">
            Esta sesión de preview ha expirado. Por favor, genera una nueva desde Zoho CRM.
          </p>
          <p className="text-sm text-white/50">
            Sesión ID: {sessionId}
          </p>
        </div>
      </div>
    );
  }

  // 3. Obtener datos de Zoho
  const zohoData = webhookSession.zohoData as any;

  // 4. Obtener template (usa el especificado o el default)
  const template = await prisma.template.findFirst({
    where: templateSlug 
      ? { slug: templateSlug, active: true }
      : { isDefault: true, active: true },
  });

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-4">❌ Template no encontrado</h1>
          <p className="text-white/70">
            No hay templates disponibles actualmente.
          </p>
        </div>
      </div>
    );
  }

  // 5. Mapear datos de Zoho a PresentationPayload
  const presentationData = mapZohoDataToPresentation(zohoData, sessionId, template.slug);

  // 6. Renderizar presentación
  return (
    <div className="relative">
      {/* Banner de preview */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black py-3 px-4 text-center font-semibold text-sm shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            📋 PREVIEW DE BORRADOR - Cliente: {presentationData.client.company_name}
          </div>
          <div className="text-xs">
            Expira: {webhookSession.expiresAt.toLocaleString('es-CL')}
          </div>
        </div>
      </div>

      {/* Presentación */}
      <div className="pt-14">
        <PresentationRenderer payload={presentationData} />
      </div>

      {/* Botones de acción */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-white/10 p-4 shadow-2xl">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            href={`/api/presentations/send-email?sessionId=${sessionId}`}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold rounded-lg hover:scale-105 transition-transform text-center shadow-lg shadow-teal-500/50"
          >
            📧 Enviar por Email
          </Link>
          <Link
            href="/admin/presentations"
            className="w-full sm:w-auto px-8 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors text-center"
          >
            💾 Guardar como Borrador
          </Link>
          <button
            onClick={() => window.close()}
            className="w-full sm:w-auto px-8 py-3 bg-red-500/20 text-red-300 font-semibold rounded-lg hover:bg-red-500/30 transition-colors"
          >
            ❌ Cancelar
          </button>
        </div>
      </div>
      
      {/* Espaciador para los botones */}
      <div className="h-24" />
    </div>
  );
}
