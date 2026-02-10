"use client";

import { useEffect, useState } from "react";
import { FileText, Download, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContractEditor } from "./ContractEditor";

type Signer = {
  name: string;
  email: string;
  rut: string | null;
  signingOrder: number;
  signedAt: Date | string | null;
  signatureMethod: string | null;
  signatureTypedName: string | null;
  signatureImageUrl: string | null;
};

type Data = {
  document: {
    id: string;
    title: string;
    content: unknown;
    signedAt: Date | string | null;
    signatureStatus: string | null;
    signatureData: unknown;
  };
  signers: Signer[];
  completedAt: Date | string | null;
};

export function SignedViewClient({
  documentId,
  viewToken,
}: {
  documentId: string;
  viewToken: string;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/docs/signed-view/${documentId}/${viewToken}`);
        const json = await res.json();
        if (!res.ok || !json.success || !json.data) {
          setError(json.error || "No se pudo cargar el documento");
          return;
        }
        setData(json.data);
      } catch {
        setError("No se pudo cargar el documento");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [documentId, viewToken]);

  const pdfUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/docs/documents/${documentId}/signed-pdf?viewToken=${viewToken}`
    : "#";

  if (loading) {
    return (
      <div className="template-ui-scope min-h-screen flex items-center justify-center bg-background p-6">
        <p className="text-muted-foreground">Cargando documento...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="template-ui-scope min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h1 className="text-lg font-semibold mb-2">Enlace inválido o expirado</h1>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const completedAtFormatted = data.completedAt
    ? new Date(data.completedAt).toLocaleString("es-CL", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <div className="template-ui-scope min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-semibold">{data.document.title}</h1>
              <p className="text-sm text-muted-foreground">
                Documento firmado electrónicamente · {completedAtFormatted}
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="gap-2 shrink-0">
            <a href={pdfUrl} download target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
              Descargar PDF
            </a>
          </Button>
        </div>

        <div className="rounded-lg border border-border bg-card overflow-hidden mb-8">
          <ContractEditor content={data.document.content} editable={false} />
        </div>

        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold mb-4">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Registro de firma electrónica
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Este documento fue firmado electrónicamente conforme a la Ley 19.799 (Chile).
            Las firmas se registraron con fecha, método e identificación del firmante.
          </p>
          <ul className="space-y-3">
            {data.signers.map((s, i) => (
              <li
                key={i}
                className="flex flex-wrap items-baseline gap-2 text-sm py-2 border-b border-border last:border-0"
              >
                <span className="font-medium">{s.name}</span>
                <span className="text-muted-foreground">{s.email}</span>
                {s.rut ? (
                  <span className="text-muted-foreground">RUT {s.rut}</span>
                ) : null}
                <span className="text-muted-foreground">
                  · Firmado:{" "}
                  {s.signedAt
                    ? new Date(s.signedAt).toLocaleString("es-CL", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </span>
                {s.signatureMethod ? (
                  <span className="text-muted-foreground">
                    · Método: {s.signatureMethod === "typed" ? "Nombre escrito" : s.signatureMethod === "drawn" ? "Dibujado" : "Imagen"}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
