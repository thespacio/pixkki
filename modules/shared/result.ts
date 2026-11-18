/**
 * Resultado tipado de una operación de dominio.
 *
 * Es el único tipo auxiliar permitido por `AGENTS.md` §10: no describe una
 * estructura validable (por eso no nace de Zod), sino el desenlace de una
 * operación. Los DTO siguen derivándose exclusivamente de sus schemas Zod.
 *
 * - `ok: true`  → la operación se completó; `data` es el valor esperado.
 * - `ok: false` → la operación se rechazó; `error` es un mensaje en español
 *   apto para el usuario final y `code` un identificador estable para la UI.
 *
 * Se estrecha con `if (result.ok)`; nunca se accede a `data` sin comprobarlo.
 */
export type Result<T> =
    | { readonly ok: true; readonly data: T }
    | { readonly ok: false; readonly error: string; readonly code?: string };

/**
 * Estrecha un `Result<T>` en el caso exitoso.
 */
export function isOk<T>(
    result: Result<T>,
): result is Extract<Result<T>, { ok: true }> {
    return result.ok;
}

/**
 * Construye un resultado exitoso.
 */
export function ok<T>(data: T): Result<T> {
    return { ok: true, data };
}

/**
 * Construye un resultado fallido con mensaje para el usuario final.
 */
export function fail(error: string, code?: string): Result<never> {
    return code === undefined ? { ok: false, error } : { ok: false, error, code };
}
