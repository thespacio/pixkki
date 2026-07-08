import {
    EmailNotVerifiedError,
} from "./errors";

import {
    findUserContext,
    getAuthenticatedUser,
    signOut,
} from "./repository";

import type {
    AuthenticatedUser,
} from "./types";
import * as repository from "@/modules/auth/repository";

export async function getCurrentUser(): Promise<AuthenticatedUser> {

    const authUser = await getAuthenticatedUser();

    const context = await findUserContext(authUser.id);

    if (!authUser.email_confirmed_at) {
        throw new EmailNotVerifiedError();
    }

    const role =
        await repository.findRoleNameById(context.rol);

    const permissions =
        await repository.findPermissionsByRole(context.rol);

    /*if (!context.activo) {
        throw new InactiveUserError();
    }

    if (!context.refugio?.activo) {
        throw new InactiveShelterError();
    }*/

    return {
        id: context.id_usuario,
        shelterId: context.id_refugio?? null,
        fullName: context.nombre_completo,
        email: context.correo,
        role: role,
        permissions: permissions,
        active: context.activo,
        emailVerified: true,
        lastLogin: context.ultimo_login
    };
}

export async function refreshCurrentUser(): Promise<AuthenticatedUser> {
    return getCurrentUser();
}

export async function getPermissions(): Promise<string[]> {
    const user = await getCurrentUser();

    return user.permissions;
}

export async function logout(): Promise<void> {
    await signOut();
}