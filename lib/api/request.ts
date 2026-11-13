// ---------------------------------------------------------------------------
// Lectura del cuerpo JSON para los Route Handlers de la API v1.
// ---------------------------------------------------------------------------

import type { NextRequest } from "next/server";

/**
 * Lee el cuerpo de la petición como JSON.
 *
 * Si el cuerpo no es JSON válido devuelve `null`: los schemas de la ruta
 * (Zod) lo rechazarán como VALIDATION_ERROR 400, que es la respuesta
 * esperada para un cuerpo malformado.
 */
export async function readJsonBody(request: NextRequest): Promise<unknown> {
    try {
        return await request.json();
    } catch {
        return null;
    }
}

/** Error de path param inválido: `handleApiError` lo traduce a 400. */
export class InvalidRouteParamError extends Error {
    readonly code = "PARAMETRO_INVALIDO";
    readonly statusCode = 400;

    constructor(field: string) {
        super(`${field} inválido`);
        this.name = "InvalidRouteParamError";
    }
}

/** Convierte el segmento `[id]` de la ruta en un entero positivo. */
export function parseRouteId(value: string, field = "ID"): number {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new InvalidRouteParamError(field);
    }

    return parsed;
}

/** Lee un query param booleano (`true`/`false`); cualquier otro valor se ignora. */
export function readBooleanParam(value: string | null): boolean | undefined {
    if (value === "true") return true;
    if (value === "false") return false;
    return undefined;
}

/** Lee un query param entero positivo; devuelve `undefined` si no es válido. */
export function readPositiveIntParam(value: string | null): number | undefined {
    if (value === null) return undefined;

    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

/** Lee un query param entero ≥ 0; usa `fallback` si no es válido. */
export function readNonNegativeIntParam(
    value: string | null,
    fallback: number,
): number {
    if (value === null) return fallback;

    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}
