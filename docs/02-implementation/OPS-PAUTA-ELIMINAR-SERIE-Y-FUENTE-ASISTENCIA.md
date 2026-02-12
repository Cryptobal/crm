# Pauta mensual: eliminar serie/día y fuente de verdad de asistencias

## 1. UI acordada: eliminar serie

- **Interacción:** clic derecho sobre la celda/serie en la pauta mensual.
- **Modal con dos opciones:**
  - **"Eliminar la serie de acá en adelante"** — quita la serie pintada desde ese día hacia el futuro (para ese puesto/slot).
  - **"Eliminar solamente este día de la serie"** — quita solo ese día (ese día deja de ser "T", pasa a "-" o se elimina de pauta según modelo).
- Después de eliminar, el usuario **puede volver a pintar** sobre ese rango o día.

*(Implementación pendiente: menú contextual + modal en `OpsPautaMensualClient` y endpoint(s) para borrar serie/día.)*

---

## 2. Fuente de verdad de las asistencias

**La fuente de verdad es la tabla `asistencia_diaria` (OpsAsistenciaDiaria).**

- Cuando se marca un guardia como **asistido** en asistencia diaria, se actualiza la **fila** de ese día/puesto/slot:
  - `actualGuardiaId` = el guardia que asistió
  - `attendanceStatus` = `"asistio"` (o `"reemplazo"` si fue reemplazo)
  - Opcionalmente `checkInAt` / `checkOutAt`
- No existe una tabla aparte "asistencia del guardia" por fecha. La relación del guardia con las asistencias es por las filas donde:
  - `plannedGuardiaId` = ese guardia (planificado), o
  - `actualGuardiaId` = ese guardia (asistió), o
  - `replacementGuardiaId` = ese guardia (reemplazo).

Por tanto: **si se borra la fila de asistencia_diaria, se pierde el dato de que ese guardia asistió ese día.** No hay otro lugar donde quede guardado.

---

## 3. Dónde se borran las asistencias (comportamiento actual y deseado)

### Comportamiento actual (GET asistencia)

En `src/app/api/ops/asistencia/route.ts`:

- Solo se consideran **fantasmas** (y se borran) las filas que:
  - No tienen pauta con `shiftCode = "T"` para ese (puesto, slot, fecha), **y**
  - `lockedAt` es null, **y**
  - `replacementGuardiaId` es null, **y**
  - `attendanceStatus` está en `["pendiente", "ppc"]`.

Es decir: **no se borran** filas que tengan:
- `attendanceStatus` = `"asistio"`, `"reemplazo"`, `"no_asistio"`, etc.
- `actualGuardiaId` distinto de null (implícito cuando hay asistio/reemplazo)
- `replacementGuardiaId` distinto de null
- `lockedAt` distinto de null (bloqueadas)

Conclusión: **hoy las asistencias de guardias (asistido/reemplazo) no se borran** cuando se limpian fantasmas. Solo se borran filas "vacías" (pendiente/ppc, sin reemplazo, no bloqueadas) que ya no tienen serie pintada.

### Comportamiento deseado al implementar "eliminar serie"

Cuando exista un endpoint o acción **"eliminar serie de acá en adelante"** o **"eliminar solo este día"**:

- Se actualiza/borra **solo la pauta** (OpsPautaMensual: quitar "T", poner "-" o lo que corresponda).
- **No se debe borrar** filas de `asistencia_diaria` que tengan:
  - `attendanceStatus` distinto de pendiente/ppc, o
  - `actualGuardiaId` o `replacementGuardiaId` no nulos, o
  - `lockedAt` no nulo, o
  - TE aprobado/pagado asociado.

Opciones:

- **A)** No tocar asistencia_diaria en el endpoint de "eliminar serie": dejar que la limpieza actual del GET de asistencia siga igual. Así, las filas con asistido/reemplazo/bloqueadas **nunca se borran**; las que sigan siendo pendiente/ppc y sin pauta T sí se borrarán en el próximo GET (como hoy).
- **B)** En el endpoint de eliminar serie, borrar explícitamente solo filas "borrables" (mismo criterio que fantasmas) para ese puesto/slot/fechas afectadas. No borrar las que tengan datos de asistencia.

Recomendación: **A**. No añadir borrado de asistencia en el endpoint de eliminar serie; la fuente de verdad se preserva y el GET ya limpia solo fantasmas.

---

## 4. Repintar después de eliminar: día que ya tenía asistencia

Escenario:

1. Hay serie pintada; un día el guardia está marcado como **asistido** (queda en asistencia_diaria: actualGuardiaId, attendanceStatus "asistio").
2. El usuario **elimina la serie** (de acá en adelante o solo ese día).
3. La fila de asistencia de ese día **no se borra** (tiene asistio).
4. El usuario **vuelve a pintar** la serie y ese día vuelve a ser "T" para ese puesto/slot.

Comportamiento actual del GET asistencia:

