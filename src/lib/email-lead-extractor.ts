/**
 * Extracción estructurada de datos de lead desde el contenido de un email
 * (solicitudes de servicio de seguridad en Chile).
 */

import { openai } from "@/lib/openai";

export type ExtractedLeadData = {
  companyName: string | null;
  rut: string | null;
  legalName: string | null;
  businessActivity: string | null;
  legalRepresentativeName: string | null;
  contactFirstName: string | null;
  contactLastName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactRole: string | null;
  address: string | null;
  city: string | null;
  commune: string | null;
  serviceType: string | null;
  serviceDuration: string | null;
  coverageDetails: string | null;
  guardsPerShift: string | null;
  numberOfLocations: string | null;
  startDate: string | null;
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
        companyName: { type: "string", description: "Nombre comercial de la empresa solicitante" },
        rut: { type: "string", description: "RUT de la empresa (formato XX.XXX.XXX-X o sin puntos)" },
        legalName: { type: "string", description: "Razón social / nombre legal de la empresa" },
        businessActivity: { type: "string", description: "Giro o actividad comercial de la empresa" },
        legalRepresentativeName: { type: "string", description: "Nombre del representante legal" },
        contactFirstName: { type: "string", description: "Nombre de pila del contacto que solicita" },
        contactLastName: { type: "string", description: "Apellido del contacto que solicita" },
        contactEmail: { type: "string", description: "Email del contacto" },
        contactPhone: { type: "string", description: "Teléfono o celular del contacto" },
        contactRole: { type: "string", description: "Cargo o rol del contacto (ej. Encargado de Adquisiciones, Jefe de Prevención)" },
        address: { type: "string", description: "Dirección de la instalación o sede donde se requiere el servicio" },
        city: { type: "string", description: "Ciudad" },
        commune: { type: "string", description: "Comuna (Chile)" },
        serviceType: { type: "string", description: "Tipo de servicio (ej. guardias, seguridad 24x7, resguardo de obra)" },
        serviceDuration: { type: "string", description: "Duración estimada del servicio (ej. 6 meses, indefinido)" },
        coverageDetails: { type: "string", description: "Detalles de cobertura (turnos, 24x7, fines de semana, festivos)" },
        guardsPerShift: { type: "string", description: "Cantidad de guardias por turno o total solicitados" },
        numberOfLocations: { type: "string", description: "Cantidad de puntos/instalaciones a cubrir" },
        startDate: { type: "string", description: "Fecha estimada de inicio del servicio (ej. 02 de marzo, inmediato)" },
        summary: { type: "string", description: "Resumen ejecutivo de la solicitud en 2-4 oraciones" },
        industry: { type: "string", description: "Industria o rubro del cliente (construcción, minería, retail, inmobiliaria, etc.)" },
      },
      required: [
        "companyName",
        "rut",
        "legalName",
        "businessActivity",
        "legalRepresentativeName",
        "contactFirstName",
        "contactLastName",
        "contactEmail",
        "contactPhone",
        "contactRole",
        "address",
        "city",
        "commune",
        "serviceType",
        "serviceDuration",
        "coverageDetails",
        "guardsPerShift",
        "numberOfLocations",
        "startDate",
        "summary",
        "industry",
      ],
      additionalProperties: false,
    },
  },
};

const SYSTEM_PROMPT = `Eres un asistente que extrae datos estructurados de correos electrónicos dirigidos a una empresa de seguridad privada en Chile (Gard Security).

El correo suele contener solicitudes de servicio de seguridad (guardias, vigilancia, resguardo de obras/instalaciones). Puede incluir datos de la empresa solicitante, del contacto, datos legales/facturación, y requerimientos del servicio.

Extrae TODO lo que encuentres. Si un dato no aparece en el texto, usa una cadena vacía "" para ese campo.

Campos a extraer:
- companyName: nombre comercial de la empresa (puede estar en el remitente, firma, cuerpo o dominio del email)
- rut: RUT de la empresa (formato chileno, ej. 77.985.438-8). Puede aparecer como "RUT:", "R.U.T." o similar
- legalName: razón social (puede aparecer como "Razón Social:" o similar). A veces es distinta del nombre comercial
- businessActivity: giro o actividad comercial (puede aparecer como "Giro:" o similar)
- legalRepresentativeName: nombre del representante legal si se menciona
- contactFirstName/contactLastName: nombre de la persona que escribe o solicita (remitente, firma o cuerpo)
- contactEmail: email del contacto. Si no está explícito, puedes inferirlo del remitente "De:"
- contactPhone: teléfono o celular (busca en firma, cuerpo o "Fono:", "Móvil:", "Cel:")
- contactRole: cargo del contacto (ej. "Encargado de Adquisiciones", "Jefe de Prevención", "Administrador")
- address: dirección de la instalación o sede donde se requiere el servicio
- city: ciudad
- commune: comuna (contexto Chile)
- serviceType: tipo de servicio (ej. "Guardias de seguridad 24/7", "Resguardo de obra", "Control de acceso")
- serviceDuration: duración estimada (ej. "6 meses", "indefinido")
- coverageDetails: detalles de cobertura (turnos, horarios, 24x7, fines de semana, festivos)
- guardsPerShift: cantidad de guardias por turno o total solicitados
- numberOfLocations: cantidad de puntos/instalaciones/sedes a cubrir
- startDate: fecha estimada de inicio (ej. "02 de marzo", "inmediato", "a definir")
- summary: resumen ejecutivo en 2-4 oraciones con lo más relevante de la solicitud
- industry: rubro del cliente (construcción, minería, retail, inmobiliaria, energía, etc.) inferido del contexto`;

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
    return emptyResult(params.fromEmail || null, "Correo sin contenido extraíble.");
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
    return emptyResult(params.fromEmail || null, "No se pudo extraer información.");
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    const str = (key: string) => parsed[key]?.trim() || null;
    return {
      companyName: str("companyName"),
      rut: str("rut"),
      legalName: str("legalName"),
      businessActivity: str("businessActivity"),
      legalRepresentativeName: str("legalRepresentativeName"),
      contactFirstName: str("contactFirstName"),
      contactLastName: str("contactLastName"),
      contactEmail: str("contactEmail") ?? params.fromEmail ?? null,
      contactPhone: str("contactPhone"),
      contactRole: str("contactRole"),
      address: str("address"),
      city: str("city"),
      commune: str("commune"),
      serviceType: str("serviceType"),
      serviceDuration: str("serviceDuration"),
      coverageDetails: str("coverageDetails"),
      guardsPerShift: str("guardsPerShift"),
      numberOfLocations: str("numberOfLocations"),
      startDate: str("startDate"),
      summary: str("summary"),
      industry: str("industry"),
    };
  } catch {
    return emptyResult(params.fromEmail || null, raw.slice(0, 500));
  }
}

function emptyResult(email: string | null, summary: string): ExtractedLeadData {
  return {
    companyName: null,
    rut: null,
    legalName: null,
    businessActivity: null,
    legalRepresentativeName: null,
    contactFirstName: null,
    contactLastName: null,
    contactEmail: email,
    contactPhone: null,
    contactRole: null,
    address: null,
    city: null,
    commune: null,
    serviceType: null,
    serviceDuration: null,
    coverageDetails: null,
    guardsPerShift: null,
    numberOfLocations: null,
    startDate: null,
    summary,
    industry: null,
  };
}
