import { AuthenticatedUser } from "@/modules/auth/types";
import { isSuperadminRole } from "@/modules/auth/authorization";
import { UserAuthorizationError } from "./errors";

/**
 * Roles con capacidad de gestionar personal (crear / activar / eliminar).
 * Comparación case-insensitive: el valor real proviene de `rol.nombre_rol`
 * en BD y no está estandarizado.
 */
export function isStaffManager(role: string): boolean {
    const normalized = role.trim().toLowerCase();
    return normalized === "administrador" || normalized === "admin" || isSuperadminRole(role);
}

/**
 * Autoriza la gestión de personal del refugio (F-USERS-01): solo Admin/Superadmin.
 */
export function ensureCanManageStaff(user: AuthenticatedUser): void {
    if (!isStaffManager(user.role)) {
        throw new UserAuthorizationError(
            "Solo administradores o superadmins pueden gestionar el personal del refugio."
        );
    }
}

/**
 * Autoriza operaciones exclusivas del superadmin (F-USERS-03: vista global).
 */
export function ensureIsSuperAdmin(user: AuthenticatedUser): void {
    if (!isSuperadminRole(user.role)) {
        throw new UserAuthorizationError(
            "Solo un superadmin puede realizar esta acción."
        );
    }
}