/**
 * Sistema de Themes para Presentaciones
 * Define 3 variantes visuales según Presentacion-Comercial.md:
 * - Executive Dark Premium: máxima sobriedad, CFO-friendly
 * - Ops & Control: más dashboards, timelines, KPIs visibles
 * - Trust & People: más foco en selección, continuidad, fotos reales
 */

import { ThemeVariant } from '@/types';

export interface ThemeConfig {
  id: ThemeVariant;
  name: string;
  description: string;
  
  // Colores principales
  colors: {
    primary: string;
    primaryHover: string;
    secondary: string;
    accent: string;
    accentHover: string;
    background: string;
    backgroundAlt: string;
    text: string;
    textMuted: string;
    border: string;
  };
  
  // Tipografía
  typography: {
    fontFamily: string;
    headlineWeight: string;
    bodyWeight: string;
  };
  
  // Densidad visual
  density: 'low' | 'medium' | 'high';
  
  // Énfasis en componentes
  emphasis: {
    dashboards: boolean;    // Mostrar más KPIs y métricas
    timelines: boolean;     // Énfasis en procesos y secuencias
    imagery: 'minimal' | 'balanced' | 'people-focused';
    dataVisualization: boolean;  // Gráficos y tablas destacados
  };
  
  // Configuración de secciones
  sections: {
    showDetailedMetrics: boolean;
    emphasizeCompliance: boolean;
    emphasizePeople: boolean;
  };
}

/**
 * V1 — Executive Dark Premium
 * Máxima sobriedad, CFO-friendly
 */
const executiveTheme: ThemeConfig = {
  id: 'executive',
  name: 'Executive Dark Premium',
  description: 'Diseño sobrio y premium orientado a CFOs y alta dirección',
  
  colors: {
    primary: 'bg-slate-900',
    primaryHover: 'hover:bg-slate-800',
    secondary: 'bg-slate-800',
    accent: 'bg-teal-500',
    accentHover: 'hover:bg-teal-600',
    background: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
    backgroundAlt: 'bg-slate-950',
    text: 'text-slate-100',
    textMuted: 'text-slate-400',
    border: 'border-slate-700',
  },
  
  typography: {
    fontFamily: 'font-serif',
    headlineWeight: 'font-bold',
    bodyWeight: 'font-normal',
  },
  
  density: 'low',  // Más espacio en blanco
  
  emphasis: {
    dashboards: false,
    timelines: true,
    imagery: 'minimal',
    dataVisualization: false,
  },
  
  sections: {
    showDetailedMetrics: false,  // Solo KPIs principales
    emphasizeCompliance: true,   // Énfasis en cumplimiento
    emphasizePeople: false,
  },
};

/**
 * V2 — Ops & Control
 * Más dashboards, timelines, KPIs visibles
 */
const opsTheme: ThemeConfig = {
  id: 'ops',
  name: 'Ops & Control',
  description: 'Orientado a operaciones con énfasis en métricas y control',
  
  colors: {
    primary: 'bg-blue-900',
    primaryHover: 'hover:bg-blue-800',
    secondary: 'bg-blue-800',
    accent: 'bg-green-500',
    accentHover: 'hover:bg-green-600',
    background: 'bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900',
    backgroundAlt: 'bg-blue-950',
    text: 'text-blue-50',
    textMuted: 'text-blue-300',
    border: 'border-blue-700',
  },
  
  typography: {
    fontFamily: 'font-sans',
    headlineWeight: 'font-extrabold',
    bodyWeight: 'font-normal',
  },
  
  density: 'high',  // Más información visible
  
  emphasis: {
    dashboards: true,       // Destacar KPIs y métricas
    timelines: true,        // Procesos visibles
    imagery: 'minimal',
    dataVisualization: true,  // Gráficos y tablas prominentes
  },
  
  sections: {
    showDetailedMetrics: true,   // Mostrar todos los KPIs
    emphasizeCompliance: true,
    emphasizePeople: false,
  },
};

/**
 * V3 — Trust & People
 * Más foco en selección, continuidad, fotos reales
 */
const trustTheme: ThemeConfig = {
  id: 'trust',
  name: 'Trust & People',
  description: 'Enfoque humano con énfasis en equipo y cultura organizacional',
  
  colors: {
    primary: 'bg-indigo-900',
    primaryHover: 'hover:bg-indigo-800',
    secondary: 'bg-indigo-800',
    accent: 'bg-amber-400',
    accentHover: 'hover:bg-amber-500',
    background: 'bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900',
    backgroundAlt: 'bg-indigo-950',
    text: 'text-indigo-50',
    textMuted: 'text-indigo-300',
    border: 'border-indigo-700',
  },
  
  typography: {
    fontFamily: 'font-sans',
    headlineWeight: 'font-bold',
    bodyWeight: 'font-normal',
  },
  
  density: 'medium',
  
  emphasis: {
    dashboards: false,
    timelines: true,
    imagery: 'people-focused',  // Más fotos de guardias
    dataVisualization: false,
  },
  
  sections: {
    showDetailedMetrics: false,
    emphasizeCompliance: true,
    emphasizePeople: true,  // Destacar selección y cultura
  },
};

/**
 * Registro de todos los themes disponibles
 */
export const themes: Record<ThemeVariant, ThemeConfig> = {
  executive: executiveTheme,
  ops: opsTheme,
  trust: trustTheme,
};

/**
 * Obtiene la configuración de un theme específico
 */
export function getTheme(variant: ThemeVariant): ThemeConfig {
  return themes[variant] || themes.executive;
}

/**
 * Verifica si un theme debe mostrar dashboards
 */
export function shouldShowDashboards(variant: ThemeVariant): boolean {
  return themes[variant]?.emphasis.dashboards ?? false;
}

/**
 * Verifica si un theme debe enfatizar personas
 */
export function shouldEmphasizePeople(variant: ThemeVariant): boolean {
  return themes[variant]?.sections.emphasizePeople ?? false;
}

/**
 * Obtiene las clases CSS para un theme específico
 */
export function getThemeClasses(variant: ThemeVariant) {
  const theme = getTheme(variant);
  
  return {
    // Backgrounds
    primary: theme.colors.primary,
    primaryHover: theme.colors.primaryHover,
    secondary: theme.colors.secondary,
    background: theme.colors.background,
    backgroundAlt: theme.colors.backgroundAlt,
    
    // Text
    text: theme.colors.text,
    textMuted: theme.colors.textMuted,
    
    // Accent
    accent: theme.colors.accent,
    accentHover: theme.colors.accentHover,
    
    // Border
    border: theme.colors.border,
    
    // Typography
    fontFamily: theme.typography.fontFamily,
    headlineWeight: theme.typography.headlineWeight,
    bodyWeight: theme.typography.bodyWeight,
  };
}

/**
 * Genera clase CSS completa para una sección según el theme
 */
export function getSectionClasses(variant: ThemeVariant, sectionId: string): string {
  const theme = getTheme(variant);
  const classes = getThemeClasses(variant);
  
  // Clases base para todas las secciones
  const baseClasses = [
    'section-container',
    'py-16 md:py-24',
    classes.text,
  ];
  
  // Aplicar background alternado según ID de sección
  const sectionNumber = parseInt(sectionId.replace('s', ''));
  const isEven = sectionNumber % 2 === 0;
  
  if (isEven) {
    baseClasses.push(classes.backgroundAlt);
  }
  
  return baseClasses.join(' ');
}
