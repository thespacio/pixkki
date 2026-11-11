// modules/auth/dtos/auth-user.dto.ts

import { AuthenticatedUser } from "@/modules/auth/types";

/**
 * DTO de usuario autenticado para las respuestas de la API v1
 * (requerimiento-00, RF0.5).
 *
 * `requiresOnboarding` se omite hasta que exista la feature de onboarding
 * (US30): no se expone un campo que aún no se puede calcular.
 */
export type AuthUserResponse = Pick<
    AuthenticatedUser,
    "id" | "email" | "role" | "permissions" | "shelterId" | "emailVerified"
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
    };
}
