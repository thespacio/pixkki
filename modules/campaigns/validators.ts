import { z } from "zod";
import {
    CAMPAIGN_LIMITS,
    CAMPAIGN_STATUSES,
    CAMPAIGN_TONES,
} from "@/modules/campaigns/types";

const L = CAMPAIGN_LIMITS;

// ---------------------------------------------------------------------------
// Hashtags
// ---------------------------------------------------------------------------

const HASHTAG_REGEX = /^[\p{L}\p{N}_]+$/u;

/** "#Adopta Hoy" → "AdoptaHoy". Devuelve null si no queda un hashtag válido. */
export function normalizeHashtag(raw: string): string | null {
    const tag = raw.trim().replace(/^#+/, "").replace(/\s+/g, "");
    if (tag.length < 2 || tag.length > L.hashtags.tagMax) return null;
    return HASHTAG_REGEX.test(tag) ? tag : null;
}

/** Normaliza, descarta los inválidos, quita repetidos (sin importar mayúsculas) y limita la cantidad. */
export function normalizeHashtags(list: readonly string[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const raw of list) {
        const tag = normalizeHashtag(raw);
        if (!tag) continue;
        const key = tag.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        result.push(tag);
        if (result.length === L.hashtags.max) break;
    }
    return result;
}

// ---------------------------------------------------------------------------
// Campos de una campaña
// ---------------------------------------------------------------------------
//
// OJO: este schema NO lleva `.default()`. La actualización lo vuelve `partial()` y en
// Zod 4 un default dentro de partial() se aplica aunque el campo no venga, lo que
// pisaría datos existentes en cada edición (ya pasó con los animales).

const hashtagsField = z
    .array(z.string())
    .max(30)
    .transform((list) => normalizeHashtags(list));

const callToActionField = z
    .string()
    .trim()
    .max(L.callToAction.max, `Máximo ${L.callToAction.max} caracteres`)
    .transform((v) => (v === "" ? null : v))
    .nullable();

const animalIdsField = z
    .array(z.number().int().positive())
    .min(L.animals.min, "Elige al menos un animal")
    .max(L.animals.max, `Máximo ${L.animals.max} animales por campaña`)
    .refine((ids) => new Set(ids).size === ids.length, "Hay animales repetidos");

const CampaignFieldsSchema = z.object({
    title: z
        .string()
        .trim()
        .min(L.title.min, `Mínimo ${L.title.min} caracteres`)
        .max(L.title.max, `Máximo ${L.title.max} caracteres`),
    content: z
        .string()
        .trim()
        .min(L.content.min, `Mínimo ${L.content.min} caracteres`)
        .max(L.content.max, `Máximo ${L.content.max} caracteres`),
    hashtags: hashtagsField,
    callToAction: callToActionField,
    animalIds: animalIdsField,
});

export const CreateCampaignSchema = CampaignFieldsSchema.partial({
    hashtags: true,
    callToAction: true,
}).extend({
    /** Solo lo respeta el servicio si el usuario es superadmin. */
    idRefugio: z.number().int().positive().optional(),
    generatedByAi: z.boolean().optional(),
    aiModel: z.string().trim().max(60).optional(),
});

export type CreateCampaignInput = z.infer<typeof CreateCampaignSchema>;

// Al editar solo se cambian los textos. Los animales de una campaña no se modifican
// (si hay que cambiarlos, se archiva y se crea otra): así la publicación siempre
// habla de los mismos animales que se revisaron al aprobarla.
export const UpdateCampaignSchema = CampaignFieldsSchema.omit({ animalIds: true })
    .partial()
    .extend({
        id: z.number().int().positive(),
    });

export type UpdateCampaignInput = z.infer<typeof UpdateCampaignSchema>;

export const CampaignStatusChangeSchema = z.object({
    id: z.number().int().positive(),
    status: z.enum(CAMPAIGN_STATUSES),
});

export type CampaignStatusChangeInput = z.infer<typeof CampaignStatusChangeSchema>;

// ---------------------------------------------------------------------------
// Petición de sugerencias a la IA
// ---------------------------------------------------------------------------

export const GenerateSuggestionsSchema = z.object({
    count: z
        .number()
        .int()
        .min(L.suggestions.min)
        .max(L.suggestions.max)
        .default(3),
    tone: z.enum(CAMPAIGN_TONES).default("cercano"),
    /** Solo lo respeta el servicio si el usuario es superadmin. */
    idRefugio: z.number().int().positive().optional(),
    /** Si se indica, la IA solo trabaja con estos animales (deben estar en adopción). */
    animalIds: z.array(z.number().int().positive()).max(30).optional(),
});

export type GenerateSuggestionsInput = z.infer<typeof GenerateSuggestionsSchema>;

// ---------------------------------------------------------------------------
// Respuesta cruda de la IA
//
// El modelo devuelve JSON, pero es texto generado: se valida igual que cualquier
// dato externo antes de usarlo. Es permisivo en lo cosmético (hashtags con '#',
// campos opcionales ausentes) y estricto en lo que importa (ids, tipos).
// ---------------------------------------------------------------------------

export const AiSuggestionSchema = z.object({
    titulo: z.string(),
    contenido: z.string(),
    hashtags: z.array(z.string()).optional(),
    llamadoAccion: z.string().nullable().optional(),
    idsAnimales: z.array(z.number().int()),
});

export const AiResponseSchema = z.object({
    sugerencias: z.array(AiSuggestionSchema).min(1),
});

export type AiResponse = z.infer<typeof AiResponseSchema>;
