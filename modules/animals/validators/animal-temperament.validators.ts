import { z } from "zod";
import { fechaHoraNoFuturaSchema } from "./animal.validators";

// RF3.3 — evaluación de temperamento y compatibilidad (US13).
export const COMPORTAMIENTOS = [
    "Dócil",
    "Sociable",
    "Tímido",
    "Miedoso",
    "Reactivo",
    "Agresivo",
] as const;
export const NIVELES_ENERGIA = ["Baja", "Media", "Alta"] as const;
export const APTITUDES = ["si", "no", "con_supervision"] as const;

export type Comportamiento = (typeof COMPORTAMIENTOS)[number];
export type NivelEnergia = (typeof NIVELES_ENERGIA)[number];
export type Aptitud = (typeof APTITUDES)[number];

export const CreateEvaluacionTemperamentoSchema = z.object({
    comportamiento: z.enum(COMPORTAMIENTOS, { error: "Comportamiento inválido" }),
    nivel_energia: z.enum(NIVELES_ENERGIA, { error: "Nivel de energía inválido" }),
    apto_perros: z.enum(APTITUDES, { error: "Aptitud con perros inválida" }),
    apto_gatos: z.enum(APTITUDES, { error: "Aptitud con gatos inválida" }),
    apto_ninos: z.enum(APTITUDES, { error: "Aptitud con niños inválida" }),
    fecha_evaluacion: fechaHoraNoFuturaSchema.optional().nullable(),
});

export type CreateEvaluacionTemperamentoInput = z.infer<
    typeof CreateEvaluacionTemperamentoSchema
>;
