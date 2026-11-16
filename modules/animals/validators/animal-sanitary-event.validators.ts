import { z } from "zod";
import { isoDateNotFuture } from "./animal.validators";

// ---------------------------------------------------------------------------
// Requerimiento 02 — eventos sanitarios (RF2.2 / RF2.3, US10).
//
// Un único schema para la entrada HTTP y para el service. La coherencia entre
// fechas y la obligatoriedad del refuerzo son reglas de forma, por eso viven
// aquí y no se repiten en el service ni en el repository.
// ---------------------------------------------------------------------------

export const TIPOS_EVENTO_SANITARIO = ["vacunacion", "desparasitacion"] as const;
export type TipoEventoSanitario = (typeof TIPOS_EVENTO_SANITARIO)[number];

export const CreateEventoSanitarioSchema = z
    .object({
        tipo_evento: z.enum(TIPOS_EVENTO_SANITARIO, {
            error: "Tipo de evento sanitario inválido",
        }),
        tipo_biologico: z
            .string()
            .trim()
            .min(1, "El tipo de biológico o producto es obligatorio")
            .max(120),
        fecha_aplicacion: isoDateNotFuture,
        marca_lote: z.string().trim().max(120).optional().nullable(),
        fecha_refuerzo: isoDateNotFuture.optional().nullable(),
        esquema_completo: z.boolean(),
        id_lote_inventario: z
            .number()
            .int()
            .positive("Selecciona un lote de inventario válido"),
        observaciones: z.string().trim().max(2000).optional().nullable(),
    })
    .superRefine((data, ctx) => {
        if (data.esquema_completo && !data.fecha_refuerzo) {
            ctx.addIssue({
                code: "custom",
                path: ["fecha_refuerzo"],
                message: "Un esquema completo requiere fecha de refuerzo.",
            });
        }

        if (data.fecha_refuerzo && data.fecha_refuerzo <= data.fecha_aplicacion) {
            ctx.addIssue({
                code: "custom",
                path: ["fecha_refuerzo"],
                message: "La fecha de refuerzo debe ser posterior a la de aplicación.",
            });
        }
    });

export type CreateEventoSanitarioInput = z.infer<typeof CreateEventoSanitarioSchema>;
