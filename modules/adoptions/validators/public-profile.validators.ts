import { z } from "zod";

export const UpsertPerfilAdopcionBodySchema = z.object({
    descripcion_publica: z
        .string()
        .trim()
        .max(2000, "La descripción pública debe tener entre 50 y 2000 caracteres.")
        .optional()
        .nullable()
        .transform((v) => (v === null || v === "" ? null : v)),
    publicado: z.boolean(),
});

export type UpsertPerfilAdopcionBody = z.infer<typeof UpsertPerfilAdopcionBodySchema>;