- `createMany` con `skipDuplicates: true` usa la unique (puestoId, slotNumber, date). No se crea una segunda fila.
- La fila que ya existía (con asistido) **sigue ahí**. Luego se sincroniza `plannedGuardiaId` desde la pauta (puede cambiar si ahora hay otro guardia planificado).
- Resultado: en asistencia diaria se ve ese día con el **nuevo** planificado (si cambió) pero con **actualGuardiaId** y **attendanceStatus** del registro anterior.

Qué hacer en la UI de asistencia diaria:

- Si para un slot/día la fila tiene `actualGuardiaId` (o attendanceStatus "asistio"/"reemplazo") y el `plannedGuardiaId` actual es **distinto** (o ya no hay planificado), mostrar un aviso tipo:
  - **"Este día tenía asistencia registrada (Guardia X). Validar si corresponde al guardia actual o corregir."**
- Permitir al usuario:
  - **Validar:** aceptar como asistencia del guardia actual (por ejemplo actualizar plannedGuardiaId para alinear, o dejar como está si ya coincide).
  - **Corregir:** volver a pendiente/ppc y limpiar actualGuardiaId si fue un error o si la serie cambió y esa asistencia ya no aplica.

Resumen: **sí validamos la asistencia de guardia** en el sentido de que la mostramos y permitimos decidir si se considera válida para el guardia actual o se corrige. La fuente de verdad sigue siendo la fila en asistencia_diaria; no se borra sola al eliminar serie.

---

## 5. Resumen de respuestas

| Pregunta | Respuesta |
|----------|-----------|
| ¿Dónde se borran las asistencias de los guardias? | Solo se borran filas "fantasma" (pendiente/ppc, sin reemplazo, no bloqueadas) que ya no tienen serie pintada. Las filas con asistido/reemplazo **no se borran**. |
| Si un guardia está marcado como asistido un día, ¿se deberían borrar las asistencias diarias al eliminar la serie? | **No.** Esas filas no se tocan. Si en el futuro hay un endpoint que elimine serie, no debe borrar filas con datos de asistencia. |
| ¿Cuál es la fuente de verdad de las asistencias? | La tabla **asistencia_diaria**: `actualGuardiaId`, `attendanceStatus`, check-in/out, etc. No hay otra tabla "en el guardia" por fecha. |
| Al repintar y que un día ya tenga asistencia marcada | Mostrar ese día en asistencia diaria y un aviso: "Este día tenía asistencia registrada (Guardia X). Validar o corregir." |

---

## 6. Próximos pasos de implementación

1. **Pauta mensual:** clic derecho → modal "Eliminar serie de acá en adelante" / "Eliminar solo este día" + endpoint(s) que solo toquen pauta (y no borren filas con asistencia).
2. **Asistencia diaria:** en la fila, si hay `actualGuardiaId` / asistio y el planificado es distinto (o vacío), mostrar el aviso y acciones Validar/Corregir.
3. Mantener la regla: **nunca borrar** filas de asistencia_diaria que tengan attendanceStatus distinto de pendiente/ppc, o actualGuardiaId/replacementGuardiaId/lockedAt/TE aprobado-pagado.

---

## 7. Payroll y ficha del guardia: de dónde sale “días trabajados” y turnos extra

### Cómo sabe el sistema qué días trabajó un guardia (para sueldo a fin de mes)

- **Días trabajados (turno normal o reemplazo):**  
  Consultando la tabla **asistencia_diaria**:
  - Filas donde `actualGuardiaId = guardiaId` y `attendanceStatus = 'asistio'` → el guardia asistió ese día en ese puesto/slot.
  - Filas donde `replacementGuardiaId = guardiaId` y `attendanceStatus = 'reemplazo'` → el guardia trabajó ese día como reemplazo.
  - Payroll (o un reporte por guardia) filtra por `guardiaId` y rango de fechas del mes y cuenta/lista esas filas.

- **Turnos extra:**  
  Consultando la tabla **turnos_extra** (OpsTurnoExtra):
  - Filas donde `guardiaId = guardiaId` y, para liquidación, las que estén aprobadas/pagadas según la regla de negocio.
  - Cada TE tiene monto, fecha, puesto, etc.; Payroll los suma al cálculo del sueldo.

No hay otra fuente: **asistencia_diaria** es la fuente de verdad para “días que el guardia trabajó” (asistio/reemplazo) y **turnos_extra** para los TE.

### Qué muestra hoy la ficha del guardia

- **Turnos extra:** sí. En la ficha del guardia (Personas → Guardia → sección “Turnos extra”) se cargan con `GET /api/te?guardiaId=...` y se listan los TE de ese guardia.
- **Días trabajados (asistencias):** no hay hoy una sección equivalente. La ficha no muestra un listado ni resumen de “días que este guardia asistió” en el mes o en un rango.

### Recomendación

- En la **ficha del guardia** conviene agregar una sección **“Días trabajados”** (o “Asistencias”) que consulte asistencia_diaria donde `actualGuardiaId = guardiaId` o `replacementGuardiaId = guardiaId`, para un rango (ej. mes actual o último trimestre), y muestre lista o resumen. Así la ficha refleja lo mismo que usará Payroll: turnos extra + días trabajados.
