"use client";

/**
 * PermissionsProvider — React context para acceder a permisos en client components.
 *
 * Se inicializa en el layout principal con los permisos resueltos del server.
 *
 * Uso:
 *   const perms = usePermissions();
 *   if (canView(perms, "ops", "puestos")) { ... }
 */

import { createContext, useContext, type ReactNode } from "react";
import {
  type RolePermissions,
  EMPTY_PERMISSIONS,
  canView as _canView,
  canEdit as _canEdit,
  canDelete as _canDelete,
  hasCapability as _hasCapability,
  hasModuleAccess as _hasModuleAccess,
  getVisibleSubmodules as _getVisibleSubmodules,
  getEffectiveLevel as _getEffectiveLevel,
  type ModuleKey,
  type CapabilityKey,
  type PermissionLevel,
  type SubmoduleMeta,
} from "@/lib/permissions";

const PermissionsContext = createContext<RolePermissions>(EMPTY_PERMISSIONS);

export function PermissionsProvider({
  permissions,
  children,
}: {
  permissions: RolePermissions;
  children: ReactNode;
}) {
  return (
    <PermissionsContext.Provider value={permissions}>
      {children}
    </PermissionsContext.Provider>
  );
}

/** Hook para obtener los permisos completos del usuario actual */
export function usePermissions(): RolePermissions {
  return useContext(PermissionsContext);
}

/** Hook para verificar si puede ver un módulo/submódulo */
export function useCanView(module: ModuleKey, submodule?: string): boolean {
  const perms = usePermissions();
  return _canView(perms, module, submodule);
}

/** Hook para verificar si puede editar un módulo/submódulo */
export function useCanEdit(module: ModuleKey, submodule?: string): boolean {
  const perms = usePermissions();
  return _canEdit(perms, module, submodule);
}

/** Hook para verificar si puede eliminar en un módulo/submódulo */
export function useCanDelete(module: ModuleKey, submodule?: string): boolean {
  const perms = usePermissions();
  return _canDelete(perms, module, submodule);
}

/** Hook para verificar si tiene una capacidad especial */
export function useHasCapability(cap: CapabilityKey): boolean {
  const perms = usePermissions();
  return _hasCapability(perms, cap);
}

/** Hook para verificar si tiene acceso a un módulo (al menos un submódulo visible) */
export function useHasModuleAccess(module: ModuleKey): boolean {
  const perms = usePermissions();
  return _hasModuleAccess(perms, module);
}

/** Hook para obtener los submódulos visibles de un módulo */
export function useVisibleSubmodules(module: ModuleKey): SubmoduleMeta[] {
  const perms = usePermissions();
  return _getVisibleSubmodules(perms, module);
}

/** Hook para obtener el nivel efectivo de permiso */
export function useEffectiveLevel(
  module: ModuleKey,
  submodule?: string,
): PermissionLevel {
  const perms = usePermissions();
  return _getEffectiveLevel(perms, module, submodule);
}
