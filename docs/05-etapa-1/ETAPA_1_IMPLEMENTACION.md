# ETAPA 1 — Plan Maestro de Implementación

## Ops + TE + Personas (MVP)

> **Versión:** 1.0  
> **Fecha:** 2026-02-11  
> **Fuente de verdad:** `docs/00-product/MASTER_SPEC_OPI.md`  
> **Estado:** En planificación (implementación no iniciada)

---

## A) Resumen ejecutivo

La Fase 1 habilita la operación diaria mínima de guardias:

1. **Ops**: estructura de puestos, pauta mensual y asistencia diaria.
2. **TE y pagos**: generación de turnos extra, aprobación RRHH y lote de pago.
3. **Personas**: ficha de guardia, flags y lista negra básica.

El repositorio actual tiene la base comercial completa (Hub, CRM, CPQ, Documentos, Configuración), pero **aún no tiene implementación de Fase 1** en DB/API/UI.

---

## B) Baseline actual (revisión 2026-02-11)

| Componente Fase 1 | Estado actual |
|-------------------|---------------|
| Modelos Prisma (`ops/personas/te`) | ❌ No existen en `prisma/schema.prisma` |
| APIs `/api/ops/*` y `/api/te/*` | ❌ No existen rutas |
| UI `/ops/*`, `/personas/*`, `/te/*` | ❌ No existen páginas |
| Integración con instalaciones | ✅ Existe `crm.CrmInstallation` reutilizable |
| Roles base (owner/admin/editor/viewer) | ✅ Implementados (faltan roles operacionales) |

---

## C) Alcance MVP de Fase 1

### Incluye

- Esquema de datos `ops` con tablas core de Ops + TE + Personas.
- Generación/guardado de pauta mensual por instalación.
- Vista y edición de asistencia diaria.
- Creación automática de TE cuando hay reemplazo.
- Flujo básico de aprobación y pago de TE.
- Ficha de guardia y lista negra mínima.

### No incluye

- Postventa y tickets (Fase 2).
- Portal guardias y solicitudes RRHH (Fase 3).
- Inventario (Fase 4).
- Integraciones externas de asistencia (Fase 5).

---

## D) Plan de implementación por iteraciones

### D.1) F1-01 — Fundación de datos y contratos API (prioridad inmediata)

**Objetivo:** dejar habilitado el dominio Ops/TE/Personas a nivel de base de datos y contratos backend.

**Entregables:**

- Agregar schema `ops` en Prisma datasource.
- Crear modelos base:
  - `puesto_operativo`
  - `pauta_mensual`
  - `asistencia_diaria`
  - `evento_rrhh`
  - `turno_extra`
  - `pago_te_lote`
  - `pago_te_item`
  - `persona`
  - `guardia`
  - `guardia_flag`
  - `documento_persona`
  - `cuenta_bancaria`
  - `comentario_guardia`
- Definir contratos mínimos de API:
  - `GET/POST /api/ops/pauta-mensual`
  - `POST /api/ops/pauta-mensual/generar`
  - `GET/PATCH /api/ops/asistencia`
  - `GET /api/te`
  - `PATCH /api/te/:id/aprobar`
  - `PATCH /api/te/:id/rechazar`
- Registrar auditoría mínima de acciones críticas.

**Criterios de aceptación F1-01:**

- Migración aplicada con tablas e índices base de Fase 1.
- Endpoints responden 200/4xx correctos con validación de payload.
- Sin regresiones en módulos productivos existentes.

### D.2) F1-02 — UI Pauta mensual + Asistencia diaria

**Objetivo:** habilitar operación diaria en interfaz.

**Entregables:**

- Página `/ops/pauta-mensual` con generación y guardado por instalación/mes.
- Página `/ops/pauta-diaria` con estado de asistencia por fecha.
- Acción de reemplazo en asistencia diaria.

**Criterios de aceptación:**

- Se puede guardar pauta mensual.
- Se puede marcar asistencia/no asistencia/reemplazo.
- La operación queda persistida y auditada.

### D.3) F1-03 — Flujo TE y pagos

**Objetivo:** cerrar ciclo de aprobación y pago de turnos extra.

**Entregables:**

- Página `/te/registro` con listado y filtros.
- Página `/te/aprobaciones` para RRHH.
- Página `/te/lotes` y `/te/pagos` para lote semanal y marcado de pago.

**Criterios de aceptación:**

- Reemplazo en asistencia genera TE pendiente.
- RRHH puede aprobar/rechazar.
- Se puede crear lote y marcar ítems pagados.

### D.4) F1-04 — Personas/Guardias MVP

**Objetivo:** consolidar ficha operativa mínima de guardias.

**Entregables:**

- Página `/personas/guardias` con ficha básica.
- Página `/personas/lista-negra` con alta/baja auditada.
- Flags operacionales y comentarios por guardia.

**Criterios de aceptación:**

- Guardia en lista negra no puede ser asignado en pauta/TE.
- Historial mínimo de cambios disponible.

---

## E) Recomendación de continuidad inmediata

Continuar con **F1-01 (Fundación de datos y contratos API)** antes de cualquier trabajo de Fase 2 o expansión UI.

Orden sugerido dentro de F1-01:

1. Prisma schema + migraciones.
2. Repositorios/servicios backend.
3. Endpoints `/api/ops/*` y `/api/te/*`.
4. Validaciones Zod + auditoría.
5. Smoke test de regresión en CRM/CPQ/Docs.

---

## F) Dependencias y decisiones abiertas

1. Confirmar nombres finales de tablas/modelos para dominio `ops`.
2. Confirmar si `te_monto_clp` vive en `crm.CrmInstallation` o en una tabla de configuración operacional.
3. Confirmar rol inicial para aprobación de TE (`rrhh`) y su estrategia de convivencia con roles actuales.
4. Confirmar formato de exportación bancaria de lotes TE (Santander u otro).

---

## G) Referencias

- `docs/00-product/MASTER_SPEC_OPI.md`
- `docs/02-implementation/ESTADO_GENERAL.md`
- `docs/06-etapa-2/ETAPA_2_IMPLEMENTACION.md`
