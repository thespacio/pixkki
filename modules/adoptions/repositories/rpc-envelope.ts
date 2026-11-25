import type { Json } from "@/types/database";
import { ErrorInternoAdopcionesError } from "../errors";

/**
 * Sobre de respuesta uniformly devuelto por las RPC de adopciones.
 * Única fuente de verdad para los repositorios del módulo (antes duplicado).
 */
export type RpcEnvelope = {
    ok: boolean;
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
    data?: Record<string, unknown>;
};

/** Convierte el `jsonb` devuelto por Supabase en un sobre tipado y seguro. */
export function parseEnvelope(value: Json | null): RpcEnvelope {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw new ErrorInternoAdopcionesError();
    }
    const envelope = value as Record<string, unknown>;
    return {
        ok: envelope.ok === true,
        code: typeof envelope.code === "string" ? envelope.code : undefined,
        message: typeof envelope.message === "string" ? envelope.message : undefined,
        details:
            typeof envelope.details === "object" && envelope.details !== null && !Array.isArray(envelope.details)
                ? (envelope.details as Record<string, unknown>)
                : undefined,
        data:
            typeof envelope.data === "object" && envelope.data !== null && !Array.isArray(envelope.data)
                ? (envelope.data as Record<string, unknown>)
                : undefined,
    };
}
