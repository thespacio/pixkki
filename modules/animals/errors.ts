export class AnimalNotFoundError extends Error {
    readonly code = "ANIMAL_NO_ENCONTRADO";
    readonly statusCode = 404;

    constructor(id: number) {
        super(`Animal ${id} no encontrado`);
        this.name = "AnimalNotFoundError";
    }
}

export class AnimalSpaceMismatchError extends Error {
    readonly code = "ESPACIO_INVALIDO";
    readonly statusCode = 400;

    constructor() {
        super("El espacio seleccionado no pertenece al refugio");
        this.name = "AnimalSpaceMismatchError";
    }
}

export class AnimalStateNotFoundError extends Error {
    readonly code = "ESTADO_INVALIDO";
    readonly statusCode = 400;

    constructor(id: number) {
        super(`Estado ${id} no encontrado`);
        this.name = "AnimalStateNotFoundError";
    }
}

export class AnimalClinicalForbiddenError extends Error {
    readonly code = "ROL_SIN_PERMISO";
    readonly statusCode = 403;

    constructor() {
        super("Solo un veterinario o un administrador puede realizar esta operación clínica.");
        this.name = "AnimalClinicalForbiddenError";
    }
}

export class QuarantineAlreadyReleasedError extends Error {
    readonly code = "CUARENTENA_YA_LIBERADA";
    readonly statusCode = 409;

    constructor() {
        super("La cuarentena del paciente ya fue liberada.");
        this.name = "QuarantineAlreadyReleasedError";
    }
}
