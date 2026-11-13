// modules/auth/dtos/auth-user.dto.ts

import { AuthenticatedUser } from "@/modules/auth/types";

/**
 * DTO de usuario autenticado para las respuestas de la API v1
 * (requerimiento-00, RF0.5).
 *
 * `shelterId` es `null` para el superadmin, que opera a nivel global.
 * `requiresOnboarding` refleja `usuario.primer_inicio_sesion` (US30).
 */
export type AuthUserResponse = Pick<
    AuthenticatedUser,
    | "id"
    | "email"
    | "role"
    | "permissions"
    | "shelterId"
    | "emailVerified"
    | "requiresOnboarding"
>;

/**
 * Proyecta el usuario autenticado al DTO de respuesta de la API.
 */
export function toAuthUserResponse(
    user: AuthenticatedUser
): AuthUserResponse {
    return {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        shelterId: user.shelterId,
        emailVerified: user.emailVerified,
        requiresOnboarding: user.requiresOnboarding,
    };
}
