# MASTER SPEC — Plataforma OPI/OPAI (Todas las Fases)

> **Este es el documento maestro definitivo.** Define qué hará la plataforma al completar TODAS sus fases.  
> **Fuente:** `Desarrollo Opai/fase-2.md` (MASTER_SPEC vFinal) + auditoría del repositorio actual.  
> **Fecha:** 2026-02-11  
> **Estado:** Vigente — fuente única de verdad para roadmap completo

---

## 0) Propósito

Construir la plataforma OPI para Gard con enfoque mobile-first y separación de dominios, permitiendo:

1. **CRM comercial** — Pipeline de ventas, cuentas, contactos, deals, cotizaciones, email tracking, follow-ups
2. **CPQ** — Configure, Price, Quote: cotizador con cálculo de costo empleador
3. **Presentaciones comerciales** — Propuestas dinámicas con tracking de vistas y emails
4. **Documentos legales** — Contratos, templates con tokens, versionado. Firma digital: solo campos en DB (`signatureStatus`, `signedAt`, `signedBy`); flujo de firma no implementado.
5. **Payroll** — Simulador de liquidaciones Chile, parámetros legales
6. **Estructura operacional** — Puestos operativos por instalación
7. **Planificación y cobertura** — Pauta mensual y asistencia diaria
8. **PPC y Turnos Extra** — Gestión de puestos por cubrir y pagos de TE
9. **Personas** — Postulantes, guardias, OS10, documentos, cuenta bancaria, lista negra
10. **Postventa** — Visitas georreferenciadas check-in/out, bitácora, incidentes, KPI
11. **Tickets** — Seguimiento transversal con SLA y categorías
12. **Portal guardias** — Comunicados, solicitudes RRHH, tickets (sin pauta)
13. **Inventario** — Stock, kits de uniforme, asignación por guardia/instalación
14. **Asistencia externa** — Integración API/FaceID con auto-corrección

---

## 1) Estado actual vs Fases planificadas

### Mapa completo de implementación

```
 IMPLEMENTADO                          POR IMPLEMENTAR
 ============                          ===============

 [Hub]           ██████████ 100%
 [Presentaciones]██████████ 100%
 [CRM]           ██████████ 100%       [Reportes CRM]     ░░░░░░░░░░ 0%
 [CPQ]           ██████████ 100%
 [Documentos]    ████████░░  90%      [Firma digital flujo] ░░░░░░░░░░
 [Payroll]       ██████░░░░  60%       [Completitud legal] ░░░░░░░░░░
 [FX]            ██████████ 100%
 [Auth/RBAC]     ██████████ 100%
 [Config]        ██████████ 100%

 --- FASES FUTURAS (OPI) ---

 Fase 1: Ops + TE + Personas           ░░░░░░░░░░ 0%
 Fase 2: Postventa + Tickets           ░░░░░░░░░░ 0%  ← Plan listo (docs/06-etapa-2/)
 Fase 3: Portal guardias + Comunicados ░░░░░░░░░░ 0%
 Fase 4: Inventario                    ░░░░░░░░░░ 0%
 Fase 5: Asistencia externa            ░░░░░░░░░░ 0%
```

### Lo que YA existe en producción

| Módulo | Estado | Páginas | APIs | Modelos DB |
|--------|:------:|:-------:|:----:|:----------:|
| Hub | ✅ 100% | 1 | 0 | — |
| CRM | ✅ 100% | 12 | 33 | 25 |
| CPQ | ✅ 100% | 3 | 22 | 11 |
| Presentaciones | ✅ 100% | 6 | 7 | 3 |
| Documentos | ✅ 100% | 6 | 8 | 6 |
| Payroll | ⚠️ 60% | 3 | 3 | 4 |
| FX (UF/UTM) | ✅ 100% | 0 | 3 | 2 |
| Config | ✅ 100% | 9 | 4 | 2 |
| Auth | ✅ 100% | 4 | 1 | 3 |
| **Total existente** | | **44** | **81** | **56** |

