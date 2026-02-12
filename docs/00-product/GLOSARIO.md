# Glosario de Términos — OPAI Suite

> **Fecha:** 2026-02-12  
> **Estado:** Vigente — se actualiza con cada implementación  
> **Módulos cubiertos:** OPS, CRM, CPQ

---

## Términos Operacionales (OPS)

### Puesto Operativo
Definición de un punto de servicio dentro de una instalación. Un puesto tiene nombre, tipo (CPQ), cargo, rol, horario (inicio/término), y una cantidad de **slots**. Se gestiona desde el CRM (ficha de instalación) y se visualiza en OPS.

**Ejemplo:** "Control de Acceso" en instalación "Camino lo Boza", horario 20:00-08:00, 2 slots.

### Slot
Cada posición dentro de un puesto operativo que debe ser cubierta por un guardia. Si un puesto tiene `requiredGuards = 2`, ese puesto tiene 2 slots (Slot 1 y Slot 2). Cada slot es ocupado por exactamente UN guardia a la vez.

### Guardia
Persona registrada en el sistema con un `lifecycleStatus` que determina su disponibilidad operacional. Solo guardias en estado `seleccionado` o `contratado_activo` pueden ser asignados a un slot.

### Asignación
Vínculo entre un guardia y un slot de un puesto operativo. Un guardia solo puede tener UNA asignación activa a la vez. Al asignar un guardia a un slot, se registra la fecha de inicio. Al desasignarlo (por traslado, desvinculación, etc.), se registra la fecha de fin y el motivo.

### Serie (Rotación de Turnos)
Patrón de trabajo/descanso asignado a un guardia en un slot para la pauta mensual. Define cuántos días trabaja y cuántos descansa (ej: 4x4 = 4 días trabajo, 4 días descanso). La serie se "pinta" sobre la pauta mensual una vez que el guardia está asignado al slot.

### Pauta Mensual
Matriz de planificación del mes. Filas = slots (guardia por puesto), columnas = días del mes. Cada celda indica si el guardia trabaja (T), descansa (-), tiene vacaciones (V), licencia (L), permiso (P), o no está asignado (vacío → PPC).

### Asistencia Diaria
Registro del día a día: quién llegó, quién no, si hubo reemplazo. Es la **fuente de la verdad** operacional. Una vez confirmada, bloquea la pauta mensual para ese día.

### Turno Extra (TE)
Cuando un guardia planificado no asiste y otro lo reemplaza, el reemplazo genera un Turno Extra. El TE tiene un monto en CLP y pasa por un flujo de aprobación → pago.

### PPC (Puesto Por Cubrir)
Slot que no tiene guardia asignado. Se genera cuando:
- Un slot nunca fue asignado (vacío en pauta mensual)
- Un guardia es desvinculado → su asignación se cierra → slot queda vacío
- Un guardia entra en vacaciones, licencia o permiso → slot queda sin cobertura

**No es PPC** cuando un guardia planificado no asiste un día (eso genera un reemplazo → TE).

---

## Lifecycle del Guardia

| Estado | Significado | ¿Puede asignarse? | Color |
|--------|-------------|-------------------|-------|
| `postulante` | Candidato en proceso | No | Gris |
| `seleccionado` | Aprobado, pendiente de contrato | Sí | Azul |
| `contratado_activo` | Con contrato vigente | Sí | Verde |
| `inactivo` | Suspendido temporalmente | No | Amarillo |
| `desvinculado` | Desvinculado (finiquito/renuncia) | No | Rojo |

---

## Términos CRM

### Cuenta (Account)
Empresa cliente o prospecto. Tipo `client` con `isActive = true` para operaciones.

### Instalación
Sede o ubicación física de un cliente donde se presta servicio de seguridad. Tiene dirección, coordenadas, monto TE, y una lista de puestos operativos.

### Dotación Activa
Los **guardias** asignados a los puestos operativos de una instalación. Se lee desde OPS (tabla `OpsAsignacionGuardia`). En CRM es de solo lectura.

### Puestos Operativos (en CRM)
La estructura de puestos de una instalación: qué puestos hay, con qué horario, cuántos slots. Se gestionan desde CRM y se leen en OPS.

---

## Términos CPQ

### Tipo de Puesto
Clasificación del puesto de trabajo: Portería, Control de Acceso, CCTV, Ronda, Supervisión, etc. Catálogo configurable.

### Cargo
Clasificación del personal: Guardia, Supervisor, Inspector, Jefe de Turno, Operador CCTV. Catálogo configurable.

### Rol
Patrón de trabajo: 4x4, 5x2, 7x7, 6x1, Turno Especial. Define la rotación de días trabajo/descanso. Catálogo configurable.

### Sueldo Base
Remuneración bruta mensual del guardia asignado a un puesto. Se define por puesto, no por guardia individual.

---

## Relaciones Clave

```
Cliente (CrmAccount)
  └── Instalación (CrmInstallation)
       └── Puesto Operativo (OpsPuestoOperativo)
            └── Slot 1 → Asignación → Guardia A
            └── Slot 2 → Asignación → Guardia B
                              ↓
                         Pauta Mensual (serie pintada)
                              ↓
                         Asistencia Diaria
                              ↓
                         Turno Extra / PPC
```

---

*Este glosario se actualiza conforme evoluciona el sistema.*
