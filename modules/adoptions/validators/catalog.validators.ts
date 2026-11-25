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

const optionalText = z.string().trim().nullable().optional();
const optionalFlag = z.boolean().nullable().optional();

/** Salida segura de la vista `animal_adopcion_publica` (catálogo y detalle). */
export const PublicCompatibilidadSchema = z.object({
    comportamiento: optionalText,
    nivel_energia: optionalText,
    apto_perros: optionalText,
    apto_gatos: optionalText,
    apto_ninos: optionalText,
}).nullable().optional();

export const PublicRefugioSchema = z.object({
    slug: optionalText,
    nombre: optionalText,
    ciudad: optionalText,
    estado: optionalText,
    correo_contacto: optionalText,
    telefono: optionalText,
}).nullable().optional();

export const PublicFotoSchema = z.object({
    id_fotografia: z.coerce.number().int().nullable().optional(),
    url_archivo: z.string().nullable().optional(),
    url_thumbnail: z.string().nullable().optional(),
    es_principal: z.boolean().nullable().optional(),
    orden: z.coerce.number().int().nullable().optional(),
});

const publicAnimalBaseSchema = z.object({
    id_animal: z.number().int().positive(),
    nombre: z.string().trim().min(1),
    especie: optionalText,
    raza: optionalText,
    sexo: optionalText,
    edad_estimada: z.number().int().min(0).nullable().optional(),
    tamano: optionalText,
    color: optionalText,
    temperamento: optionalText,
    vacunado: optionalFlag,
    desparasitado: optionalFlag,
    esterilizado: optionalFlag,
    compatibilidad: PublicCompatibilidadSchema,
    foto_principal: z.string().nullable().optional(),
    refugio: PublicRefugioSchema,
    fecha_publicacion: z.string().nullable().optional(),
});

export const PublicCatalogItemSchema = publicAnimalBaseSchema;

export const PublicCatalogResponseSchema = z.object({
    items: z.array(PublicCatalogItemSchema),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1).max(50),
    total: z.number().int().min(0),
});

export const PublicAnimalDetailSchema = publicAnimalBaseSchema.extend({
    rasgos_fisicos: optionalText,
    descripcion_publica: optionalText,
    fotos: z.array(PublicFotoSchema).nullable().optional(),
});

export type PublicCompatibilidad = z.infer<typeof PublicCompatibilidadSchema>;
export type PublicRefugioPublico = z.infer<typeof PublicRefugioSchema>;
export type PublicCatalogItem = z.infer<typeof PublicCatalogItemSchema>;
export type PublicCatalogResponse = z.infer<typeof PublicCatalogResponseSchema>;
export type PublicAnimalDetail = z.infer<typeof PublicAnimalDetailSchema>;