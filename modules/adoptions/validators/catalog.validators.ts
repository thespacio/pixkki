import { z } from "zod";

export const CatalogQuerySchema = z.object({
    refugio: z.string().trim().optional(),
    especie: z.string().trim().optional(),
    sexo: z.enum(["M", "H"]).optional(),
    tamano: z.string().trim().optional(),
    edadMin: z.coerce.number().int().min(0).optional(),
    edadMax: z.coerce.number().int().min(0).optional(),
    temperamento: z.string().trim().optional(),
    q: z.string().trim().optional(),
    orden: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

export type CatalogQuery = z.infer<typeof CatalogQuerySchema>;