// modules/animals/actions/animal-action-result.ts
//
// Utilidades compartidas por las Server Actions del módulo animals.
// Viven fuera de un archivo "use server" porque Next.js solo permite exportar
// funciones async desde esos módulos.

import { ZodError } from "zod";
import {
    AnimalDiagnosisForbiddenError,
    AnimalForbiddenError,
    AnimalImageLimitError,
    AnimalImageNotFoundError,
    AnimalImageRequiredError,
    AnimalImageSizeError,
    AnimalImageTypeError,
    AnimalMicrochipDuplicateError,
    AnimalNotFoundError,
    AnimalShelterNotFoundError,
    AnimalSpaceMismatchError,
    AnimalStateNotFoundError,
} from "@/modules/animals/types/animales.types";
import { AnimalClinicalForbiddenError, AnimalEnCuarentenaError, QuarantineAlreadyReleasedError } from "@/modules/animals/errors";

/**
 * Las acciones devuelven un resultado en vez de lanzar: en producción Next.js
 * oculta el mensaje de cualquier excepción que sale de una Server Action, y el
 * usuario vería un error genérico sin saber qué corregir.
 */
export type AnimalActionResult<T = void> =
    | { success: true; data: T }
    | { success: false; error: string };

// Errores de dominio cuyo mensaje ya está pensado para mostrarse al usuario.
const USER_FACING_ERRORS = [
    AnimalDiagnosisForbiddenError,
    AnimalForbiddenError,
    AnimalImageLimitError,
    AnimalImageNotFoundError,
    AnimalImageRequiredError,
    AnimalImageSizeError,
    AnimalImageTypeError,
    AnimalMicrochipDuplicateError,
    AnimalNotFoundError,
    AnimalShelterNotFoundError,
    AnimalSpaceMismatchError,
    AnimalStateNotFoundError,
    AnimalClinicalForbiddenError,
    AnimalEnCuarentenaError,
    QuarantineAlreadyReleasedError,
];

export function toErrorMessage(error: unknown): string {
    if (error instanceof ZodError) {
        const issue = error.issues[0];
        const field = issue?.path.join(".");
        return field ? `${field}: ${issue.message}` : (issue?.message ?? "Datos inválidos");
    }

    if (USER_FACING_ERRORS.some((E) => error instanceof E)) {
        return error instanceof Error
            ? error.message
            : "No se pudo completar la operación. Intenta de nuevo.";
    }

    // Los errores de Supabase/PostgREST son objetos planos con `code` y `message`
    // (no instancias de Error), por eso se inspeccionan por forma.
    if (typeof error === "object" && error !== null && "code" in error) {
        const code = typeof error.code === "string" ? error.code : undefined;
        const message =
            "message" in error && typeof error.message === "string"
                ? error.message
                : undefined;

        if (code === "23505") {
            return "Ya existe un animal con ese microchip";
        }
        // Columna inexistente: falta aplicar la migración del expediente.
        if (code === "PGRST204" || code === "42703") {
            return (
                "La base de datos aún no tiene las columnas del expediente. " +
                "Ejecuta la migración supabase/migrations/20261113_requerimiento_01_expediente.sql " +
                "(equivalente a 20261024_animal_datos_rescate.sql) en Supabase."
            );
        }
        if (code === "42501") {
            return "La base de datos rechazó la operación por permisos (RLS).";
        }
        console.error("[animal.actions] Error de Supabase:", { code, message });
        return "No se pudo completar la operación. Intenta de nuevo.";
    }

    console.error("[animal.actions] Error inesperado:", error);
    return "No se pudo completar la operación. Intenta de nuevo.";
}
