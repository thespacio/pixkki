import { z } from "zod";

// RF4.1 — registro del procedimiento quirúrgico reproductivo (US15).

/** Tipos canónicos alineados con `chk_cirugia_tipo`. */
export const TIPOS_CIRUGIA = ["Esterilización", "Castración"] as const;
export type TipoCirugia = (typeof TIPOS_CIRUGIA)[number];

/**
 * Normaliza variantes sin tilde o con mayúsculas al valor canónico que exige
 * la base. El RPC vuelve a validar el dominio.
 */
export const TipoCirugiaSchema = z
    .string()
    .trim()
    .transform((value) =>
        value
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase(),
    )
    .refine(
        (value) => value === "esterilizacion" || value === "castracion",
        "El tipo de cirugía debe ser Esterilización o Castración",
    )
    .transform((value) => (value === "esterilizacion" ? "Esterilización" : "Castración"));

/** Fecha/hora obligatoria y no futura. Se normaliza a `Date`. */
export const FechaCirugiaSchema = z
    .union([z.string(), z.date()])
    .transform((value) => {
        const date = value instanceof Date ? value : new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    })
    .refine((value) => value !== null, "Fecha de cirugía inválida")
    .refine(
        (value) => value === null || value.getTime() <= Date.now(),
        "La fecha de la cirugía no puede ser futura",
    );

export const CirugiaInsumoSchema = z.object({
    id_lote_inventario: z
        .number()
        .int()
        .positive("Selecciona un lote válido"),
    cantidad: z
        .number()
        .int()
        .min(1, "La cantidad debe ser un entero mayor o igual a 1"),
});

export const CreateCirugiaBodySchema = z
    .object({
        tipo_cirugia: TipoCirugiaSchema,
        fecha_cirugia: FechaCirugiaSchema,
        exitosa: z.boolean(),
        notas_postoperatorias: z.string().trim().max(2000).optional().nullable(),
        insumos: z.array(CirugiaInsumoSchema).max(50).default([]),
    })
    .superRefine((data, ctx) => {
        const ids = data.insumos.map((insumo) => insumo.id_lote_inventario);
        if (new Set(ids).size !== ids.length) {
            ctx.addIssue({
                code: "custom",
                path: ["insumos"],
                message: "Un mismo lote no puede repetirse en la misma cirugía.",
            });
        }
    });

export type CreateCirugiaBody = z.infer<typeof CreateCirugiaBodySchema>;
