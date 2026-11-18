import { z } from "zod";
import { isoDateNotFuture } from "./animal.validators";

// RF3.4 — bitácora de rehabilitación (US14).
export const TIPOS_REHABILITACION = ["fisica", "emocional", "conductual"] as const;
export type TipoRehabilitacion = (typeof TIPOS_REHABILITACION)[number];

export const CreateRehabilitacionSchema = z
    .object({
        tipo: z.enum(TIPOS_REHABILITACION, { error: "Tipo de rehabilitación inválido" }),
        fecha_inicio: isoDateNotFuture,
        fecha_fin: isoDateNotFuture.optional().nullable(),
        objetivo: z
            .string()
            .trim()
            .min(1, "El objetivo es obligatorio")
            .max(500),
        observaciones: z.string().trim().max(2000).optional().nullable(),
    })
    .refine((data) => !data.fecha_fin || data.fecha_fin >= data.fecha_inicio, {
        message: "La fecha de fin no puede ser anterior a la de inicio.",
        path: ["fecha_fin"],
    });

export type CreateRehabilitacionInput = z.infer<typeof CreateRehabilitacionSchema>;
