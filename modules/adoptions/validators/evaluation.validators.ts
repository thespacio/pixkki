import { z } from "zod";

export const TIPOS_EVALUACION = [
    "entrevista",
    "visita_hogar",
    "compatibilidad",
    "referencias",
    "otro",
] as const;

export const RESULTADOS_EVALUACION = [
    "Pendiente",
    "Aprobado",
    "Rechazado",
    "Con observaciones",
] as const;

export const CreateEvaluacionBodySchema = z.object({
    tipo_evaluacion: z.enum(TIPOS_EVALUACION),
    resultado: z.enum(RESULTADOS_EVALUACION),
    puntuacion: z.number().min(0).max(100).optional().nullable(),
    comentarios: z
        .string()
        .trim()
        .max(2000)
        .optional()
        .nullable()
        .transform((v) => (v === null || v === "" ? null : v)),
    fecha_evaluacion: z
        .union([z.string(), z.date()])
        .optional()
        .transform((v) => {
            if (v === undefined || v === null) return new Date();
            const d = v instanceof Date ? v : new Date(v);
            return Number.isNaN(d.getTime()) ? null : d;
        })
        .refine((v) => v !== null, "Fecha de evaluación inválida")
        .refine((v) => v === null || v.getTime() <= Date.now(), "La fecha de evaluación no puede ser futura"),
});

export type CreateEvaluacionBody = z.infer<typeof CreateEvaluacionBodySchema>;