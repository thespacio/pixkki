export type Animal = {
    idAnimal: number;
    uuid: string | null;
    idRefugio: number;
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

export class AnimalStateNotFoundError extends Error {
    constructor(id: number) {
        super(`Estado ${id} no encontrado`);
        this.name = "AnimalStateNotFoundError";
    }
}