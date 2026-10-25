import { describe, it, expect } from "vitest";
import { qaAnnotate } from "../../utils/qa";
import {
    AiResponseSchema,
    CampaignStatusChangeSchema,
    CreateCampaignSchema,
    GenerateSuggestionsSchema,
    UpdateCampaignSchema,
    normalizeHashtag,
    normalizeHashtags,
} from "@/modules/campaigns/validators";
import { animalSummary, formatAge, hashtagsToText, textToHashtags } from "@/modules/campaigns/format";

const base = { title: "Conoce a Luna", content: "Luna es una gata tranquila que busca hogar.", animalIds: [1] };

describe("hashtags", () => {
    it("normaliza: quita '#', espacios y descarta los inválidos", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U150",
            categoria: "Unitaria",
            criterio: "'#Adopta Hoy' queda 'AdoptaHoy'; muy cortos, muy largos o con símbolos se descartan.",
            prioridad: "Media",
        });

        expect(normalizeHashtag("#Adopta Hoy")).toBe("AdoptaHoy");
        expect(normalizeHashtag("##Perros")).toBe("Perros");
        expect(normalizeHashtag("ñandú")).toBe("ñandú");
        expect(normalizeHashtag("a")).toBeNull();
        expect(normalizeHashtag("x".repeat(31))).toBeNull();
        expect(normalizeHashtag("hola!")).toBeNull();
        expect(normalizeHashtag("<script>")).toBeNull();
    });

    it("quita repetidos sin distinguir mayúsculas y limita a 8", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U151",
            categoria: "Unitaria",
            criterio: "Hashtags repetidos (aunque cambien mayúsculas) se unifican y nunca hay más de 8.",
            prioridad: "Baja",
        });

        expect(normalizeHashtags(["Adopta", "#adopta", "ADOPTA", "Perros"])).toEqual(["Adopta", "Perros"]);
        const muchos = Array.from({ length: 20 }, (_, i) => `tag${i}`);
        expect(normalizeHashtags(muchos)).toHaveLength(8);
    });

    it("convierte entre texto del formulario y lista", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U152",
            categoria: "Unitaria",
            criterio: "'#Adopta, sinhogar  #Perros' se separa en tres hashtags y se vuelve a mostrar con '#'.",
            prioridad: "Baja",
        });

        expect(textToHashtags("#Adopta, sinhogar  #Perros")).toEqual(["Adopta", "sinhogar", "Perros"]);
        expect(textToHashtags("   ")).toEqual([]);
        expect(hashtagsToText(["Adopta", "Perros"])).toBe("#Adopta #Perros");
    });
});

