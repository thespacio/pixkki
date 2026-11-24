import { z } from "zod";

/** Fecha calendaria válida en formato ISO (YYYY-MM-DD). */
const fechaSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "La fecha debe tener el formato YYYY-MM-DD.",
});

function esFechaReal(valor: string): boolean {
    const fecha = new Date(`${valor}T00:00:00.000Z`);
    return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
}

function diasEntre(desde: string, hasta: string): number {
    const inicio = new Date(`${desde}T00:00:00.000Z`).getTime();
    const fin = new Date(`${hasta}T00:00:00.000Z`).getTime();
    return Math.round((fin - inicio) / 86_400_000) + 1;
}

/**
 * Parámetros de `GET /api/v1/reportes/resumen` (RF7.5).
 * Reglas 2 y 6 del requerimiento: periodo válido y rango máximo de 366 días.
 */
export const dashboardSummaryQuerySchema = z
    .object({
        desde: fechaSchema.optional(),
        hasta: fechaSchema.optional(),
    })
    .superRefine((value, ctx) => {
        if (value.desde && !esFechaReal(value.desde)) {
            ctx.addIssue({
                code: "custom",
                path: ["desde"],
                message: "La fecha inicial no es una fecha válida.",
            });
        }
        if (value.hasta && !esFechaReal(value.hasta)) {
            ctx.addIssue({
                code: "custom",
                path: ["hasta"],
                message: "La fecha final no es una fecha válida.",
            });
        }
        if (
            value.desde &&
            value.hasta &&
            esFechaReal(value.desde) &&
            esFechaReal(value.hasta)
        ) {
            if (value.desde > value.hasta) {
                ctx.addIssue({
                    code: "custom",
                    path: ["desde"],
                    message: "La fecha inicial no puede ser posterior a la final.",
                });
            } else if (diasEntre(value.desde, value.hasta) > 366) {
                ctx.addIssue({
                    code: "custom",
                    path: ["hasta"],
                    message: "El rango máximo es de 366 días.",
                });
            }
        }
    });

/** Contrato de la RPC `reporte_resumen`; única fuente de verdad del DTO. */
export const dashboardSummarySchema = z.object({
    periodo: z.object({
        desde: fechaSchema,
        hasta: fechaSchema,
        zona_horaria: z.string().min(1),
    }),
    poblacion_activa: z.number().int().nonnegative(),
    capacidad_total: z.number().int().nonnegative(),
    porcentaje_ocupacion: z.number().min(0).max(100).nullable(),
    adopciones_periodo: z.number().int().nonnegative(),
    donaciones_periodo: z.number().int().nonnegative(),
    stock_bajo: z.number().int().nonnegative(),
    lotes_vencidos: z.number().int().nonnegative(),
    alertas: z.object({
        sobrecupo: z.boolean(),
        cuarentena: z.number().int().nonnegative(),
    }),
    limitaciones: z.array(z.string()),
});
