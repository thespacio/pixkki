// app/api/v1/espacios/route-helpers.ts

import { getCurrentUser } from "@/modules/auth";
import { isAdmin, isSuperadmin } from "@/modules/auth/authorization";
import { ForbiddenError } from "@/modules/auth/errors";
import type { AuthenticatedUser } from "@/modules/auth/types";

/** El parser de `[id]` es genérico: vive en `lib/api` y se reexporta acá. */
export { parseRouteId } from "@/lib/api/request";

/** Exige sesión (el middleware ya responde 401 sin cookie válida). */
export async function requireSpaceUser(): Promise<AuthenticatedUser> {
    return getCurrentUser();
}

/** Las mutaciones de espacios están reservadas a Admin y Superadmin. */
export function requireSpaceManager(user: AuthenticatedUser): void {
    if (!isAdmin(user) && !isSuperadmin(user)) {
        throw new ForbiddenError("No tienes permisos para gestionar espacios.");
    }
}

/**
 * Alcance multitenant de las consultas:
 * - superadmin → `undefined` (sin filtro, ve todos los refugios)
 * - resto      → su propio `shelterId` (o -1 si no tiene, que nunca coincide)
 */
export function spaceScope(user: AuthenticatedUser): number | undefined {
    return isSuperadmin(user) ? undefined : user.shelterId ?? -1;
}
