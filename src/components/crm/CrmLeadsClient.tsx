/* eslint-disable @typescript-eslint/no-misused-promises */
"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CrmLead } from "@/types";
import { Plus, Loader2, CheckCircle2, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";

/* ─── Form types ─── */

type LeadFormState = {
  companyName: string;
  name: string;
  email: string;
  phone: string;
  source: string;
};

type ApproveFormState = {
  accountName: string;
  contactName: string;
  email: string;
  phone: string;
  dealTitle: string;
  rut: string;
  industry: string;
  segment: string;
  roleTitle: string;
};

const DEFAULT_FORM: LeadFormState = {
  companyName: "",
  name: "",
  email: "",
  phone: "",
  source: "",
};

/* ─── Status badge helper ─── */

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="border-amber-500/30 text-amber-400 gap-1">
          <Clock className="h-3 w-3" /> Pendiente
        </Badge>
      );
    case "approved":
      return (
        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 gap-1">
          <CheckCircle2 className="h-3 w-3" /> Aprobado
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="outline" className="border-red-500/30 text-red-400 gap-1">
          <XCircle className="h-3 w-3" /> Rechazado
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function CrmLeadsClient({ initialLeads }: { initialLeads: CrmLead[] }) {
  const [leads, setLeads] = useState<CrmLead[]>(initialLeads);
  const [form, setForm] = useState<LeadFormState>(DEFAULT_FORM);
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState(false);

  // Approve modal state
  const [approveOpen, setApproveOpen] = useState(false);
  const [approveLeadId, setApproveLeadId] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
  const [approveForm, setApproveForm] = useState<ApproveFormState>({
    accountName: "",
    contactName: "",
    email: "",
    phone: "",
    dealTitle: "",
    rut: "",
    industry: "",
    segment: "",
    roleTitle: "",
  });

  const inputClassName =
    "bg-background text-foreground placeholder:text-muted-foreground border-input focus-visible:ring-ring";

  const pendingLeads = useMemo(
    () => leads.filter((lead) => lead.status === "pending"),
    [leads]
  );

  const processedLeads = useMemo(
    () => leads.filter((lead) => lead.status !== "pending"),
    [leads]
  );

  const updateForm = (key: keyof LeadFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateApproveForm = (key: keyof ApproveFormState, value: string) => {
    setApproveForm((prev) => ({ ...prev, [key]: value }));
  };

  const createLead = async () => {
    setCreating(true);
    try {
      const response = await fetch("/api/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Error creando prospecto");
      }
      setLeads((prev) => [payload.data, ...prev]);
      setForm(DEFAULT_FORM);
      setOpen(false);
      toast.success("Lead creado exitosamente");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo crear el lead.");
    } finally {
      setCreating(false);
    }
  };

  const openApproveModal = (lead: CrmLead) => {
    setApproveLeadId(lead.id);
    setApproveForm({
      accountName: lead.companyName || "",
      contactName: lead.name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      dealTitle: `Oportunidad ${lead.companyName || lead.name || ""}`.trim(),
      rut: "",
      industry: "",
      segment: "",
      roleTitle: "",
    });
    setApproveOpen(true);
  };

  const approveLead = async () => {
    if (!approveLeadId) return;
    if (!approveForm.accountName.trim()) {
      toast.error("El nombre de la empresa es obligatorio.");
      return;
    }
    setApproving(true);
    try {
      const response = await fetch(`/api/crm/leads/${approveLeadId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(approveForm),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Error aprobando lead");
      }
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === approveLeadId ? { ...lead, status: "approved" } : lead
        )
      );
      setApproveOpen(false);
      setApproveLeadId(null);
      toast.success("Lead aprobado — Cuenta, contacto y negocio creados");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo aprobar el lead.");
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Solicitudes entrantes para aprobación manual.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="icon" variant="secondary" className="h-9 w-9">
              <Plus className="h-4 w-4" />
              <span className="sr-only">Nuevo lead</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Nuevo lead</DialogTitle>
              <DialogDescription>
                Ingresa los datos básicos del contacto.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Empresa</Label>
                <Input
                  value={form.companyName}
                  onChange={(event) => updateForm("companyName", event.target.value)}
                  placeholder="Nombre de la empresa"
                  className={inputClassName}
                />
              </div>
              <div className="space-y-2">
                <Label>Contacto</Label>
                <Input
                  value={form.name}
                  onChange={(event) => updateForm("name", event.target.value)}
                  placeholder="Nombre del contacto"
                  className={inputClassName}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={form.email}
                  onChange={(event) => updateForm("email", event.target.value)}
                  placeholder="correo@empresa.com"
                  className={inputClassName}
                />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  value={form.phone}
                  onChange={(event) => updateForm("phone", event.target.value)}
                  placeholder="+56 9 1234 5678"
                  className={inputClassName}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Fuente</Label>
                <Input
                  value={form.source}
                  onChange={(event) => updateForm("source", event.target.value)}
                  placeholder="Formulario web, referido, inbound, etc."
                  className={inputClassName}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={createLead} disabled={creating}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar lead
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Approve Modal ── */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Aprobar lead</DialogTitle>
            <DialogDescription>
              Revisa y edita los datos antes de crear la cuenta, contacto y negocio.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            {/* Account section */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Cuenta (Prospecto)
              </h4>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-xs">Nombre de empresa *</Label>
                  <Input
                    value={approveForm.accountName}
                    onChange={(e) => updateApproveForm("accountName", e.target.value)}
                    placeholder="Nombre de la empresa"
                    className={inputClassName}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">RUT</Label>
                  <Input
                    value={approveForm.rut}
                    onChange={(e) => updateApproveForm("rut", e.target.value)}
                    placeholder="76.123.456-7"
                    className={inputClassName}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Industria</Label>
                  <Input
                    value={approveForm.industry}
                    onChange={(e) => updateApproveForm("industry", e.target.value)}
                    placeholder="Retail, minería..."
                    className={inputClassName}
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-xs">Segmento</Label>
                  <Input
                    value={approveForm.segment}
                    onChange={(e) => updateApproveForm("segment", e.target.value)}
                    placeholder="Corporativo, PYME..."
                    className={inputClassName}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Contact section */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Contacto principal
              </h4>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nombre</Label>
                  <Input
                    value={approveForm.contactName}
                    onChange={(e) => updateApproveForm("contactName", e.target.value)}
                    placeholder="Nombre completo"
                    className={inputClassName}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Cargo</Label>
                  <Input
                    value={approveForm.roleTitle}
                    onChange={(e) => updateApproveForm("roleTitle", e.target.value)}
                    placeholder="Gerente, jefe..."
                    className={inputClassName}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Email</Label>
                  <Input
                    value={approveForm.email}
                    onChange={(e) => updateApproveForm("email", e.target.value)}
                    placeholder="correo@empresa.com"
                    className={inputClassName}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Teléfono</Label>
                  <Input
                    value={approveForm.phone}
                    onChange={(e) => updateApproveForm("phone", e.target.value)}
                    placeholder="+56 9 1234 5678"
                    className={inputClassName}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Deal section */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Negocio
              </h4>
              <div className="space-y-1.5">
                <Label className="text-xs">Título del negocio</Label>
                <Input
                  value={approveForm.dealTitle}
                  onChange={(e) => updateApproveForm("dealTitle", e.target.value)}
                  placeholder="Oportunidad para..."
                  className={inputClassName}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setApproveOpen(false)} disabled={approving}>
              Cancelar
            </Button>
            <Button onClick={approveLead} disabled={approving}>
              {approving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar aprobación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Pending leads ── */}
      <Card>
        <CardHeader>
          <CardTitle>Leads pendientes</CardTitle>
          <CardDescription>
            Revisa y aprueba para crear cuenta + contacto + negocio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingLeads.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No hay leads pendientes.
            </p>
          )}
          {pendingLeads.map((lead) => (
            <div
              key={lead.id}
              className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {lead.companyName || "Empresa sin nombre"}
                  </p>
                  <StatusBadge status={lead.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {lead.name || "Sin contacto"} · {lead.email || "Sin email"}{" "}
                  {lead.phone ? `· ${lead.phone}` : ""}
                </p>
                {lead.source && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Fuente: {lead.source}
                  </p>
                )}
              </div>
              <Button
                onClick={() => openApproveModal(lead)}
                size="sm"
                className="shrink-0"
              >
                Revisar y aprobar
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Processed leads ── */}
      <Card>
        <CardHeader>
          <CardTitle>Leads procesados</CardTitle>
          <CardDescription>Historial de leads ya revisados.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {processedLeads.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No hay leads procesados todavía.
            </p>
          )}
          {processedLeads.map((lead) => (
            <div
              key={lead.id}
              className="flex items-center justify-between rounded-lg border px-4 py-3"
            >
              <div>
                <p className="font-medium">
                  {lead.companyName || "Empresa sin nombre"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {lead.name || "Sin contacto"}
                </p>
              </div>
              <StatusBadge status={lead.status} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