describe("validación de campañas", () => {
    it("acepta una campaña válida y limpia sus hashtags", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U153",
            categoria: "Unitaria",
            criterio: "Una campaña con título, texto y al menos un animal es válida; los hashtags se normalizan y el llamado vacío pasa a null.",
            prioridad: "Alta",
        });

        const parsed = CreateCampaignSchema.parse({
            ...base,
            hashtags: ["#Adopta", "adopta", "mal!"],
            callToAction: "   ",
        });

        expect(parsed.hashtags).toEqual(["Adopta"]);
        expect(parsed.callToAction).toBeNull();
        expect(CreateCampaignSchema.safeParse(base).success).toBe(true);
    });

    it("rechaza campos fuera de los límites", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U154",
            categoria: "Unitaria",
            criterio: "Se rechazan título o texto muy cortos/largos, sin animales, con más de 10 animales o con animales repetidos.",
            prioridad: "Alta",
        });

        const rechaza = (over: object) => CreateCampaignSchema.safeParse({ ...base, ...over }).success === false;

        expect(rechaza({ title: "ab" })).toBe(true);
        expect(rechaza({ title: "t".repeat(121) })).toBe(true);
        expect(rechaza({ content: "corto" })).toBe(true);
        expect(rechaza({ content: "c".repeat(1501) })).toBe(true);
        expect(rechaza({ animalIds: [] })).toBe(true);
        expect(rechaza({ animalIds: Array.from({ length: 11 }, (_, i) => i + 1) })).toBe(true);
        expect(rechaza({ animalIds: [1, 1] })).toBe(true);
        expect(rechaza({ animalIds: [0] })).toBe(true);
        expect(rechaza({ callToAction: "x".repeat(201) })).toBe(true);
        expect(rechaza({ idRefugio: -1 })).toBe(true);
    });

    it("la edición parcial no agrega valores por defecto ni permite cambiar animales", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U155",
            categoria: "Unitaria",
            criterio: "Editar solo el título envía solo el título (no pisa hashtags ni llamado), y los animales no se pueden modificar.",
            prioridad: "Alta",
            notas: "Regresión del problema de defaults de Zod 4 en actualizaciones parciales.",
        });

        const parsed = UpdateCampaignSchema.parse({ id: 4, title: "Nuevo título" });
        expect(parsed).toEqual({ id: 4, title: "Nuevo título" });
        expect(Object.keys(parsed).sort()).toEqual(["id", "title"]);

        // animalIds no es parte de la edición: se ignora.
        const conAnimales = UpdateCampaignSchema.parse({ id: 4, animalIds: [9, 9, 9] });
        expect(conAnimales).toEqual({ id: 4 });

        expect(UpdateCampaignSchema.safeParse({ title: "Sin id" }).success).toBe(false);
        expect(UpdateCampaignSchema.safeParse({ id: 4, title: "ab" }).success).toBe(false);
        expect(UpdateCampaignSchema.parse({ id: 4, callToAction: "" })).toEqual({ id: 4, callToAction: null });
    });

    it("valida el cambio de estado y la petición de sugerencias", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U156",
            categoria: "Unitaria",
            criterio: "Solo se aceptan estados válidos; las sugerencias piden de 1 a 5 y el tono es uno de los permitidos (por defecto 3 y cercano).",
            prioridad: "Media",
        });

        expect(CampaignStatusChangeSchema.safeParse({ id: 1, status: "publicada" }).success).toBe(true);
        expect(CampaignStatusChangeSchema.safeParse({ id: 1, status: "eliminada" }).success).toBe(false);

        expect(GenerateSuggestionsSchema.parse({})).toEqual({ count: 3, tone: "cercano" });
        expect(GenerateSuggestionsSchema.safeParse({ count: 0 }).success).toBe(false);
        expect(GenerateSuggestionsSchema.safeParse({ count: 6 }).success).toBe(false);
        expect(GenerateSuggestionsSchema.safeParse({ tone: "agresivo" }).success).toBe(false);
        expect(GenerateSuggestionsSchema.safeParse({ animalIds: Array.from({ length: 31 }, (_, i) => i + 1) }).success).toBe(false);
    });

    it("la respuesta de la IA exige la forma esperada", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U157",
            categoria: "Seguridad",
            criterio: "Lo que devuelve la IA se valida como cualquier dato externo: tipos incorrectos o campos ausentes se rechazan.",
            prioridad: "Alta",
        });

        const ok = { sugerencias: [{ titulo: "T", contenido: "C", idsAnimales: [1] }] };
        expect(AiResponseSchema.safeParse(ok).success).toBe(true);
        expect(AiResponseSchema.safeParse({ sugerencias: [] }).success).toBe(false);
        expect(AiResponseSchema.safeParse({ sugerencias: [{ titulo: "T", contenido: "C" }] }).success).toBe(false);
        expect(AiResponseSchema.safeParse({ sugerencias: [{ titulo: 1, contenido: "C", idsAnimales: [1] }] }).success).toBe(false);
        expect(AiResponseSchema.safeParse({ sugerencias: [{ titulo: "T", contenido: "C", idsAnimales: ["1"] }] }).success).toBe(false);
        expect(AiResponseSchema.safeParse("texto").success).toBe(false);
    });
});

describe("formato de animales", () => {
    it("muestra la edad y el resumen del animal", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U158",
            categoria: "Unitaria",
            criterio: "La edad en meses se muestra como años y meses, y el resumen no repite la especie cuando no hay nombre.",
            prioridad: "Baja",
        });

        expect(formatAge(null)).toBeNull();
        expect(formatAge(1)).toBe("1 mes");
        expect(formatAge(14)).toBe("1 año y 2 meses");
        expect(formatAge(24)).toBe("2 años");

        const luna = { idAnimal: 1, nombre: "Luna", especie: "Gato", raza: null, sexo: "H", edadEstimada: 24 };
        expect(animalSummary(luna)).toBe("Luna · Gato · 2 años");
        expect(animalSummary({ ...luna, nombre: null, edadEstimada: null })).toBe("Gato sin nombre");
    });
});
