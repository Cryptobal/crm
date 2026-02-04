/**
 * Página pública de presentación
 * Renderiza una presentación completa tipo Qwilr
 */

import { PresentationRenderer } from '@/components/presentation/PresentationRenderer';
import { getMockPresentationPayload } from '@/lib/mock-data';
import { notFound } from 'next/navigation';

interface PresentationPageProps {
  params: Promise<{
    uniqueId: string;
  }>;
}

export default async function PresentationPage({ params }: PresentationPageProps) {
  const { uniqueId } = await params;
  
  // TODO: En producción, buscar en la base de datos por uniqueId
  // Por ahora, usamos mock data para cualquier ID
  
  // Validar que el uniqueId tenga un formato mínimo
  if (!uniqueId || uniqueId.length < 3) {
    notFound();
  }
  
  // Obtener payload (por ahora mock, luego desde BD)
  const payload = getMockPresentationPayload();
  
  // Actualizar el ID con el del parámetro
  payload.id = uniqueId;
  
  return <PresentationRenderer payload={payload} />;
}

/**
 * Metadata dinámica para SEO
 */
export async function generateMetadata({ params }: PresentationPageProps) {
  const { uniqueId } = await params;
  
  // TODO: Obtener datos reales de la presentación desde BD
  const payload = getMockPresentationPayload();
  
  return {
    title: `Propuesta para ${payload.client.company_name} | Gard Security`,
    description: payload.quote.description || 'Propuesta comercial de servicios de seguridad',
    robots: 'noindex, nofollow', // Las presentaciones no deben indexarse
  };
}