### Lo que FALTA (Fases OPI)

| Fase | Módulo | Estado | Dependencias |
|:----:|--------|:------:|-------------|
| 1 | Ops (puestos, pauta, asistencia) | ❌ | Ninguna |
| 1 | TE y Pagos | ❌ | Ops |
| 1 | Personas (guardias, docs, flags) | ❌ | Ninguna |
| 2 | Postventa (check-in, bitácora) | ❌ | CrmInstallation (existe) |
| 2 | Tickets (bandeja, SLA) | ❌ | Ninguna |
| 3 | Portal guardias | ❌ | Personas |
| 3 | Comunicados | ❌ | Personas |
| 3 | Solicitudes RRHH | ❌ | Personas |
| 4 | Inventario | ❌ | Ninguna |
| 5 | Asistencia externa (FaceID/API) | ❌ | Ops + Personas |

---

## 2) Principios de arquitectura (invariantes)

### 2.1 Ejes canónicos
- **Instalación:** eje operativo y postventa
- **Puesto Operativo (PO):** eje de planificación/cobertura
- **Asistencia Diaria:** eje de realidad operacional (fuente canónica para TE y Payroll)
- **Guardia:** eje de personas/eligibilidad/portal

### 2.2 Separación de dominios
- **Comercial (IMPLEMENTADO):** CRM, CPQ, Presentaciones, Documentos
- **Personas:** identidad/estado laboral/documentos/OS10/cuentas/lista negra/comentarios
- **Ops:** estructura de servicio (PO), pauta mensual, asistencia diaria, PPC y generación de TE
- **TE & Pagos:** aprobación RRHH, lotes de pago, marcado pagado, historial
- **Postventa:** check-in/out georreferenciado + bitácora + incidentes + KPI
- **Tickets:** seguimiento transversal (interno y desde guardias)
- **Inventario:** compras, stock, kits, asignaciones, mínimos
- **Portal Guardias (sub-app):** comunicados + solicitudes RRHH + tickets (sin pauta)

### 2.3 Mobile-first
- Supervisores: check-in/out, bitácora, tickets, solicitudes en terreno con 3-4 acciones máximo
- Guardias: portal minimalista: comunicados, solicitudes, tickets

---

## 3) Glosario canónico

### Puesto Operativo (PO)
Entidad permanente que representa una obligación de cobertura de una instalación:
- horario (inicio/fin), días semana, patrón (4x4, 5x2, etc.)
- se crea desde estructura de servicio al cerrar contrato
- si hay dotación simultánea (ej: 2 puestos iguales), se crean 2 PO distintos

### Guardia
Persona contratada. No puede cubrir dos PO el mismo día. Descanso: inicialmente se bloquea doble asignación diaria.

### PPC (Puesto Por Cubrir)
Estado de un PO cuando no está cubierto efectivamente en una fecha. Se deriva, no es tabla propia.

### Turno Extra (TE)
Cobertura por guardia "no base" en una fecha. Monto TE: fijo por instalación (se snapshot en TE).

### Lista Negra
Bloquea contratación, TE y portal. Sin apelación. Solo Admin/SuperAdmin revierte. Siempre auditado.

---

## 4) Módulos y páginas (visión completa)

### Implementados (producción)

| Ruta | Módulo | Estado |
|------|--------|:------:|
| `/hub` | Centro de control ejecutivo | ✅ |
| `/crm/*` | CRM (leads, accounts, contacts, deals, installations, cotizaciones) | ✅ |
| `/cpq/*` | Configure, Price, Quote | ✅ |
| `/opai/documentos/*` | Documentos y templates legales | ✅ |
| `/opai/inicio` | Dashboard de presentaciones | ✅ |
| `/payroll/*` | Simulador de liquidaciones | ⚠️ |
| `/opai/configuracion/*` | Configuración (usuarios, integraciones, firmas, etc.) | ✅ |
| `/opai/perfil` | Perfil de usuario | ✅ |
| `/p/[uniqueId]` | Vista pública de presentación | ✅ |

