import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { qaAnnotate } from "../../utils/qa";
import {
    DEFAULT_GEMINI_MODEL,
    GeminiClient,
    buildSystemInstruction,
    buildUserPrompt,
    extractJson,
    toPromptAnimal,
    toSuggestions,
} from "@/modules/campaigns/ai/gemini-client";
import { AiServiceError, type AdoptableAnimal } from "@/modules/campaigns/types";

const API_KEY = "AIzaSyClaveSecretaDePrueba123456";

const animal = (idAnimal: number, extra: Partial<AdoptableAnimal> = {}): AdoptableAnimal => ({
    idAnimal,
    shelterId: 7,
    shelterName: "Albergue Centro",
    nombre: `Animal ${idAnimal}`,
    especie: "Perro",
    raza: "Mestizo",
    sexo: "M",
    edadEstimada: 26,
    tamano: "Mediano",
    color: "Café",
    temperamento: "Dócil",
    vacunado: true,
    esterilizado: false,
    desparasitado: true,
    rasgosFisicos: "Orejas caídas",
    ...extra,
});

const animales = [animal(1), animal(2), animal(3)];

const validPayload = {
    sugerencias: [
        {
            titulo: "Conoce a Animal 1",
            contenido: "Animal 1 es un perro dócil que busca una familia con mucho cariño para dar.",
            hashtags: ["#Adopta", "SinHogar"],
            llamadoAccion: "Escríbenos y conócelo",
            idsAnimales: [1],
        },
    ],
};

/** Respuesta exitosa de Gemini con el texto dado dentro de candidates[0].content.parts. */
const geminiOk = (text: string, extra: Record<string, unknown> = {}) =>
    new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] }, finishReason: "STOP" }], ...extra }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });

const geminiError = (status: number, reason?: string, message = "error", apiStatus?: string) =>
    new Response(
        JSON.stringify({
            error: {
                code: status,
                status: apiStatus,
                message,
                details: reason ? [{ "@type": "type.googleapis.com/google.rpc.ErrorInfo", reason }] : [],
            },
        }),
        { status, headers: { "Content-Type": "application/json" } },
    );

const input = (over: Partial<Parameters<GeminiClient["suggest"]>[0]> = {}) => ({
    animals: animales,
    count: 3,
    tone: "cercano" as const,
    shelterName: "Albergue Centro",
    ...over,
});

function makeClient(fetchImpl: ReturnType<typeof vi.fn>, over: Record<string, unknown> = {}) {
    return new GeminiClient({
        apiKey: API_KEY,
        retryDelayMs: 0,
        fetchImpl: fetchImpl as unknown as typeof fetch,
        ...over,
    });
}

beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe("Gemini: la petición", () => {
    it("llama a generateContent con la clave en un encabezado (no en la URL) y pide JSON", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U100",
            categoria: "Seguridad",
            criterio: "La clave viaja solo en el encabezado x-goog-api-key, nunca en la URL (las URL quedan en registros), y se pide respuesta en JSON.",
            prioridad: "Alta",
        });

        const fetchMock = vi.fn().mockResolvedValue(geminiOk(JSON.stringify(validPayload)));
        await makeClient(fetchMock, { model: "gemini-3.8-flash" }).suggest(input());

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, init] = fetchMock.mock.calls[0];

        expect(url).toBe(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
        );
        expect(String(url)).not.toContain(API_KEY);
        expect(init.method).toBe("POST");
        expect(init.headers["x-goog-api-key"]).toBe(API_KEY);

        const body = JSON.parse(init.body);
        expect(body.generationConfig.responseMimeType).toBe("application/json");
        expect(body.systemInstruction.parts[0].text).toContain("exactamente 3 publicaciones");
        expect(body.contents[0].role).toBe("user");
    });

    it("usa el modelo por defecto si no se configura otro", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U101",
            categoria: "Funcional",
            criterio: "Sin GEMINI_MODEL se usa el modelo por defecto; con él, el configurado.",
            prioridad: "Media",
        });

        const fetchMock = vi.fn().mockImplementation(async () => geminiOk(JSON.stringify(validPayload)));
        const result = await makeClient(fetchMock).suggest(input());

        expect(result.model).toBe(DEFAULT_GEMINI_MODEL);
        expect(String(fetchMock.mock.calls[0][0])).toContain(`models/${DEFAULT_GEMINI_MODEL}:generateContent`);
    });

    it("el tono y la cantidad pedidos llegan a las instrucciones", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U102",
            categoria: "Funcional",
            criterio: "Las instrucciones para la IA incluyen la cantidad de publicaciones y el tono elegidos.",
            prioridad: "Baja",
        });

        const divertido = buildSystemInstruction(5, "divertido");
        expect(divertido).toContain("exactamente 5 publicaciones");
        expect(divertido).toMatch(/divertido/);
        expect(buildSystemInstruction(2, "formal")).toMatch(/formal/);
    });
});

