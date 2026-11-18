// modules/users/actions/user-action-result.ts
//
// Utilidades compartidas por las Server Actions del módulo users.
// Viven fuera de un archivo "use server" porque Next.js solo permite
// exportar funciones async desde esos módulos.

import { ZodError } from "zod";
import {
    EmailAlreadyInUseError,
    StaffCreationFailedError,
    StaffShelterRequiredError,
    UserAuthorizationError,
    UserNotFoundError,
} from "@/modules/users/errors";
import { UserRepositoryError } from "@/modules/users/repository";
import { UserServiceError } from "@/modules/users/user.service";

/**
 * Las acciones devuelven un resultado en vez de lanzar: en producción Next.js
 * oculta el mensaje de cualquier excepción que salga de una Server Action.
 */
export type UserActionResult<T = void> =
    | { success: true; data: T }
    | { success: false; error: string };

const USER_FACING_ERRORS = [
    EmailAlreadyInUseError,
    StaffCreationFailedError,
    StaffShelterRequiredError,
    UserAuthorizationError,
    UserNotFoundError,
    UserServiceError,
    UserRepositoryError,
];

export function toUserErrorMessage(error: unknown): string {
    if (error instanceof ZodError) {
        const issue = error.issues[0];
        const field = issue?.path.join(".");
        return field ? `${field}: ${issue.message}` : (issue?.message ?? "Datos inválidos");
    }

    if (USER_FACING_ERRORS.some((ErrorClass) => error instanceof ErrorClass)) {
        return error instanceof Error
            ? error.message
            : "No se pudo completar la operación. Intenta de nuevo.";
    }

    // PostgREST devuelve objetos planos con `code`, no instancias de Error.
    if (typeof error === "object" && error !== null && "code" in error) {
        const code = error.code;
        if (code === "23505") {
            return "El correo ya está registrado en la plataforma.";
        }
        if (code === "42501") {
            return "La base de datos rechazó la operación por permisos (RLS).";
        }
        console.error("[user.actions] Error de Supabase:", error);
        return "No se pudo completar la operación. Intenta de nuevo.";
    }

    console.error("[user.actions] Error inesperado:", error);
    return "No se pudo completar la operación. Intenta de nuevo.";
}
