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
