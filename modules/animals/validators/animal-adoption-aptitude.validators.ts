import { z } from "zod";

// RF4.2 — validación de aptitud y gatekeeper de publicación (US16).

/**
 * Cuerpo de `PUT /animales/{id}/disponibilidad-adopcion`.
 *
 * La longitud mínima del motivo se valida en el RPC para devolver el código
 * de dominio `MOTIVO_EXCEPCION_REQUERIDO` (no un `VALIDATION_ERROR` genérico).
 */
export const UpdateDisponibilidadAdopcionBodySchema = z.object({
    disponible_adopcion: z.boolean(),
    autorizar_excepcion: z.boolean().optional().default(false),
    motivo_excepcion: z.string().trim().max(1000).optional().nullable(),
});

export type UpdateDisponibilidadAdopcionBody = z.infer<
    typeof UpdateDisponibilidadAdopcionBodySchema
>;
