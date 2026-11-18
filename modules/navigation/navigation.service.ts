import { navigationSections } from "./navigation.config";
import type { NavAccess, NavItem, NavSection } from "./navigation.types";

/**
 * Decide si un ancla es visible para el usuario actual.
 *
 * El filtro es puro: no consulta la base ni React. La autoridad real sigue
 * estando en la página y en el service; esto solo evita ofrecer enlaces que el
 * usuario no puede usar.
 */
export function isNavItemVisible(item: NavItem, access: NavAccess): boolean {
    if (item.superadminOnly && !access.isSuperadmin) {
        return false;
    }

    if (item.permission && !access.permissions.includes(item.permission)) {
        return false;
    }

    return true;
}

/**
 * Devuelve los ids visibles. El layout protegido calcula esto en el servidor y
 * los pasa a las islas cliente, que nunca reciben componentes ni funciones.
 */
export function resolveVisibleNavIds(access: NavAccess): string[] {
    return navigationSections
        .flatMap((section) => section.items)
        .filter((item) => isNavItemVisible(item, access))
        .map((item) => item.id);
}

/**
 * Reconstruye las secciones visibles a partir de los ids autorizados,
 * descartando las secciones que quedan vacías.
 */
export function getVisibleNavigation(
    visibleIds: readonly string[]
): NavSection[] {
    const allowed = new Set(visibleIds);

    return navigationSections
        .map((section) => ({
            ...section,
            items: section.items.filter((item) => allowed.has(item.id)),
        }))
        .filter((section) => section.items.length > 0);
}

/** ¿La ruta actual pertenece al ancla? Incluye sus subvistas. */
export function isPathActive(pathname: string, href: string): boolean {
    return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Ancla activa para una ruta. Si varias coinciden (por prefijo), gana la más
 * específica.
 */
export function findActiveNavItem(pathname: string): NavItem | undefined {
    return navigationSections
        .flatMap((section) => section.items)
        .filter((item) => isPathActive(pathname, item.href))
        .sort((a, b) => b.href.length - a.href.length)[0];
}

/**
 * Etiqueta del ancla activa, usada por el breadcrumb. Devuelve `null` cuando la
 * ruta no pertenece a ninguna ancla (por ejemplo, una compuerta de acceso).
 */
export function findActiveNavLabel(pathname: string): string | null {
    return findActiveNavItem(pathname)?.label ?? null;
}
