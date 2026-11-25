import { z } from "zod";

const descripcionPublica = z
    .string()
    .trim()
    .max(2000, "La descripción pública debe tener entre 50 y 2000 caracteres.")
    .refine(
        (valor) => valor.length === 0 || valor.length >= 50,
        "La descripción pública debe tener entre 50 y 2000 caracteres.",
    );

export const UpsertPerfilAdopcionBodySchema = z.object({
    descripcion_publica: descripcionPublica
        .optional()
        .nullable()
        .transform((v) => (v === null || v === "" ? null : v)),
    publicado: z.boolean(),
});

export type UpsertPerfilAdopcionBody = z.infer<typeof UpsertPerfilAdopcionBodySchema>;

/**
 * Entrada del flujo unificado «habilitar + publicar». Reúne la descripción
 * obligatoria del perfil con los parámetros opcionales del gatekeeper.
 */
export const PublicarAnimalEnAdopcionesSchema = z.object({
    descripcion_publica: descripcionPublica.refine(
        (valor) => valor.length >= 50,
        "La descripción pública debe tener entre 50 y 2000 caracteres.",
    ),
    autorizar_excepcion: z.boolean().optional().default(false),
    motivo_excepcion: z.string().trim().max(1000).nullable().optional(),
});

export type PublicarAnimalEnAdopcionesInput = z.infer<typeof PublicarAnimalEnAdopcionesSchema>;

/* ------------------------------------------------------------------------- *
 * Contrato de la vista interna `/adopciones/perfiles` (composición G-01).
 * Zod es la única fuente de verdad: los DTOs se derivan con `z.infer`.
 * ------------------------------------------------------------------------- */

export const PerfilFotoSchema = z.object({
    id_fotografia: z.number().int(),
    url_archivo: z.string(),
    url_thumbnail: z.string().nullable(),
    es_principal: z.boolean(),
    orden: z.number().int(),
});

/** Proyección del módulo `animals` que necesita esta vista. No duplica su tipo. */
export const AnimalParaPerfilSchema = z.object({
    idAnimal: z.number().int().positive(),
    nombre: z.string().nullable().optional(),
    especie: z.string(),
    raza: z.string().nullable().optional(),
    disponibleAdopcion: z.boolean(),
    enCuarentena: z.boolean(),
    activo: z.boolean(),
    deletedAt: z.string().nullable().optional(),
    reservadoAdopcion: z.boolean().optional(),
});

export const PerfilAdopcionReadSchema = z.object({
    id_perfil_adopcion: z.number().int().nullable(),
    id_animal: z.number().int().positive(),
    id_refugio: z.number().int().nullable(),
    disponible_adopcion: z.boolean(),
    descripcion_publica: z.string().nullable(),
    publicado: z.boolean(),
    fecha_publicacion: z.string().nullable(),
    fecha_despublicacion: z.string().nullable(),
    updated_at: z.string().nullable(),
    puede_publicarse: z.boolean(),
    /** Códigos canónicos de la RPC, alineados con `bloqueos`. */
    codigos: z.array(z.string()),
    bloqueos: z.array(z.string()),
    fotos: z.array(PerfilFotoSchema),
});

export const EstadoPerfilVisibleSchema = z.enum([
    "publicado",
    "borrador",
    "no-publicable",
    "sin-foto",
    "sin-descripcion",
]);

export const FiltroEstadoPerfilSchema = z.union([
    z.literal("todos"),
    EstadoPerfilVisibleSchema,
]);

export const PerfilesQuerySchema = z.object({
    q: z.string().trim().optional().default(""),
    especie: z.union([z.literal(""), z.literal("Perro"), z.literal("Gato")]).optional().default(""),
    estado: FiltroEstadoPerfilSchema.optional().default("todos"),
    animal: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).default(1),
});

export const PerfilFilaSchema = z.object({
    animal: AnimalParaPerfilSchema,
    perfil: PerfilAdopcionReadSchema.nullable(),
    estados: z.array(EstadoPerfilVisibleSchema),
    motivo: z.string().nullable(),
    error: z.string().nullable(),
});

export const PerfilesListSchema = z.object({
    items: z.array(PerfilFilaSchema),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(1),
    fallidos: z.number().int().min(0),
    candidatos: z.number().int().min(0),
    limiteAplicado: z.boolean(),
});

export type PerfilFoto = z.infer<typeof PerfilFotoSchema>;
export type AnimalParaPerfil = z.infer<typeof AnimalParaPerfilSchema>;
export type PerfilAdopcionRead = z.infer<typeof PerfilAdopcionReadSchema>;
export type EstadoPerfilVisible = z.infer<typeof EstadoPerfilVisibleSchema>;
export type FiltroEstadoPerfil = z.infer<typeof FiltroEstadoPerfilSchema>;
export type PerfilesQuery = z.infer<typeof PerfilesQuerySchema>;
export type PerfilFila = z.infer<typeof PerfilFilaSchema>;
export type PerfilesList = z.infer<typeof PerfilesListSchema>;
