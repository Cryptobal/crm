/**
 * Constantes compartidas - OPAI
 */

/** Tipos de servicio disponibles */
export const SERVICE_TYPES = [
  { value: "guardias_seguridad", label: "Guardias de Seguridad" },
  { value: "seguridad_electronica", label: "Seguridad Electrónica" },
  { value: "central_monitoreo", label: "Central de Monitoreo" },
  { value: "drones", label: "Drones de Seguridad" },
  { value: "consultoria", label: "Consultoría en Seguridad" },
  { value: "otro", label: "Otro" },
] as const;

/** Días de la semana */
export const WEEKDAYS = [
  { value: "lunes", label: "Lun" },
  { value: "martes", label: "Mar" },
  { value: "miercoles", label: "Mié" },
  { value: "jueves", label: "Jue" },
  { value: "viernes", label: "Vie" },
  { value: "sabado", label: "Sáb" },
  { value: "domingo", label: "Dom" },
] as const;
