# 📋 Gard Docs

Sistema de presentaciones comerciales inteligente tipo Qwilr para Gard Security.

## 🎯 Descripción

**Gard Docs** es una plataforma web que transforma datos de Zoho CRM en presentaciones comerciales visualmente impactantes, con diseño tipo Qwilr (scroll vertical continuo), trazabilidad completa y sistema de tokens dinámicos.

### Características principales

- ✅ **Presentaciones tipo Qwilr**: Scroll vertical continuo con animaciones suaves
- ✅ **Sistema de tokens dinámicos**: Personalización automática con datos del cliente
- ✅ **29 secciones estructuradas**: Desde hero hasta CTA final
- ✅ **3 variantes de theme**: Executive Dark, Ops & Control, Trust & People
- ✅ **100% parametrizable**: Sin datos hardcodeados, todo viene de JSON
- ✅ **Responsive mobile-first**: Optimizado para todos los dispositivos
- ✅ **Componentes reutilizables**: KPI Cards, Timelines, Pricing Tables, etc.

## 🏗️ Stack Tecnológico

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** TailwindCSS + shadcn/ui
- **Animaciones:** Framer Motion
- **Iconos:** Lucide React

### Backend (futuro)
- **Base de datos:** Neon PostgreSQL
- **ORM:** Prisma
- **Autenticación:** NextAuth.js v5
- **Email:** Resend
- **Hosting:** Vercel

## 🚀 Instalación y Desarrollo

### Prerequisitos

- Node.js 18+ 
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone git@github.com:Cryptobal/gard-docs.git
cd gard-docs

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El proyecto estará disponible en `http://localhost:3000`

### Ver presentación demo

Accede a: `http://localhost:3000/p/demo-polpaico-2026-02`

## 📁 Estructura del Proyecto

```
gard-docs/
├── public/                          # Assets estáticos (imágenes, logos)
├── src/
│   ├── app/                         # App Router de Next.js
│   │   ├── layout.tsx               # Layout raíz
│   │   ├── page.tsx                 # Página principal
│   │   └── p/[uniqueId]/page.tsx    # Presentación pública (dinámica)
│   │
│   ├── components/
│   │   ├── ui/                      # Componentes shadcn/ui
│   │   ├── layout/                  # Header, Footer
│   │   │   ├── PresentationHeader.tsx
│   │   │   └── PresentationFooter.tsx
│   │   └── presentation/
│   │       ├── PresentationRenderer.tsx   # 🎯 Orquestador principal
│   │       ├── ThemeProvider.tsx          # Context de themes
│   │       ├── SectionWrapper.tsx         # Animaciones on-scroll
│   │       ├── StickyCTA.tsx             # CTA sticky mobile
│   │       ├── sections/                 # Secciones S01-S29
│   │       │   ├── Section01Hero.tsx
│   │       │   ├── Section02ExecutiveSummary.tsx
│   │       │   └── PlaceholderSection.tsx
│   │       └── shared/                   # Componentes reutilizables
│   │           ├── KpiCard.tsx
│   │           ├── ComparisonTable.tsx
│   │           ├── Timeline.tsx
│   │           ├── ProcessSteps.tsx
│   │           ├── PricingTable.tsx
│   │           ├── CaseStudyCard.tsx
│   │           ├── TrustBadges.tsx
│   │           └── PhotoMosaic.tsx
│   │
│   ├── lib/
│   │   ├── tokens.ts                # Sistema de reemplazo de tokens
│   │   ├── themes.ts                # Configuración de 3 themes
│   │   ├── mock-data.ts            # Payload de ejemplo (Polpaico)
│   │   └── utils.ts                 # Utilidades generales
│   │
│   ├── types/
│   │   ├── index.ts                 # Tipos base
│   │   └── presentation.ts          # PresentationPayload y tipos de secciones
│   │
│   └── styles/
│       └── globals.css              # Estilos globales + Tailwind
│
├── DOCUMENTO-MAESTRO-APLICACION.md # 📖 Especificación completa
├── Presentacion-Comercial.md       # 📖 Contenido de las 29 secciones
└── package.json
```

## 🎨 Sistema de Themes

### 1. Executive Dark Premium
- **Orientado a:** CFOs y alta dirección
- **Características:** Sobriedad, tipografía serif, espaciado generoso
- **Colores:** Slate dark + Teal accent

### 2. Ops & Control
- **Orientado a:** Gerentes de operaciones
- **Características:** Dashboards visibles, KPIs destacados, timelines
- **Colores:** Blue dark + Green accent

