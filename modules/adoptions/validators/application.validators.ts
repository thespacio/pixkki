import { z } from "zod";

const optionalTrimmed = (max: number) =>
    z
        .string()
        .trim()
        .max(max)
        .optional()
        .nullable()
        .transform((v) => (v === null || v === "" ? null : v));

export const CreateSolicitudPublicaBodySchema = z.object({
    nombre_completo: z.string().trim().min(2).max(150),
    telefono: z.string().trim().min(7).max(20),
    correo: z.string().trim().email().max(150),
    direccion: z.string().trim().min(5).max(255),
    tiene_otras_mascotas: z.boolean(),
    tiene_ninos: z.boolean(),
    espacio_techado: z.boolean(),
    tiempo_solo_horas: z.number().int().min(0).max(24).optional().nullable(),
    experiencia_mascotas: optionalTrimmed(1000),
    motivo_adopcion: z.string().trim().min(20).max(1000),
    comentarios_generales: optionalTrimmed(2000),
    acepta_politica_privacidad: z.boolean(),
    declara_mayor_edad: z.boolean(),
    sitio_web: z.string().optional().default(""),
});

export type CreateSolicitudPublicaBody = z.infer<typeof CreateSolicitudPublicaBodySchema>;

export const ListSolicitudesQuerySchema = z.object({
    estado: z.string().optional(),
    id_animal: z.coerce.number().int().positive().optional(),
    q: z.string().trim().min(1).optional(),
    desde: z.string().optional(),
    hasta: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export type ListSolicitudesQuery = z.infer<typeof ListSolicitudesQuerySchema>;