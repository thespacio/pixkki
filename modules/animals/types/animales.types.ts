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