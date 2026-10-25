// ---------------------------------------------------------------------------
// Dominio de campañas de adopción
// ---------------------------------------------------------------------------

export const CAMPAIGN_STATUSES = ["borrador", "publicada", "archivada"] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const CAMPAIGN_TONES = ["cercano", "emotivo", "divertido", "formal"] as const;
export type CampaignTone = (typeof CAMPAIGN_TONES)[number];

export const CAMPAIGN_TONE_LABELS: Record<CampaignTone, string> = {
    cercano: "Cercano y cálido",
    emotivo: "Emotivo",
    divertido: "Divertido",
    formal: "Formal",
};

export const CAMPAIGN_LIMITS = {
    title: { min: 3, max: 120 },
    content: { min: 10, max: 1500 },
    callToAction: { max: 200 },
    hashtags: { max: 8, tagMax: 30 },
    animals: { min: 1, max: 10 },
    suggestions: { min: 1, max: 5 },
} as const;

/** Animal de una campaña, con solo los datos que pueden mostrarse. */
export type CampaignAnimal = {
    idAnimal: number;
    nombre: string | null;
    especie: string;
    raza: string | null;
    sexo: string | null;
    edadEstimada: number | null;
};

export type Campaign = {
    id: number;
    shelterId: number;
    shelterName: string | null;
    title: string;
    content: string;
    hashtags: string[];
    callToAction: string | null;
    status: CampaignStatus;
    generatedByAi: boolean;
    aiModel: string | null;
    createdAt: string;
    updatedAt: string;
    publishedAt: string | null;
    animals: CampaignAnimal[];
};

/** Lo que ve cualquier visitante de la landing (vista `campana_publica`). */
export type PublicCampaign = {
    id: number;
    title: string;
    content: string;
    hashtags: string[];
    callToAction: string | null;
    publishedAt: string | null;
    shelterName: string;
    shelterCity: string;
    shelterState: string;
    animals: CampaignAnimal[];
};

/**
 * Animal disponible para adopción, tal como lo ve la campaña. Incluye lo que se
 * le envía a la IA y NADA más: sin datos de rescatista, microchip, observaciones
 * internas ni lugar o fecha de rescate.
 */
export type AdoptableAnimal = {
    idAnimal: number;
    /** Albergue al que pertenece (sirve para el selector del panel; NO se envía a la IA). */
    shelterId: number;
    shelterName: string | null;
    nombre: string | null;
    especie: string;
    raza: string | null;
    sexo: string | null;
    edadEstimada: number | null;
    tamano: string | null;
    color: string | null;
    temperamento: string | null;
    vacunado: boolean;
    esterilizado: boolean;
    desparasitado: boolean;
    rasgosFisicos: string | null;
};

/** Publicación propuesta por la IA, todavía sin guardar. */
export type CampaignSuggestion = {
    title: string;
    content: string;
    hashtags: string[];
    callToAction: string | null;
    animalIds: number[];
};

export type SuggestionBatch = {
    suggestions: CampaignSuggestion[];
    model: string;
    shelterId: number;
    shelterName: string | null;
};

// ---------------------------------------------------------------------------
// Errores de dominio: sus mensajes están pensados para mostrarse al usuario.
// ---------------------------------------------------------------------------

export class CampaignForbiddenError extends Error {
    constructor(action: string) {
        super(`No tienes permiso para ${action}`);
        this.name = "CampaignForbiddenError";
    }
}

export class CampaignNotFoundError extends Error {
    constructor() {
        super("La campaña no existe o no tienes acceso a ella");
        this.name = "CampaignNotFoundError";
    }
}

export class NoAdoptableAnimalsError extends Error {
    constructor() {
        super(
            "No hay animales disponibles para adopción en este albergue. " +
            "Marca al menos uno como \"disponible para adopción\" desde la sección Animales.",
        );
        this.name = "NoAdoptableAnimalsError";
    }
}

export class CampaignAnimalsError extends Error {
    constructor(message = "Solo se pueden usar animales de este albergue que estén disponibles para adopción") {
        super(message);
        this.name = "CampaignAnimalsError";
    }
}

export class CampaignPublishError extends Error {
    constructor(message = "No se puede publicar: ninguno de sus animales sigue disponible para adopción") {
        super(message);
        this.name = "CampaignPublishError";
    }
}

export class CampaignShelterNotFoundError extends Error {
    constructor() {
        super("El albergue indicado no existe");
        this.name = "CampaignShelterNotFoundError";
    }
}

export class CampaignRateLimitError extends Error {
    constructor(public readonly retryAfterSeconds: number) {
        super(
            `Has pedido muchas sugerencias seguidas. Espera ${Math.max(1, Math.ceil(retryAfterSeconds / 60))} min e intenta de nuevo.`,
        );
        this.name = "CampaignRateLimitError";
    }
}

/** Fallos de la IA que el usuario puede entender y, a veces, resolver. */
export class AiServiceError extends Error {
    constructor(
        message: string,
        public readonly kind:
            | "not_configured"
            | "invalid_key"
            | "quota"
            | "model_unavailable"
            | "blocked"
            | "rejected"
            | "bad_response"
            | "unavailable",
    ) {
        super(message);
        this.name = "AiServiceError";
    }
}
