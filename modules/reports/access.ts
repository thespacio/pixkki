import { isSuperadmin } from "@/modules/auth/authorization";
import type { AuthenticatedUser } from "@/modules/auth/types";

import { RefugioFueraDeAlcanceError, RolSinPermisoReportesError } from "./errors";

/** Permisos RF7.8 tal como están sembrados en `permiso`. */
export const REPORTS_PERMISSIONS = {
    view: "reports.view",
    export: "reports.export",
} as const;

/** Roles con acceso al resumen del panel (matriz RF7.8). */
const ROLES_CON_RESUMEN = new Set([
    "administrador",
    "coordinador",
    "veterinario",
    "operador",
    "superadmin",
]);

export type ReportsAccess = {
    /** `null` significa agregado global (solo Superadmin). */
    idRefugio: number | null;
};

function normalizarRol(rol: string): string {
    return rol.toLowerCase().replace(/[^a-z]/g, "");
}

/**
 * Autorización del resumen. La UI puede ocultar el panel, pero la autoridad es
 * esta función (P10 de la metodología UI/UX).
 */
export function getReportsAccess(
    user: Pick<AuthenticatedUser, "role" | "permissions" | "shelterId">,
): ReportsAccess {
    if (
        !user.permissions.includes(REPORTS_PERMISSIONS.view) ||
        !ROLES_CON_RESUMEN.has(normalizarRol(user.role))
    ) {
        throw new RolSinPermisoReportesError();
    }

    if (isSuperadmin(user)) {
        return { idRefugio: null };
    }

    if (user.shelterId === null) {
        throw new RefugioFueraDeAlcanceError();
    }

    return { idRefugio: user.shelterId };
}
