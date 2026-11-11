// ---------------------------------------------------------------------------
// Envelope uniforme para los Route Handlers de la API v1 (requerimiento-00).
//
//   Éxito -> { success: true,  data: ... }
//   Error -> { success: false, error: { code, message, statusCode } }
//
// `handleApiError` traduce errores del dominio y de Zod al envelope sin
// acoplar `lib` a los módulos: solo inspecciona propiedades estructurales
// (statusCode, code, retryAfterSeconds).
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiSuccess<T>(data: T, statusCode = 200): NextResponse {
    return NextResponse.json(
        { success: true, data },
        { status: statusCode },
    );
}

export function apiError(
    code: string,
    message: string,
    statusCode: number,
    headers?: Record<string, string>,
): NextResponse {
    return NextResponse.json(
        {
            success: false,
            error: { code, message, statusCode },
        },
        { status: statusCode, headers },
    );
}

/** 400 VALIDATION_ERROR con el primer issue de Zod legible para el usuario. */
export function apiValidationError(error: ZodError): NextResponse {
    const issue = error.issues[0];
    return apiError(
        "VALIDATION_ERROR",
        issue?.message ?? "Datos inválidos.",
        400,
    );
}

/**
 * Traduce cualquier error lanzado en un Route Handler al envelope uniforme.
 *
 * - ZodError                   -> 400 VALIDATION_ERROR
 * - Error con statusCode 4xx   -> código derivado y mensaje del error
 * - Error con statusCode 5xx   -> 500 INTERNAL_ERROR (log interno, mensaje genérico)
 * - Error desconocido          -> 500 INTERNAL_ERROR
 */
export function handleApiError(error: unknown): NextResponse {
    if (error instanceof ZodError) {
        return apiValidationError(error);
    }

    if (error instanceof Error) {
        const statusCode = readStatusCode(error) ?? 500;

        // Los errores 5xx nunca exponen detalles internos al cliente.
        if (statusCode >= 500) {
            console.error("[api] Error interno:", error);
            return apiError(
                "INTERNAL_ERROR",
                "Error interno del servidor.",
                500,
            );
        }

        return apiError(
            deriveErrorCode(error),
            error.message,
            statusCode,
            readRetryAfterHeaders(error),
        );
    }

    console.error("[api] Error interno desconocido:", error);
    return apiError("INTERNAL_ERROR", "Error interno del servidor.", 500);
}

/** Lee `statusCode` si el error lo define (AuthError, ShelterError, RateLimitError...). */
function readStatusCode(error: Error): number | undefined {
    return "statusCode" in error && typeof error.statusCode === "number"
        ? error.statusCode
        : undefined;
}

/** Lee `retryAfterSeconds` (RateLimitError) y lo traduce al header Retry-After. */
function readRetryAfterHeaders(error: Error): Record<string, string> | undefined {
    if (
        "retryAfterSeconds" in error &&
        typeof error.retryAfterSeconds === "number"
    ) {
        return { "Retry-After": String(error.retryAfterSeconds) };
    }
    return undefined;
}

/**
 * Deriva el código de error: usa el `code` explícito (ShelterError,
 * RateLimitError) o convierte el nombre de la clase a UPPER_SNAKE_CASE
 * (InvalidCredentialsError -> INVALID_CREDENTIALS).
 */
function deriveErrorCode(error: Error): string {
    if (
        "code" in error &&
        typeof error.code === "string" &&
        error.code.length > 0
    ) {
        return error.code;
    }

    const className = error.constructor.name || error.name;
    return className
        .replace(/Error$/, "")
        .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
        .toUpperCase();
}
