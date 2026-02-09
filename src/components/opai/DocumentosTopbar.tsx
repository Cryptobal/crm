'use client';

import { AppTopbar } from './AppTopbar';
import { TemplatesDropdown } from './TemplatesDropdown';

/**
 * DocumentosTopbar - Topbar específico para la página de Documentos
 * 
 * Muestra solo:
 * - Templates (dropdown)
 * 
 * Nota: La campana de notificaciones ahora está integrada en el AppShell global.
 */
export function DocumentosTopbar() {
  return (
    <AppTopbar>
      <div className="flex items-center gap-2">
        <TemplatesDropdown />
      </div>
    </AppTopbar>
  );
}