describe("Gemini: privacidad de los datos enviados", () => {
    it("solo envía campos permitidos del animal (lista blanca)", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U103",
            categoria: "Seguridad",
            criterio: "A Google solo llegan datos no sensibles del animal: nada de rescatista, contacto, microchip, observaciones, lugar o fecha de rescate.",
            prioridad: "Alta",
            notas: "Si se agregan columnas sensibles a Animal, no viajan a la IA salvo que se añadan a propósito a la lista blanca.",
        });

        // Un objeto con MÁS campos de los que debería (como si alguien pasara un Animal completo).
        const conSensibles = {
            ...animal(1),
            rescatistaNombre: "María López",
            rescatistaContacto: "555-SECRETO-1234",
            microchip: "985112345678901",
            observaciones: "Nota interna: dueño anterior llamó",
            lugarRescate: "Calle Privada 123",
            fechaRescate: "2026-01-15",
            procedencia: "Entrega de vecino",
        } as unknown as AdoptableAnimal;

        const prompt = toPromptAnimal(conSensibles);
        expect(Object.keys(prompt).sort()).toEqual(
            [
                "color", "desparasitado", "edad", "esterilizado", "especie", "id",
                "nombre", "raza", "rasgosFisicos", "sexo", "tamano", "temperamento", "vacunado",
            ].sort(),
        );

        const fetchMock = vi.fn().mockResolvedValue(geminiOk(JSON.stringify(validPayload)));
        await makeClient(fetchMock).suggest(input({ animals: [conSensibles] }));

        const sent = String(fetchMock.mock.calls[0][1].body);
        for (const secreto of ["555-SECRETO-1234", "María López", "985112345678901", "dueño anterior", "Calle Privada", "2026-01-15", "Entrega de vecino"]) {
            expect(sent).not.toContain(secreto);
        }
        // Tampoco los identificadores internos del albergue.
        expect(prompt).not.toHaveProperty("shelterId");
    });

    it("traduce edad y sexo a texto legible y recorta los rasgos largos", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U104",
            categoria: "Funcional",
            criterio: "La IA recibe la edad en años/meses y el sexo en palabras; los rasgos físicos largos se recortan a 200 caracteres.",
            prioridad: "Baja",
        });

        const p = toPromptAnimal(animal(1, { edadEstimada: 26, sexo: "H", rasgosFisicos: "x".repeat(500) }));
        expect(p.edad).toBe("2 años y 2 meses");
        expect(p.sexo).toBe("hembra");
        expect(p.rasgosFisicos).toHaveLength(200);
        expect(toPromptAnimal(animal(1, { edadEstimada: 5, sexo: null })).edad).toBe("5 meses");
        expect(toPromptAnimal(animal(1, { sexo: null })).sexo).toBeNull();
        expect(buildUserPrompt([animal(1)], "Albergue Centro")).toContain("Albergue: Albergue Centro");
    });
});

