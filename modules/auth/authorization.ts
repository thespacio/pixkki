import type { AuthenticatedUser } from "./types";

import {
    ForbiddenError,
    //ForbiddenError,
    UnauthorizedError,
} from "./errors";

export function ensureAuthenticated(
    user: AuthenticatedUser | null | undefined
): asserts user is AuthenticatedUser {

    if (!user) {
        throw new UnauthorizedError();
    }

}

export function ensurePermission(
    user: AuthenticatedUser,
    permission: string
): void {

    ensureAuthenticated(user);

    if (!user.permissions.includes(permission)) {
        throw new UnauthorizedError(
            `Missing permission: ${permission}`
        );
    }

}

export function hasPermission(
    user: AuthenticatedUser,
    permission: string
): boolean {
    return user.permissions.includes(permission);

}

export function ensureAnyPermission(
    user: AuthenticatedUser,
    permissions: string[]
): void {

    ensureAuthenticated(user);

    const hasPermission = permissions.some(permission =>
        user.permissions.includes(permission)
    );

    if (!hasPermission) {
        throw new ForbiddenError();
    }

}

export function ensureAllPermissions(
    user: AuthenticatedUser,
    permissions: string[]
): void {

    ensureAuthenticated(user);

    const hasAllPermissions = permissions.every(permission =>
        user.permissions.includes(permission)
    );

    if (!hasAllPermissions) {
        throw new ForbiddenError();
    }

}

export function ensureRole(
    user: AuthenticatedUser,
    role: string
): void {

    ensureAuthenticated(user);

    if (user.role !== role) {
        throw new ForbiddenError(
            `Required role: ${role}`
        );
    }

}

export function ensureAnyRole(
    user: AuthenticatedUser,
    roles: string[]
): void {

    ensureAuthenticated(user);

    if (!roles.includes(user.role)) {
        throw new ForbiddenError();
    }

}

/**
 * ¿Es superadmin? El rol llega desde la base con el nombre tal cual se guardó
 * ("Superadmin"), aunque el tipo `UserRole` lo declare en minúsculas. Se normaliza
 * para no depender de mayúsculas ni de guiones (superadmin / Superadmin / super_admin).
 */
export function isSuperadmin(user: Pick<AuthenticatedUser, "role">): boolean {
    return String(user.role).toLowerCase().replace(/[^a-z]/g, "") === "superadmin";
}

export function ensureSuperAdmin(
    user: AuthenticatedUser
): void {

    ensureAuthenticated(user);

    // Antes comparaba contra "super_admin", valor que la base nunca guarda: ningún
    // usuario habría pasado esta verificación.
    if (!isSuperadmin(user)) {
        throw new ForbiddenError("Required role: Superadmin");
    }

}