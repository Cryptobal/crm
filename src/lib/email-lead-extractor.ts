/**
 * Extracción estructurada de datos de lead desde el contenido de un email
 * (solicitudes de servicio de seguridad en Chile).
 */

import { openai } from "@/lib/openai";

export type ExtractedLeadData = {
  companyName: string | null;
  contactFirstName: string | null;
  contactLastName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  city: string | null;
  commune: string | null;
  serviceType: string | null;
  serviceDuration: string | null;
  coverageDetails: string | null;
  summary: string | null;
  industry: string | null;
};

const EXTRACTOR_SCHEMA = {
  type: "json_schema" as const,
  json_schema: {
    name: "extracted_lead_data",
    strict: true,
    schema: {
      type: "object",
      properties: {
        companyName: { type: "string", description: "Nombre de la empresa solicitante" },
        contactFirstName: { type: "string", description: "Nombre del contacto" },
        contactLastName: { type: "string", description: "Apellido del contacto" },
        contactEmail: { type: "string", description: "Email del contacto" },
        contactPhone: { type: "string", description: "Teléfono o celular del contacto" },
        address: { type: "string", description: "Dirección de la instalación o sede" },
        city: { type: "string", description: "Ciudad" },
        commune: { type: "string", description: "Comuna (Chile)" },
        serviceType: { type: "string", description: "Tipo de servicio (ej. guardias, seguridad 24x7)" },
        serviceDuration: { type: "string", description: "Duración estimada del servicio (ej. 5 meses, 11 meses)" },
        coverageDetails: { type: "string", description: "Detalles de cobertura (turnos, 24x7, fines de semana)" },
        summary: { type: "string", description: "Resumen ejecutivo de la solicitud" },
        industry: { type: "string", description: "Industria o rubro del cliente" },
      },
      required: [
        "companyName",
        "contactFirstName",
        "contactLastName",
        "contactEmail",
        "contactPhone",
        "address",
        "city",
        "commune",
        "serviceType",
        "serviceDuration",
        "coverageDetails",
        "summary",
        "industry",
      ],
      additionalProperties: false,
    },
  },
};

const SYSTEM_PROMPT = `Eres un asistente que extrae datos estructurados de correos electrónicos dirigidos a una empresa de seguridad privada en Chile (Gard Security).

El correo suele contener:
- Solicitud de servicio de seguridad (guardias, vigilancia, resguardo de obras/instalaciones)
- Nombre de la empresa que solicita y persona de contacto
- Dirección o ubicación del servicio (ciudad, comuna, dirección)
- Duración del proyecto o servicio (meses)
- Cobertura requerida (24x7, turnos, fines de semana, festivos)
- A veces adjuntos (planos, especificaciones)

Extrae TODO lo que encuentres. Si un dato no aparece en el texto, usa una cadena vacía "" para ese campo.
- companyName: nombre de la empresa (puede estar en el remitente, firma o cuerpo)
- contactFirstName/contactLastName: nombre del contacto (remitente o firma)
- contactEmail: si no está explícito, puedes inferirlo del remitente del correo
- contactPhone: teléfono o celular si se menciona
- address, city, commune: ubicación del servicio
- serviceType: ej. "Guardias de seguridad", "Vigilancia 24x7", "Resguardo de obra"
- serviceDuration: ej. "5 meses", "11 meses"
- coverageDetails: ej. "24 horas 7 días, turnos", "Fines de semana y festivos"
- summary: 1-3 oraciones resumiendo la solicitud
- industry: rubro (construcción, minería, retail, etc.) si se infiere`;

function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

/**
 * Extrae datos de lead desde el contenido de un email (asunto + cuerpo).
 * Acepta HTML o texto plano.
 */
export async function extractLeadFromEmail(params: {
  subject: string;
  htmlBody?: string | null;
  textBody?: string | null;
  fromEmail?: string | null;
}): Promise<ExtractedLeadData> {
  const textBody = params.textBody?.trim() || stripHtml(params.htmlBody || "");
  const content = [
    `Asunto: ${params.subject || "(sin asunto)"}`,
    params.fromEmail ? `De: ${params.fromEmail}` : "",
    textBody,
  ]
    .filter(Boolean)
    .join("\n\n");

  if (!content.trim()) {
    return {
      companyName: null,
      contactFirstName: null,
      contactLastName: null,
      contactEmail: params.fromEmail || null,
      contactPhone: null,
      address: null,
      city: null,
      commune: null,
      serviceType: null,
      serviceDuration: null,
      coverageDetails: null,
      summary: "Correo sin contenido extraíble.",
      industry: null,
    };
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content },
    ],
    response_format: EXTRACTOR_SCHEMA,
    max_tokens: 800,
    temperature: 0.2,
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    return {
      companyName: null,
      contactFirstName: null,
      contactLastName: null,
      contactEmail: params.fromEmail || null,
      contactPhone: null,
      address: null,
      city: null,
      commune: null,
      serviceType: null,
      serviceDuration: null,
      coverageDetails: null,
      summary: "No se pudo extraer información.",
      industry: null,
    };
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return {
      companyName: parsed.companyName ?? null,
      contactFirstName: parsed.contactFirstName ?? null,
      contactLastName: parsed.contactLastName ?? null,
      contactEmail: parsed.contactEmail ?? params.fromEmail ?? null,
      contactPhone: parsed.contactPhone ?? null,
      address: parsed.address ?? null,
      city: parsed.city ?? null,
      commune: parsed.commune ?? null,
      serviceType: parsed.serviceType ?? null,
      serviceDuration: parsed.serviceDuration ?? null,
      coverageDetails: parsed.coverageDetails ?? null,
      summary: parsed.summary ?? null,
      industry: parsed.industry ?? null,
    };
  } catch {
    return {
      companyName: null,
      contactFirstName: null,
      contactLastName: null,
      contactEmail: params.fromEmail || null,
      contactPhone: null,
      address: null,
      city: null,
      commune: null,
      serviceType: null,
      serviceDuration: null,
      coverageDetails: null,
      summary: raw.slice(0, 500),
      industry: null,
    };
  }
}