describe("Gemini: la respuesta", () => {
    it("convierte el JSON en sugerencias limpias", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U105",
            categoria: "Funcional",
            criterio: "La respuesta de la IA se convierte en sugerencias con título, texto, hashtags sin '#', llamado a la acción y animales.",
            prioridad: "Alta",
        });

        const fetchMock = vi.fn().mockResolvedValue(geminiOk(JSON.stringify(validPayload)));
        const result = await makeClient(fetchMock).suggest(input());

        expect(result.suggestions).toEqual([
            {
                title: "Conoce a Animal 1",
                content: "Animal 1 es un perro dócil que busca una familia con mucho cariño para dar.",
                hashtags: ["Adopta", "SinHogar"],
                callToAction: "Escríbenos y conócelo",
                animalIds: [1],
            },
        ]);
    });

    it("acepta el JSON aunque venga dentro de un bloque ```json", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U106",
            categoria: "Funcional",
            criterio: "Si el modelo envuelve el JSON en un bloque de código, igual se lee correctamente.",
            prioridad: "Media",
        });

        expect(extractJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
        expect(extractJson('```\n{"a":2}\n```')).toEqual({ a: 2 });
        expect(extractJson('  {"a":3}  ')).toEqual({ a: 3 });
        expect(() => extractJson("no es json")).toThrow();

        const fetchMock = vi
            .fn()
            .mockResolvedValue(geminiOk("```json\n" + JSON.stringify(validPayload) + "\n```"));
        const result = await makeClient(fetchMock).suggest(input());
        expect(result.suggestions).toHaveLength(1);
    });

    it("ignora las partes de 'pensamiento' del modelo y une el resto del texto", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U107",
            categoria: "Funcional",
            criterio: "Los modelos con razonamiento pueden devolver partes de pensamiento; solo se usa la respuesta final.",
            prioridad: "Media",
        });

        const text = JSON.stringify(validPayload);
        const response = new Response(
            JSON.stringify({
                candidates: [
                    {
                        content: {
                            parts: [
                                { text: "Estoy pensando en el enfoque...", thought: true },
                                { text: text.slice(0, 20) },
                                { text: text.slice(20) },
                            ],
                        },
                        finishReason: "STOP",
                    },
                ],
            }),
            { status: 200 },
        );
        const result = await makeClient(vi.fn().mockResolvedValue(response)).suggest(input());
        expect(result.suggestions[0].title).toBe("Conoce a Animal 1");
    });

    it("descarta animales inventados por la IA y las sugerencias sin animales válidos", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U108",
            categoria: "Seguridad",
            criterio: "Si la IA menciona ids de animales que no existen o que no se le entregaron, se descartan; una sugerencia sin animales válidos no se usa.",
            prioridad: "Alta",
        });

        const raw = {
            sugerencias: [
                { titulo: "Válida", contenido: "Texto válido de la publicación para el animal.", idsAnimales: [2, 999, 2] },
                { titulo: "Inventada", contenido: "Habla de un animal que no existe en los datos.", idsAnimales: [888] },
            ],
        };
        const result = toSuggestions(raw, new Set([1, 2, 3]), 5);

        expect(result).toHaveLength(1);
        expect(result[0].animalIds).toEqual([2]);
    });

    it("recorta textos largos, limpia hashtags y respeta la cantidad pedida", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U109",
            categoria: "Funcional",
            criterio: "Títulos de más de 120 y textos de más de 1500 caracteres se recortan; hashtags repetidos o inválidos se quitan; no se devuelven más sugerencias de las pedidas.",
            prioridad: "Media",
        });

        const raw = {
            sugerencias: [
                {
                    titulo: "T".repeat(300),
                    contenido: "C".repeat(5000),
                    hashtags: ["#Adopta", "adopta", "con espacio raro!", "x", "#Perros", "$$$"],
                    llamadoAccion: "  ",
                    idsAnimales: [1],
                },
                { titulo: "Segunda", contenido: "Segunda publicación con texto suficiente.", idsAnimales: [2] },
                { titulo: "Tercera", contenido: "Tercera publicación con texto suficiente.", idsAnimales: [3] },
            ],
        };
        const result = toSuggestions(raw, new Set([1, 2, 3]), 2);

        expect(result).toHaveLength(2);
        expect(result[0].title).toHaveLength(120);
        expect(result[0].content).toHaveLength(1500);
        expect(result[0].hashtags).toEqual(["Adopta", "Perros"]);
        expect(result[0].callToAction).toBeNull();
    });

    it("omite sugerencias con título o texto demasiado cortos y falla si no queda ninguna", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U110",
            categoria: "Funcional",
            criterio: "Sugerencias vacías o inutilizables no se muestran; si ninguna sirve se informa con un error claro.",
            prioridad: "Media",
        });

        const bad = { sugerencias: [{ titulo: "ab", contenido: "corto", idsAnimales: [1] }] };
        expect(() => toSuggestions(bad, new Set([1]), 3)).toThrow(AiServiceError);
        expect(() => toSuggestions({ otra: "cosa" }, new Set([1]), 3)).toThrow(/formato inesperado/);
        expect(() => toSuggestions({ sugerencias: [] }, new Set([1]), 3)).toThrow(AiServiceError);
    });
});

