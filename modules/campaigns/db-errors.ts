/**
 * ¿El error es "la tabla o vista no existe"? Pasa cuando todavía no se ejecutó la
 * migración database/migrations/20261025_campanas.sql en Supabase.
 *
 * - PGRST205: PostgREST no encuentra la tabla en su caché de esquema.
 * - 42P01: Postgres "relation does not exist".
 */
export function isMissingTableError(error: unknown): boolean {
    if (typeof error !== "object" || error === null || !("code" in error)) return false;
    const { code } = error as { code?: string };
    return code === "PGRST205" || code === "42P01";
}

export const MISSING_MIGRATION_MESSAGE =
    "La base de datos aún no tiene las tablas de campañas. " +
    "Ejecuta la migración database/migrations/20261025_campanas.sql en Supabase.";
