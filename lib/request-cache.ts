import { cache } from "react";

/**
 * Memoriza una función durante UNA misma petición del servidor (React `cache`).
 *
 * Sirve para que el layout, la página y las acciones que corren en la misma
 * petición compartan el resultado (por ejemplo "quién es el usuario actual")
 * en vez de repetir las mismas consultas a la base de datos.
 *
 * - El resultado NO se comparte entre peticiones ni entre usuarios: React lo
 *   descarta al terminar cada petición.
 * - Fuera de React Server Components (tests, scripts) `cache` no existe y la
 *   función se usa tal cual, sin memorizar.
 */
export function perRequest<Args extends unknown[], Result>(
    fn: (...args: Args) => Result,
): (...args: Args) => Result {
    return typeof cache === "function" ? cache(fn) : fn;
}
