// ---------------------------------------------------------------------------
// Limitador de uso en memoria (ventana fija).
//
// Protege recursos que cuestan dinero o cuota, como las llamadas a la IA. Vive en
// la memoria del proceso: sirve de freno contra clics repetidos o abuso desde una
// misma cuenta, pero NO es un límite global si el servidor corre en varias
// instancias (serverless). Para eso haría falta un almacén compartido (Redis, etc.).
// ---------------------------------------------------------------------------

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_TRACKED_KEYS = 1000;

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

export function rateLimit(
    key: string,
    options: { limit: number; windowMs: number; now?: number },
): RateLimitResult {
    const now = options.now ?? Date.now();

    // Evita que el mapa crezca sin fin: se limpian las ventanas ya vencidas.
    if (buckets.size > MAX_TRACKED_KEYS) {
        for (const [k, b] of buckets) {
            if (b.resetAt <= now) buckets.delete(k);
        }
    }

    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + options.windowMs });
        return { allowed: true, retryAfterSeconds: 0 };
    }

    if (current.count >= options.limit) {
        return { allowed: false, retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000) };
    }

    current.count += 1;
    return { allowed: true, retryAfterSeconds: 0 };
}

/** Solo para pruebas: vacía todos los contadores. */
export function resetRateLimits(): void {
    buckets.clear();
}
