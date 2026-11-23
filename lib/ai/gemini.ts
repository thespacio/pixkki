// ---------------------------------------------------------------------------
// Transporte compartido de Gemini (Google AI).
//
// SOLO SERVIDOR: usa la clave de la API, que nunca debe llegar al navegador.
// Se importa únicamente desde fábricas y Server Actions.
//
// Esta capa NO conoce el dominio: no tiene prompts de campañas ni de adopciones
// ni esquemas de negocio. Se encarga de la llave, el modelo, la petición HTTP,
// los reintentos y la lectura del JSON que devuelve el modelo. Cada módulo
// construye su propio prompt y valida su propia salida con Zod (ADR-0001).
// ---------------------------------------------------------------------------

export type AiServiceErrorKind =
    | "not_configured"
    | "invalid_key"
    | "quota"
    | "model_unavailable"
    | "blocked"
    | "rejected"
    | "bad_response"
    | "unavailable";

/** Fallos del proveedor de IA que el usuario puede entender y, a veces, resolver. */
export class AiServiceError extends Error {
    constructor(
        message: string,
        public readonly kind: AiServiceErrorKind,
    ) {
        super(message);
        this.name = "AiServiceError";
    }
}

/** Modelo por defecto; se puede cambiar con la variable GEMINI_MODEL sin tocar código. */
export const DEFAULT_GEMINI_MODEL = "gemini-3.6-flash";

const DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com";

export type GeminiConfig = {
    apiKey?: string;
    model?: string;
    baseUrl?: string;
    timeoutMs?: number;
    retryDelayMs?: number;
    fetchImpl?: typeof fetch;
};

/** Textos ya construidos por el módulo que pide la generación. */
export type GeminiJsonRequest = {
    systemInstruction: string;
    userPrompt: string;
    temperature?: number;
    maxOutputTokens?: number;
};

export type GeminiJsonResult = {
    /** JSON leído del texto del modelo, todavía sin validar por el dominio. */
    value: unknown;
    text: string;
    model: string;
};

/** Contrato del transporte: permite sustituir el proveedor o simularlo en pruebas. */
export interface GeminiJsonTransport {
    generateJson(request: GeminiJsonRequest): Promise<GeminiJsonResult>;
}

type GeminiHttpError = {
    error?: {
        code?: number;
        status?: string;
        message?: string;
        details?: Array<{ reason?: string }>;
    };
};

type GeminiResponse = {
    candidates?: Array<{
        content?: { parts?: Array<{ text?: string; thought?: boolean }> };
        finishReason?: string;
    }>;
    promptFeedback?: { blockReason?: string };
};

/** Extrae el JSON aunque el modelo lo envuelva en un bloque ```json … ```. */
export function extractJson(text: string): unknown {
    const trimmed = text.trim();
    const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    return JSON.parse(fenced ? fenced[1] : trimmed);
}

