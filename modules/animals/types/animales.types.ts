export const TAMANOS = ["Pequeño", "Mediano", "Grande"] as const;
export type Tamano = (typeof TAMANOS)[number];

export const SITUACIONES_RESCATE = [
    "Abandonado",
    "Extraviado",
    "Maltratado",
    "Nacido en la calle",
    "Accidentado",
    "Otro",
] as const;
export type SituacionRescate = (typeof SITUACIONES_RESCATE)[number];

export const TEMPERAMENTOS = [
    "Dócil",
    "Sociable",
    "Tímido",
    "Miedoso",
    "Reactivo",
    "Agresivo",
] as const;
export type Temperamento = (typeof TEMPERAMENTOS)[number];

/** Categorías exclusivas del diagnóstico veterinario de ingreso (RF1.3, US07). */
export const ESTADOS_GENERALES_SALUD = [
    "Crítico",
    "Delicado",
    "Estable",
    "Sano",
] as const;
export type EstadoGeneralSalud = (typeof ESTADOS_GENERALES_SALUD)[number];

/** Roles que pueden persistir un diagnóstico de ingreso (RF1.3, US07). */
export const ROLES_DIAGNOSTICO = ["veterinario", "admin"] as const;
export type RolDiagnostico = (typeof ROLES_DIAGNOSTICO)[number];

/** Límites y formatos de la galería del expediente (RF1.2, US06). */
export const MAX_IMAGENES_POR_ANIMAL = 5;
export const MAX_IMAGEN_BYTES = 5 * 1024 * 1024;
export const MIME_TYPES_PERMITIDOS = [
    "image/jpeg",
    "image/png",
    "image/webp",
] as const;
export type MimeTypePermitido = (typeof MIME_TYPES_PERMITIDOS)[number];

/**
 * Normaliza el rol de la base ("Veterinario", "Administrador") y comprueba si
 * puede registrar diagnósticos. Única fuente de verdad para servicio y UI.
 */
export function puedeRegistrarDiagnostico(role: string): boolean {
    const normalizado = role
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    return (ROLES_DIAGNOSTICO as readonly string[]).includes(normalizado);
}

export type Animal = {
    idAnimal: number;
    uuid: string | null;
    idRefugio: number;
    refugioNombre: string | null;
    idEspacio: number;
    espacioNombre: string | null;
    idEstado: number;
    estadoNombre: string | null;
    nombre: string | null;
    especie: string;
    raza: string | null;
    sexo: string | null;
    edadEstimada: number | null;
    peso: number | null;
    procedencia: string;
    rasgosFisicos: string;
    estadoInicial: string;
    fechaIngreso: string;
    activo: boolean;
    disponibleAdopcion: boolean;
    enCuarentena: boolean;
    esterilizado: boolean;
    deletedAt: string | null;

    // Ficha completa / datos de rescate (migración 20261024_animal_datos_rescate.sql)
    color: string | null;
    tamano: string | null;
    microchip: string | null;
    temperamento: string | null;
    vacunado: boolean;
    desparasitado: boolean;
    lugarRescate: string | null;
    fechaRescate: string | null;
    situacionRescate: string | null;
    rescatistaNombre: string | null;
    rescatistaContacto: string | null;
    observaciones: string | null;
};

export class AnimalNotFoundError extends Error {
    readonly code = "ANIMAL_NOT_FOUND";
    readonly statusCode = 404;

    constructor(id: number) {
        super(`Animal ${id} no encontrado`);
        this.name = "AnimalNotFoundError";
    }
}

export class AnimalSpaceMismatchError extends Error {
    constructor() {
        super("El espacio seleccionado no pertenece al refugio");
        this.name = "AnimalSpaceMismatchError";
    }
}

export class AnimalForbiddenError extends Error {
    readonly code = "ANIMAL_FORBIDDEN";
    readonly statusCode = 403;

    constructor(action: string) {
        super(`No tienes permiso para ${action}`);
        this.name = "AnimalForbiddenError";
    }
}

export class AnimalShelterNotFoundError extends Error {
    constructor(id: number) {
        super(`El albergue ${id} no existe`);
        this.name = "AnimalShelterNotFoundError";
    }
}

export class AnimalMicrochipDuplicateError extends Error {
    constructor() {
        super("Ya existe un animal registrado con ese microchip");
        this.name = "AnimalMicrochipDuplicateError";
    }
}

export class AnimalStateNotFoundError extends Error {
    constructor(id: number) {
        super(`Estado ${id} no encontrado`);
        this.name = "AnimalStateNotFoundError";
    }
}

/** Errores de la Épica 1 (ingresos y expedientes). Llevan código y status HTTP. */
export class AnimalImageLimitError extends Error {
    readonly code = "LIMITE_IMAGENES_EXCEDIDO";
    readonly statusCode = 400;

    constructor() {
        super("El expediente admite como máximo 5 imágenes.");
        this.name = "AnimalImageLimitError";
    }
}

export class AnimalImageRequiredError extends Error {
    readonly code = "ARCHIVO_REQUERIDO";
    readonly statusCode = 400;

    constructor() {
        super("Debes seleccionar al menos una imagen.");
        this.name = "AnimalImageRequiredError";
    }
}

export class AnimalImageTypeError extends Error {
    readonly code = "ARCHIVO_NO_PERMITIDO";
    readonly statusCode = 400;

    constructor() {
        super("Solo se permiten imágenes JPG, PNG o WEBP válidas.");
        this.name = "AnimalImageTypeError";
    }
}

export class AnimalImageSizeError extends Error {
    readonly code = "TAMANO_EXCEDIDO";
    readonly statusCode = 400;

    constructor() {
        super("Cada imagen debe pesar como máximo 5 MB.");
        this.name = "AnimalImageSizeError";
    }
}

export class AnimalImageNotFoundError extends Error {
    readonly code = "IMAGEN_NO_ENCONTRADA";
    readonly statusCode = 404;

    constructor() {
        super("La imagen no existe en este expediente.");
        this.name = "AnimalImageNotFoundError";
    }
}

export class AnimalDiagnosisForbiddenError extends Error {
    readonly code = "DIAGNOSTICO_FORBIDDEN";
    readonly statusCode = 403;

    constructor() {
        super("Solo un veterinario o un administrador puede registrar el diagnóstico.");
        this.name = "AnimalDiagnosisForbiddenError";
    }
}