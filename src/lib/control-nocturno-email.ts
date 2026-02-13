/**
 * Envío de reporte de control nocturno por email.
 *
 * Al enviar o aprobar un reporte, se genera el PDF inline
 * y se manda como adjunto a operaciones@gard.cl.
 */

import { resend, EMAIL_CONFIG } from "@/lib/resend";

const OPS_EMAIL = "operaciones@gard.cl";

interface ControlNocturnoEmailData {
  reporteId: string;
  date: string; // YYYY-MM-DD
  centralOperatorName: string;
  centralLabel: string | null;
  status: "enviado" | "aprobado";
  totalInstalaciones: number;
  novedades: number;
  criticos: number;
  generalNotes: string | null;
  /** Base URL del sistema (ej: https://opai.gard.cl) */
  baseUrl: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function buildHtml(data: ControlNocturnoEmailData): string {
  const isApproval = data.status === "aprobado";
  const statusLabel = isApproval ? "APROBADO" : "ENVIADO PARA REVISIÓN";
  const statusColor = isApproval ? "#059669" : "#d97706";
  const reportUrl = `${data.baseUrl}/ops/control-nocturno/${data.reporteId}`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden">
        <!-- Header -->
        <tr>
          <td style="background:#0f172a;padding:24px 32px">
            <p style="margin:0;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px">Control Nocturno</p>
            <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#ffffff">${formatDate(data.date)}</p>
          </td>
        </tr>
        <!-- Status badge -->
        <tr>
          <td style="padding:20px 32px 0">
            <span style="display:inline-block;background:${statusColor}18;color:${statusColor};font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;border:1px solid ${statusColor}40">${statusLabel}</span>
          </td>
        </tr>
        <!-- Info -->
        <tr>
          <td style="padding:16px 32px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:4px 0;font-size:13px;color:#64748b;width:140px">Operador</td>
                <td style="padding:4px 0;font-size:13px;color:#1e293b;font-weight:500">${data.centralOperatorName}${data.centralLabel ? ` · ${data.centralLabel}` : ""}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;font-size:13px;color:#64748b">Instalaciones</td>
                <td style="padding:4px 0;font-size:13px;color:#1e293b;font-weight:500">${data.totalInstalaciones}</td>
              </tr>
              ${data.novedades > 0 ? `<tr>
                <td style="padding:4px 0;font-size:13px;color:#64748b">Novedades</td>
                <td style="padding:4px 0;font-size:13px;color:#d97706;font-weight:600">${data.novedades}</td>
              </tr>` : ""}
              ${data.criticos > 0 ? `<tr>
                <td style="padding:4px 0;font-size:13px;color:#64748b">Críticos</td>
                <td style="padding:4px 0;font-size:13px;color:#dc2626;font-weight:600">${data.criticos}</td>
              </tr>` : ""}
            </table>
          </td>
        </tr>
        ${data.generalNotes ? `
        <!-- Notes -->
        <tr>
          <td style="padding:0 32px 16px">
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px 16px">
              <p style="margin:0 0 4px;font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase">Notas generales</p>
              <p style="margin:0;font-size:13px;color:#334155;white-space:pre-wrap">${data.generalNotes}</p>
            </div>
          </td>
        </tr>` : ""}
        <!-- CTA -->
        <tr>
          <td style="padding:8px 32px 24px" align="center">
            <a href="${reportUrl}" style="display:inline-block;background:#4f46e5;color:#ffffff;font-size:13px;font-weight:600;padding:10px 24px;border-radius:6px;text-decoration:none">Ver reporte completo</a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #e2e8f0">
            <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center">
              ${EMAIL_CONFIG.companyName} · Sistema OPAI · Reporte generado automáticamente
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Envía el reporte de control nocturno por email con PDF adjunto.
 * Se llama al enviar (submit) y al aprobar (approve).
 */
export async function sendControlNocturnoEmail(
  data: ControlNocturnoEmailData,
  pdfBuffer?: Buffer | Uint8Array,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const dateSlug = data.date;
    const subjectPrefix = data.status === "aprobado" ? "✅ Aprobado" : "📋 Nuevo reporte";
    const subject = `${subjectPrefix}: Control Nocturno ${formatDate(data.date)}`;

    const attachments = pdfBuffer
      ? [
          {
            filename: `ControlNocturno_${dateSlug}.pdf`,
            content: Buffer.from(pdfBuffer),
          },
        ]
      : undefined;

    const response = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: OPS_EMAIL,
      replyTo: EMAIL_CONFIG.replyTo,
      subject,
      html: buildHtml(data),
      attachments,
      tags: [{ name: "type", value: "control_nocturno" }],
    });

    if (response.error) {
      console.error("[CONTROL_NOCTURNO_EMAIL] Resend error:", response.error);
      return { ok: false, error: JSON.stringify(response.error) };
    }
    return { ok: true };
  } catch (error) {
    console.error("[CONTROL_NOCTURNO_EMAIL] Error:", error);
    return { ok: false, error: error instanceof Error ? error.message : "Error desconocido" };
  }
}