### Por implementar (Fases OPI)

| Ruta | Módulo | Fase |
|------|--------|:----:|
| `/personas/postulantes` | Pipeline de postulantes | 1 |
| `/personas/guardias` | Gestión de guardias (360) | 1 |
| `/personas/lista-negra` | Lista negra | 1 |
| `/ops/instalaciones/[id]` | Estructura, supervisor, geofence | 1 |
| `/ops/puestos` | Puestos operativos | 1 |
| `/ops/pauta-mensual` | Planificación mensual | 1 |
| `/ops/pauta-diaria` | Pauta diaria | 1 |
| `/ops/ppc` | Puestos por cubrir | 1 |
| `/te/registro` | Registro de turnos extra | 1 |
| `/te/aprobaciones` | Aprobación RRHH de TE | 1 |
| `/te/lotes` | Lotes de pago semanales | 1 |
| `/te/pagos` | Pagos y exportación Santander | 1 |
| `/postventa/checkin` | Check-in/out georreferenciado | 2 |
| `/postventa/instalaciones/[id]/bitacora` | Bitácora de instalación | 2 |
| `/postventa/incidentes` | Incidentes con severidad | 2 |
| `/postventa/kpis` | KPIs de postventa | 2 |
| `/tickets` | Bandeja de tickets | 2 |
| `/tickets/[id]` | Detalle de ticket | 2 |
| `/portal/login` | Login portal guardias (OTP) | 3 |
| `/portal/comunicados` | Comunicados | 3 |
| `/portal/solicitudes` | Solicitudes RRHH | 3 |
| `/portal/tickets` | Tickets desde portal | 3 |
| `/inventario/catalogo` | Catálogo de items | 4 |
| `/inventario/stock` | Stock y warehouse | 4 |
| `/inventario/kits` | Kits de uniforme | 4 |
| `/inventario/asignaciones` | Asignaciones a guardias | 4 |

---

## 5) Modelo de datos

### Schemas existentes (56 modelos en producción)

| Schema | Modelos | Propósito |
|--------|:-------:|-----------|
| `public` | 10 | Tenant, Admin, AuditLog, Presentations, Templates, Settings |
| `crm` | 25 | Leads, Accounts, Contacts, Deals, Installations, Pipeline, Email, Files, Custom Fields |
| `cpq` | 11 | Quotes, Positions, Catalog, Puestos, Cargos, Roles, Parameters |
| `docs` | 6 | DocTemplate, Document, DocCategory, Associations, History |
| `payroll` | 4 | Parameters, Assumptions, Simulations, Salary Components |
| `fx` | 2 | UF Rates, UTM Rates |

### Schemas por crear (Fases OPI)

| Schema | Modelos planificados | Fase |
|--------|---------------------|:----:|
| `ops` | visit_checkin, site_log_entry, ticket, ticket_comment, ticket_attachment, ticket_category | 2 |
| `ops` | puesto_operativo, pauta_mensual, asistencia_diaria, evento_rrhh, turno_extra, pago_te_lote, pago_te_item | 1 |
| `ops` | persona, guardia, guardia_flag, documento_persona, cuenta_bancaria, comentario_guardia | 1 |
| `ops` | announcement, announcement_delivery | 3 |
| `ops` | inventory_item, inventory_variant, warehouse, purchase, stock_ledger, kit_template, assignment | 4 |
| `ops` | attendance_event | 5 |

---

## 6) Reglas de negocio (hard rules)

### 6.1 Asignación pauta mensual
Un guardia no puede estar asignado a 2 PO en la misma fecha. Validación al guardar batch.

### 6.2 Derivación asistencia diaria
- Base: pauta mensual
- Overrides: eventos RRHH
- Señales externas: attendance_event (FaceID/API)
- Manual Ops (cuando no existe señal externa confiable)

### 6.3 Generación TE
Se crea/actualiza TE cuando asistencia_diaria.guardia_reemplazo_id está definido, o estado refleja PPC y se asigna una cobertura. TE guarda monto_snapshot desde instalación.