function extractJsonOrFail(text: string): unknown {
    try {
        return extractJson(text);
    } catch {
        throw new AiServiceError("La IA devolvió texto que no es JSON válido.", "bad_response");
    }
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export class GeminiHttpClient implements GeminiJsonTransport {
    private readonly apiKey?: string;
    private readonly model: string;
    private readonly baseUrl: string;
    private readonly timeoutMs: number;
    private readonly retryDelayMs: number;
    private readonly fetchImpl: typeof fetch;

    constructor(config: GeminiConfig = {}) {
        this.apiKey = config.apiKey?.trim() || undefined;
        this.model = config.model?.trim() || DEFAULT_GEMINI_MODEL;
        this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
        this.timeoutMs = config.timeoutMs ?? 30_000;
        this.retryDelayMs = config.retryDelayMs ?? 800;
        this.fetchImpl = config.fetchImpl ?? fetch;
    }

    async generateJson(request: GeminiJsonRequest): Promise<GeminiJsonResult> {
        const apiKey = this.apiKey;
        if (!apiKey) {
            throw new AiServiceError(
                "La IA no está configurada. Agrega GEMINI_API_KEY al archivo .env del servidor y reinícialo.",
                "not_configured",
            );
        }

        const body = {
            systemInstruction: { parts: [{ text: request.systemInstruction }] },
            contents: [{ role: "user", parts: [{ text: request.userPrompt }] }],
            generationConfig: {
                temperature: request.temperature ?? 0.8,
                maxOutputTokens: request.maxOutputTokens ?? 4096,
                responseMimeType: "application/json",
            },
        };

        // Dos intentos: los fallos transitorios (5xx, red, JSON cortado) suelen
        // resolverse al reintentar. Los de configuración o cuota no se reintentan.
        const MAX_ATTEMPTS = 2;
        let lastError: AiServiceError | undefined;

        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                const text = await this.callGemini(body, apiKey);
                return { value: extractJsonOrFail(text), text, model: this.model };
            } catch (error) {
                if (!(error instanceof AiServiceError)) throw error;
                lastError = error;
                const retryable = error.kind === "unavailable" || error.kind === "bad_response";
                if (!retryable || attempt === MAX_ATTEMPTS) break;
                await sleep(this.retryDelayMs);
            }
        }

        throw lastError ?? new AiServiceError("Gemini no está disponible por ahora.", "unavailable");
    }

    private async callGemini(body: unknown, apiKey: string): Promise<string> {
        const url = `${this.baseUrl}/v1beta/models/${encodeURIComponent(this.model)}:generateContent`;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);

        let response: Response;
        try {
            response = await this.fetchImpl(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // La clave va en un encabezado, no en la URL: las URL quedan en registros.
                    "x-goog-api-key": apiKey,
                },
                body: JSON.stringify(body),
                signal: controller.signal,
                cache: "no-store",
            });
        } catch (error) {
            const aborted = error instanceof Error && error.name === "AbortError";
            throw new AiServiceError(
                aborted
                    ? "Gemini tardó demasiado en responder. Intenta de nuevo."
                    : "No se pudo conectar con Gemini. Revisa la conexión del servidor.",
                "unavailable",
            );
        } finally {
            clearTimeout(timer);
        }

        if (!response.ok) {
            throw await this.toHttpError(response);
        }

        let data: GeminiResponse;
        try {
            data = (await response.json()) as GeminiResponse;
        } catch {
            throw new AiServiceError("Gemini devolvió una respuesta ilegible.", "bad_response");
        }

        if (data.promptFeedback?.blockReason) {
            throw new AiServiceError(
                "Gemini bloqueó la solicitud por sus filtros de seguridad. Revisa los datos de los animales.",
                "blocked",
            );
        }

        const candidate = data.candidates?.[0];
        const finish = candidate?.finishReason;
        if (finish === "SAFETY" || finish === "PROHIBITED_CONTENT" || finish === "BLOCKLIST") {
            throw new AiServiceError("Gemini no pudo generar el texto por sus filtros de seguridad.", "blocked");
        }

        // Los modelos con "razonamiento" pueden incluir partes de pensamiento: se ignoran.
        const text = (candidate?.content?.parts ?? [])
            .filter((part): part is { text: string; thought?: boolean } => !part.thought && typeof part.text === "string")
            .map((part) => part.text)
            .join("")
            .trim();

        if (!text) {
            throw new AiServiceError(
                finish === "MAX_TOKENS"
                    ? "La respuesta de la IA se cortó antes de terminar."
                    : "Gemini no devolvió texto.",
                "bad_response",
            );
        }

        return text;
    }

    /** Traduce un error HTTP de Gemini a un mensaje útil (sin exponer la clave ni detalles internos). */
    private async toHttpError(response: Response): Promise<AiServiceError> {
        let info: GeminiHttpError = {};
        try {
            const parsed = (await response.json()) as GeminiHttpError | GeminiHttpError[];
            info = Array.isArray(parsed) ? (parsed[0] ?? {}) : parsed;
        } catch {
            // El cuerpo no era JSON: se decide solo por el código HTTP.
        }

        const status = response.status;
        const reason = info.error?.details?.find((d) => d.reason)?.reason;
        const message = info.error?.message ?? "";

        // Solo código y motivo: nunca el cuerpo completo ni encabezados (llevan la clave).
        console.error("[gemini] Error de la API:", { status, reason, model: this.model });

        if (reason === "API_KEY_INVALID" || /api key not valid/i.test(message)) {
            return new AiServiceError(
                "La clave de Gemini no es válida. Revisa GEMINI_API_KEY en el .env del servidor.",
                "invalid_key",
            );
        }
        if (status === 429 || info.error?.status === "RESOURCE_EXHAUSTED") {
            return new AiServiceError(
                "Se alcanzó el límite de uso de Gemini. Espera unos minutos o revisa la cuota de tu proyecto de Google AI.",
                "quota",
            );
        }
        if (status === 404) {
            return new AiServiceError(
                `El modelo "${this.model}" no está disponible para tu cuenta. Cambia GEMINI_MODEL en el .env (por ejemplo gemini-3.8-flash).`,
                "model_unavailable",
            );
        }
        if (status === 401 || status === 403) {
            return new AiServiceError(
                "Google rechazó el acceso. Verifica que la clave tenga permiso para la API de Gemini y que tu región esté habilitada.",
                "invalid_key",
            );
        }
        if (status >= 500) {
            return new AiServiceError("Gemini no está disponible por ahora. Intenta de nuevo en un momento.", "unavailable");
        }
        // Otros 4xx (parámetro no soportado, solicitud mal formada): reintentar no ayuda.
        return new AiServiceError("Gemini rechazó la solicitud. Intenta de nuevo; si persiste, avisa al administrador.", "rejected");
    }
}
