import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases de Tailwind evitando conflictos
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea números como moneda chilena (CLP)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(value);
}

/**
 * Formatea números en UF
 */
export function formatUF(value: number): string {
  return `UF ${new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}`;
}

/**
 * Formatea fechas en español chileno
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formatea fechas en formato corto
 */
export function formatDateShort(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Escapa caracteres especiales para RegExp
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
