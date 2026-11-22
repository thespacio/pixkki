import { ZodError } from "zod";
import { isAdoptionDomainError } from "../errors";

export type AdoptionActionResult<T = void> =
    | { success: true; data: T }
    | { success: false; error: string; code?: string; details?: unknown };

export function toAdoptionErrorResult(error: unknown): { success: false; error: string; code?: string; details?: unknown } {
    if (error instanceof ZodError) {
        const issue = error.issues[0];
        const field = issue?.path.join(".");
        return {
            success: false,
            error: field ? `${field}: ${issue.message}` : (issue?.message ?? "Datos inválidos."),
            code: "DATOS_INVALIDOS",
        };
    }

    if (isAdoptionDomainError(error)) {
        return {
            success: false,
            error: error.message,
            code: error.code,
            details: error.details,
        };
    }

    console.error("[adoptions.actions] Error inesperado:", error);
    return {
        success: false,
        error: "No se pudo completar la operación. Intenta de nuevo.",
        code: "ERROR_INTERNO",
    };
}