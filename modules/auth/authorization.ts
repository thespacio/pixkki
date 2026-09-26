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

export function ensureSuperAdmin(
    user: AuthenticatedUser
): void {

    ensureRole(user, "super_admin");

}