### 3. Trust & People
- **Orientado a:** Gestión humana
- **Características:** Fotos de equipo, cultura, valores
- **Colores:** Indigo dark + Amber accent

## 📊 Sistema de Tokens Dinámicos

Los tokens se reemplazan automáticamente con datos del payload:

```typescript
// Tokens de cliente
[ACCOUNT_NAME] → "Polpaico S.A."
[CONTACT_NAME] → "Roberto González Martínez"
[CONTACT_EMAIL] → "rgonzalez@polpaico.cl"

// Tokens de cotización
[QUOTE_NUMBER] → "COT-2026-00342"
[QUOTE_TOTAL] → "$6.307.000"
[QUOTE_DATE] → "4 de febrero de 2026"

// Tokens de sistema
[CURRENT_DATE] → Fecha actual
[PRESENTATION_URL] → URL de la presentación
```

## 🧩 Componentes UI Reutilizables

### KpiCard
Muestra métricas clave con valor, label, delta opcional y nota.

```tsx
<KpiCard 
  metric={{ 
    value: "99,5%", 
    label: "Cobertura de turnos",
    delta: "+2.1% vs mes anterior"
  }} 
/>
```

### ComparisonTable
Tabla de comparación Mercado vs GARD.

```tsx
<ComparisonTable 
  rows={[
    { criterion: "Supervisión", market: "Ocasional", gard: "Permanente" }
  ]} 
/>
```

### Timeline
Timeline vertical u horizontal para procesos.

```tsx
<Timeline 
  steps={[
    { week: "Semana 1", title: "Diagnóstico", description: "..." }
  ]} 
/>
```

### PricingTable
Tabla de propuesta económica con items, subtotal, IVA y total.

```tsx
<PricingTable pricing={payload.pricing} />
```

## 📄 Contrato de Datos (PresentationPayload)

```typescript
interface PresentationPayload {
  // Metadatos
  id: string;
  template_id: string;
  theme: 'executive' | 'ops' | 'trust';
  
  // Datos del cliente y cotización
  client: ClientData;
  quote: QuoteData;
  service: ServiceData;
  
  // Assets visuales
  assets: CompanyAssets;
  
  // CTAs y contacto
  cta: CTALinks;
  contact: ContactInfo;
  
  // Contenido de las 29 secciones
  sections: PresentationSections; // S01..S29
}
```

## 🎬 Animaciones

Las animaciones se implementan con **Framer Motion**:

- **Fade-in**: Secciones aparecen suavemente
- **Slide-up**: Elementos suben al entrar en viewport
- **Stagger**: Listas con delay progresivo
- **Scale**: Hover effects en cards

```tsx
<SectionWrapper id="s01" animation="slide">
  {/* Contenido con animación */}
</SectionWrapper>
```

## 🚧 Estado de Implementación

### ✅ Completado (MVP)

- [x] Setup Next.js 15 + TypeScript + TailwindCSS
- [x] Sistema de tipos completo (29 secciones)
- [x] Sistema de tokens dinámicos
- [x] 3 themes configurados
- [x] Componentes UI reutilizables
- [x] PresentationRenderer (orquestador)
- [x] Sección S01 (Hero) completa
- [x] Sección S02 (Executive Summary) completa
- [x] Secciones S03-S29 (estructura placeholder)
- [x] Header + Footer + StickyCTA
- [x] Animaciones Framer Motion
- [x] Mock data completo
- [x] Página pública `/p/[uniqueId]`
- [x] Responsive mobile-first

### 🔜 Próximos pasos

- [ ] Implementar secciones S03-S29 completas
- [ ] Integración con Zoho CRM (webhook)
- [ ] Sistema de envío por email (Resend)
- [ ] Autenticación con NextAuth.js
- [ ] Dashboard administrativo
- [ ] Base de datos con Prisma + Neon
- [ ] Tracking de visualizaciones
- [ ] Exportar a PDF

## 📖 Documentación Adicional

- **[DOCUMENTO-MAESTRO-APLICACION.md](DOCUMENTO-MAESTRO-APLICACION.md)**: Especificación técnica completa
- **[Presentacion-Comercial.md](Presentacion-Comercial.md)**: Contenido y estructura de las 29 secciones

## 🤝 Contribución

Este es un proyecto privado de Gard Security. Para contribuir, contacta al equipo de desarrollo.

## 📝 Licencia

Propiedad de Gard Security © 2026

## 👨‍💻 Equipo

- **Product Owner:** Carlos Irigoyen (Gard Security)
- **Development:** Implementado con Cursor AI

---

**Versión:** 0.1.0 (MVP Core)  
**Última actualización:** 04 de Febrero de 2026