### 6.4 Portal guardias
Acceso si: guardia.estado = activo, tiene relación contractual activa, no lista negra.

### 6.5 Lista negra
Bloquea: asignación en pauta, selección como reemplazo, autenticación portal.

---

## 7) Seguridad y roles

### Roles actuales (implementados)

| Rol | Acceso |
|-----|--------|
| `owner` | Todo |
| `admin` | Todo excepto settings avanzados |
| `editor` | Hub, Docs, CRM, CPQ, Payroll |
| `viewer` | Hub, Docs (solo lectura) |

### Roles futuros (por implementar)

| Rol | Acceso planificado | Fase |
|-----|-------------------|:----:|
| `supervisor` | Postventa, tickets, solicitudes (no aprueba) | 2 |
| `rrhh` | Aprueba TE, gestiona solicitudes guardias, lista negra | 1 |
| `operaciones` | Estructura, pauta, asistencia manual, cobertura | 1 |
| `reclutamiento` | Pipeline postulantes | 1 |
| `guardia_portal` | Solo su data vía portal | 3 |

---

## 8) Fases de ejecución

### Pre-fases: OPAI Suite (COMPLETADO)

Lo que ya existe y funciona en producción:

- ✅ Hub ejecutivo (KPIs, quick actions, apps launcher)
- ✅ CRM completo (leads, accounts, contacts, deals, installations, pipeline, email, follow-ups, WhatsApp)
- ✅ CPQ completo (cotizaciones, posiciones, catálogo, cálculo employer cost)
- ✅ Presentaciones comerciales (templates, tracking, email, vistas públicas)
- ✅ Documentos legales (templates Tiptap, tokens, versionado, categorías, asociaciones CRM)
- ✅ Payroll parcial (simulador de liquidaciones, parámetros legales Chile)
- ✅ FX (UF/UTM automático)
- ✅ Auth + RBAC (4 roles, invitaciones, activación)
- ✅ Configuración (usuarios, integraciones Gmail, firmas, categorías)

### Fase 1 — Ops + TE + Personas mínimo (MVP)

**Entregables:**
- DB core + Ops + TE
- UI pauta mensual + diaria
- TE generado desde asistencia
- Aprobación RRHH + lote semanal + marcar pagado
- Personas: guardia, cuenta, docs, flags, lista negra básica

**Criterios de aceptación:**
- Generar pauta mensual por instalación y guardar
- Ver pauta diaria y marcar asistió/no asistió
- Asignar reemplazo → genera TE pendiente con monto instalación
- Aprobar TE → incluir en lote semanal → marcar pagado

**Plan detallado:** `docs/05-etapa-1/ETAPA_1_IMPLEMENTACION.md`

**Estado:** 🟡 En planificación (implementación no iniciada)

### Fase 2 — Postventa + Tickets core

**Entregables:**
- Check-in/out geofence + override
- Bitácora instalación + incidentes
- Tickets + bandeja + categorías + SLA básico
- Incidente puede crear ticket

**Plan detallado:** `docs/06-etapa-2/ETAPA_2_IMPLEMENTACION.md`

**Estado:** ❌ No iniciado (plan de implementación completo)

### Fase 3 — Portal guardias + comunicados + solicitudes

**Entregables:**
- OTP/Magic link para guardias
- Comunicados
- Solicitudes RRHH (permiso/vacaciones/licencia) + estado
- Tickets guardias

**Estado:** ❌ No iniciado

### Fase 4 — Inventario

**Entregables:**
- Catálogo + variantes + compras + stock_ledger
- kit_template + asignación a guardia
- KPI básico stock mínimo

**Estado:** ❌ No iniciado

### Fase 5 — Asistencia externa

**Entregables:**
- attendance_event
- Reconciler auto-corrección
- Auditoría completa

**Estado:** ❌ No iniciado

---

## 9) APIs planificadas (Fases OPI)

