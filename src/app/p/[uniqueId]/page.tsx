/**
 * Página pública de presentación
 * Renderiza una presentación completa tipo Qwilr
 * 
 * Ruta: /p/[uniqueId]
 */

import { PresentationRenderer } from '@/components/presentation/PresentationRenderer';
import { getMockPresentationPayload } from '@/lib/mock-data';
import { mapZohoDataToPresentation } from '@/lib/zoho-mapper';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

interface PresentationPageProps {
  params: Promise<{
    uniqueId: string;
  }>;
}

export default async function PresentationPage({ params }: PresentationPageProps) {
  const { uniqueId } = await params;
  
  // Validar que el uniqueId tenga un formato mínimo
  if (!uniqueId || uniqueId.length < 3) {
    notFound();
  }
  
  // 1. Buscar presentación en BD por uniqueId
  const presentation = await prisma.presentation.findUnique({
    where: { uniqueId },
    include: {
      template: true,
    },
  });

  let payload;

  if (presentation) {
    // 2. Usar datos reales de la BD
    const zohoData = presentation.clientData as any;
    payload = mapZohoDataToPresentation(zohoData, presentation.id, presentation.template.slug);
    
    // 3. Registrar vista automáticamente (async, no bloqueante)
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 
               headersList.get('x-real-ip') || 
               'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    // Crear vista en background (fire and forget)
    prisma.presentationView.create({
      data: {
        presentationId: presentation.id,
        ipAddress: ip,
        userAgent,
      },
    }).then(() => {
      // Actualizar contadores
      return prisma.presentation.update({
        where: { id: presentation.id },
        data: {
          viewCount: { increment: 1 },
          lastViewedAt: new Date(),
          firstViewedAt: presentation.firstViewedAt || new Date(),
          status: presentation.status === 'sent' ? 'viewed' : presentation.status,
        },
      });
    }).catch((error) => {
      console.error('Error tracking view:', error);
      // No fallar la página si falla el tracking
    });

  } else {
    // 4. Si no existe en BD, usar mock data (para demos)
    payload = getMockPresentationPayload();
    payload.id = uniqueId;
  }
  
  return <PresentationRenderer payload={payload} />;
}

/**
 * Metadata dinámica para SEO
 */
export async function generateMetadata({ params }: PresentationPageProps) {
  const { uniqueId } = await params;
  
  // Intentar obtener datos reales de la BD
  const presentation = await prisma.presentation.findUnique({
    where: { uniqueId },
  });

  if (presentation) {
    const clientData = presentation.clientData as any;
    const companyName = clientData?.account?.Account_Name || 
                       clientData?.client?.company_name || 
                       'Cliente';

    return {
      title: `Propuesta para ${companyName} | Gard Security`,
      description: 'Propuesta comercial de servicios de seguridad privada',
      robots: 'noindex, nofollow', // Las presentaciones no deben indexarse
    };
  }

  // Fallback para demos
  const payload = getMockPresentationPayload();
  
  return {
    title: `Propuesta para ${payload.client.company_name} | Gard Security`,
    description: payload.quote.description || 'Propuesta comercial de servicios de seguridad',
    robots: 'noindex, nofollow',
  };
}
