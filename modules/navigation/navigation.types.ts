import type { LucideIcon } from "lucide-react";

/**
 * Identificadores de sección del sidebar. El orden de declaración es el orden
 * de renderizado.
 */
export type NavSectionId =
    | "operacion"
    | "recursos"
    | "analisis"
    | "administracion"
    | "extension";

/**
 * Un ancla de navegación (nivel 1 del mapa). Las colecciones hijas no se
 * declaran aquí: viven como pestañas dentro de la página del ancla.
 */
export interface NavItem {
    /** Identificador estable. El servidor envía ids, nunca componentes. */
    readonly id: string;
    readonly label: string;
    readonly href: string;
    readonly icon: LucideIcon;
    /** Permiso requerido. Si se omite, basta con tener sesión. */
    readonly permission?: string;
    /** Solo visible para superadmin (gestión global de refugios). */
    readonly superadminOnly?: boolean;
}

export interface NavSection {
    readonly id: NavSectionId;
    readonly label: string;
    readonly items: readonly NavItem[];
}

/**
 * Datos mínimos para decidir visibilidad. No incluye el usuario completo para
 * que el filtrado siga siendo una función pura y testeable.
 */
export interface NavAccess {
    readonly permissions: readonly string[];
    readonly isSuperadmin: boolean;
    readonly hasShelter: boolean;
}
