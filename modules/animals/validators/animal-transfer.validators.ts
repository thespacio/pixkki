import { z } from "zod";
import { fechaHoraNoFuturaSchema } from "./animal.validators";

// RF3.2 — cambio de ubicación (US12).
export const TIPOS_ESPACIO = [
    "canil",
    "gatera",
    "cuarentena",
    "rehabilitacion",
    "otro",
] as const;
export type TipoEspacio = (typeof TIPOS_ESPACIO)[number];

/** Normaliza los valores históricos del formulario de espacios al enum canónico. */
export function normalizarTipoEspacio(valor: string): TipoEspacio {
    switch (valor.trim().toLowerCase()) {
        case "canil":
            return "canil";
        case "gatera":
            return "gatera";
        case "cuarentena":
            return "cuarentena";
        case "rehabilitacion":
        case "rehabilitación":
            return "rehabilitacion";
        default:
            return "otro";
    }
}

export const AltaMedicaEnTrasladoSchema = z.object({
    observaciones: z
        .string()
        .trim()
        .min(1, "Las observaciones clínicas son obligatorias")
        .max(2000),
    fecha_alta: fechaHoraNoFuturaSchema.optional().nullable(),
});

export const CreateTrasladoSchema = z.object({
    id_espacio_destino: z
        .number()
        .int()
        .positive("Selecciona un espacio destino válido"),
    motivo: z.string().trim().max(255).optional().nullable(),
    // Solo Veterinario/Admin pueden incluirlo; el service revalida el rol.
    alta_medica: AltaMedicaEnTrasladoSchema.optional().nullable(),
});

export type CreateTrasladoInput = z.infer<typeof CreateTrasladoSchema>;