### Fase 1: Ops
- `GET/POST /api/ops/instalaciones`
- `PATCH /api/ops/instalaciones/:id` (incluye geofence, te_monto_clp)
- `POST /api/ops/puestos/bulk-create`
- `GET /api/ops/pauta-mensual?instalacion_id&mes&anio`
- `POST /api/ops/pauta-mensual/generar`
- `POST /api/ops/pauta-mensual/guardar`
- `GET /api/ops/asistencia?fecha&instalacion_id`
- `PATCH /api/ops/asistencia/:id`

### Fase 1: TE & Pagos
- `GET /api/te?desde&hasta&estado`
- `PATCH /api/te/:id/aprobar`
- `PATCH /api/te/:id/rechazar`
- `POST /api/te/lotes`
- `GET /api/te/lotes/:id/export-santander`
- `PATCH /api/te/lotes/:id/marcar-pagado`

### Fase 2: Postventa + Tickets
- Ver `docs/06-etapa-2/ETAPA_2_IMPLEMENTACION.md` sección D.3

### Fase 3: Portal guardias
- `POST /api/portal/auth/request-otp`
- `POST /api/portal/auth/verify-otp`
- `GET /api/portal/me`
- `GET /api/portal/announcements`
- `GET/POST /api/portal/solicitudes`
- `GET/POST /api/portal/tickets`

### Fase 5: Asistencia externa
- `POST /api/attendance-events` (API key)

---

## 10) Jobs/Automatismos planificados

| Job | Fase | Frecuencia | Propósito |
|-----|:----:|-----------|-----------|
| `ops_daily_materializer` | 1 | Diario | Upsert asistencia_diaria desde pauta |
| `attendance_reconciler` | 5 | Event-driven | Auto-corrección desde FaceID/API |
| `sla_monitor` | 2 | Cada 15 min | Marcar tickets con SLA vencido |
| `followup_emails` | ✅ Existe | Diario | Follow-up emails CRM |
| `document_alerts` | ✅ Existe | Diario | Alertas de vencimiento de documentos |

---

## 11) Estructura del repositorio

```
opai/
├── prisma/
│   └── schema.prisma          ← 56 modelos, 6 schemas
├── src/
│   ├── app/
│   │   ├── (app)/             ← Rutas protegidas (44 páginas)
│   │   │   ├── hub/
│   │   │   ├── crm/
│   │   │   ├── cpq/
│   │   │   ├── payroll/
│   │   │   ├── opai/          ← documentos, configuración, perfil
│   │   │   ├── postventa/     ← FASE 2 (por crear)
│   │   │   └── tickets/       ← FASE 2 (por crear)
│   │   ├── (templates)/       ← Rutas públicas (presentaciones)
│   │   └── api/               ← 81 endpoints
│   ├── components/            ← ~160 componentes
│   ├── lib/                   ← Utilidades, auth, RBAC, validaciones
│   ├── modules/               ← Engines (payroll, cpq)
│   └── types/
├── docs/                      ← Documentación organizada
└── public/
```

---

## 12) Convenciones

- **Naming DB:** `{Domain}{Entity}` en Prisma. Ej: `CrmDeal`, `OpsTicket`
- **Schema DB:** Un schema por dominio: `public`, `crm`, `cpq`, `docs`, `payroll`, `fx`, `ops`
- **IDs:** UUID (uuid_generate_v4()) para schemas CRM/CPQ/Docs/Ops, CUID para schema public
- **APIs:** `/api/{module}/{resource}` (ej: `/api/crm/deals`, `/api/ops/tickets`)
- **Páginas:** `/src/app/(app)/{module}/` con layout compartido
- **Componentes:** `/src/components/{module}/` por dominio
- **Validaciones:** Zod schemas en `/src/lib/validations/{module}.ts`
- **Mobile-first:** Todas las páginas nuevas deben ser responsive

---

*Este documento reemplaza y consolida `Desarrollo Opai/fase-2.md` como fuente única de verdad para la visión completa de la plataforma.*