describe("Gemini: errores", () => {
    it("sin clave configurada avisa cómo resolverlo y no llama a la red", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U111",
            categoria: "Funcional",
            criterio: "Sin GEMINI_API_KEY se explica qué hacer y no se hace ninguna llamada a Google.",
            prioridad: "Alta",
        });

        const fetchMock = vi.fn();
        const client = new GeminiClient({ apiKey: "   ", fetchImpl: fetchMock as unknown as typeof fetch });

        await expect(client.suggest(input())).rejects.toMatchObject({ kind: "not_configured" });
        await expect(client.suggest(input())).rejects.toThrow(/GEMINI_API_KEY/);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("clave inválida: mensaje claro y sin reintentos", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U112",
            categoria: "Funcional",
            criterio: "Una clave rechazada por Google se indica como tal y no se reintenta.",
            prioridad: "Alta",
        });

        const fetchMock = vi
            .fn()
            .mockResolvedValue(geminiError(400, "API_KEY_INVALID", "API key not valid. Please pass a valid API key."));

        await expect(makeClient(fetchMock).suggest(input())).rejects.toMatchObject({ kind: "invalid_key" });
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("cuota agotada, modelo inexistente y acceso denegado se explican y no se reintentan", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U113",
            categoria: "Funcional",
            criterio: "429 → límite de uso; 404 → el modelo no está disponible y se nombra la variable a cambiar; 403 → permiso de la clave.",
            prioridad: "Alta",
        });

        const quota = vi.fn().mockResolvedValue(geminiError(429, undefined, "quota", "RESOURCE_EXHAUSTED"));
        await expect(makeClient(quota).suggest(input())).rejects.toMatchObject({ kind: "quota" });
        expect(quota).toHaveBeenCalledTimes(1);

        const missing = vi.fn().mockResolvedValue(geminiError(404, undefined, "model not found"));
        const notFound = makeClient(missing, { model: "gemini-9-inventado" }).suggest(input());
        await expect(notFound).rejects.toMatchObject({ kind: "model_unavailable" });
        await expect(makeClient(missing, { model: "gemini-9-inventado" }).suggest(input())).rejects.toThrow(
            /gemini-9-inventado.*GEMINI_MODEL/,
        );
        expect(missing).toHaveBeenCalledTimes(2);

        const denied = vi.fn().mockResolvedValue(geminiError(403, undefined, "permission denied"));
        await expect(makeClient(denied).suggest(input())).rejects.toMatchObject({ kind: "invalid_key" });
        expect(denied).toHaveBeenCalledTimes(1);
    });

    it("otro rechazo 4xx no se reintenta", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U114",
            categoria: "Funcional",
            criterio: "Un rechazo genérico de la API (solicitud inválida) no se repite porque saldría igual.",
            prioridad: "Baja",
        });

        const fetchMock = vi.fn().mockResolvedValue(geminiError(400, "INVALID_ARGUMENT", "bad request"));
        await expect(makeClient(fetchMock).suggest(input())).rejects.toMatchObject({ kind: "rejected" });
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("un error 503 se reintenta una vez y se recupera si la segunda sale bien", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U115",
            categoria: "Funcional",
            criterio: "Fallos temporales de Gemini (5xx) se reintentan una vez antes de rendirse.",
            prioridad: "Alta",
        });

        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(geminiError(503, undefined, "overloaded"))
            .mockResolvedValueOnce(geminiOk(JSON.stringify(validPayload)));

        const result = await makeClient(fetchMock).suggest(input());
        expect(result.suggestions).toHaveLength(1);
        expect(fetchMock).toHaveBeenCalledTimes(2);

        const siempreCaido = vi.fn().mockResolvedValue(geminiError(500, undefined, "boom"));
        await expect(makeClient(siempreCaido).suggest(input())).rejects.toMatchObject({ kind: "unavailable" });
        expect(siempreCaido).toHaveBeenCalledTimes(2);
    });

    it("si el texto no es JSON válido reintenta una vez; si sigue mal, informa", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U116",
            categoria: "Funcional",
            criterio: "Una respuesta que no se puede leer se reintenta una vez y, si persiste, se informa sin romper la pantalla.",
            prioridad: "Media",
        });

        const recupera = vi
            .fn()
            .mockResolvedValueOnce(geminiOk("Claro, aquí tienes tus publicaciones: ..."))
            .mockResolvedValueOnce(geminiOk(JSON.stringify(validPayload)));
        expect((await makeClient(recupera).suggest(input())).suggestions).toHaveLength(1);
        expect(recupera).toHaveBeenCalledTimes(2);

        const siempreMal = vi.fn().mockImplementation(async () => geminiOk("texto suelto, no JSON"));
        await expect(makeClient(siempreMal).suggest(input())).rejects.toMatchObject({ kind: "bad_response" });
        expect(siempreMal).toHaveBeenCalledTimes(2);
    });

    it("errores de red y tiempos de espera se traducen a mensajes claros", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U117",
            categoria: "Funcional",
            criterio: "Si no hay conexión o Gemini tarda demasiado, el usuario recibe un mensaje comprensible (tras un reintento).",
            prioridad: "Media",
        });

        const sinRed = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
        await expect(makeClient(sinRed).suggest(input())).rejects.toThrow(/No se pudo conectar con Gemini/);
        expect(sinRed).toHaveBeenCalledTimes(2);

        const abort = Object.assign(new Error("aborted"), { name: "AbortError" });
        const lento = vi.fn().mockRejectedValue(abort);
        await expect(makeClient(lento).suggest(input())).rejects.toThrow(/tardó demasiado/);
    });

    it("las respuestas bloqueadas por seguridad no se reintentan", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U118",
            categoria: "Funcional",
            criterio: "Si Gemini bloquea la solicitud o el texto por sus filtros de seguridad, se informa y no se reintenta.",
            prioridad: "Media",
        });

        const bloqueoPrompt = vi.fn().mockResolvedValue(
            new Response(JSON.stringify({ promptFeedback: { blockReason: "SAFETY" } }), { status: 200 }),
        );
        await expect(makeClient(bloqueoPrompt).suggest(input())).rejects.toMatchObject({ kind: "blocked" });
        expect(bloqueoPrompt).toHaveBeenCalledTimes(1);

        const bloqueoTexto = vi.fn().mockResolvedValue(
            new Response(JSON.stringify({ candidates: [{ finishReason: "SAFETY" }] }), { status: 200 }),
        );
        await expect(makeClient(bloqueoTexto).suggest(input())).rejects.toMatchObject({ kind: "blocked" });
        expect(bloqueoTexto).toHaveBeenCalledTimes(1);
    });

    it("una respuesta cortada por límite de tokens se reintenta", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U119",
            categoria: "Funcional",
            criterio: "Si la respuesta se corta (MAX_TOKENS) y llega vacía, se reintenta una vez.",
            prioridad: "Baja",
        });

        const cortada = new Response(
            JSON.stringify({ candidates: [{ content: { parts: [] }, finishReason: "MAX_TOKENS" }] }),
            { status: 200 },
        );
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(cortada)
            .mockResolvedValueOnce(geminiOk(JSON.stringify(validPayload)));
        const result = await makeClient(fetchMock).suggest(input());
        expect(result.suggestions).toHaveLength(1);
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("nunca escribe la clave en los registros", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U120",
            categoria: "Seguridad",
            criterio: "Ni los errores ni los mensajes al usuario contienen la clave de la API.",
            prioridad: "Alta",
        });

        const fetchMock = vi
            .fn()
            .mockResolvedValue(geminiError(400, "API_KEY_INVALID", `API key not valid: ${API_KEY}`));

        const error = await makeClient(fetchMock).suggest(input()).catch((e: Error) => e);

        expect((error as Error).message).not.toContain(API_KEY);
        const logged = JSON.stringify(vi.mocked(console.error).mock.calls);
        expect(logged).not.toContain(API_KEY);
    });
});
