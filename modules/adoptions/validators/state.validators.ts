import { z } from "zod";

export const ESTADOS_SOLICITUD = [
    "Recibida",
    "En entrevista",
    "En evaluación",
    "Aprobada",
    "Rechazada",
    "Cancelada",
    "Completada",
] as const;

export const ChangeSolicitudEstadoBodySchema = z.object({
    estado_solicitud: z.enum(ESTADOS_SOLICITUD),
    motivo: z
        .string()
        .trim()
        .max(500)
        .optional()
        .nullable()
        .transform((v) => (v === null || v === "" ? null : v)),
});

export type ChangeSolicitudEstadoBody = z.infer<typeof ChangeSolicitudEstadoBodySchema>;

export const CompletarAdopcionBodySchema = z.object({
    fecha_adopcion: z
        .string()
        .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), "La fecha de adopción es obligatoria."),
    observaciones: z
        .string()
        .trim()
        .max(2000)
        .optional()
        .nullable()
        .transform((v) => (v === null || v === "" ? null : v)),
});

export type CompletarAdopcionBody = z.infer<typeof CompletarAdopcionBodySchema>;