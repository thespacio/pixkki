// modules/animals/errors.ts

/**
 * Error base del módulo de animales
 */
export class AnimalError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AnimalError';
    }
}

/**
 * Error cuando no se encuentra un animal
 */
export class AnimalNotFoundError extends AnimalError {
    constructor(id: number) {
        super(`Animal con ID "${id}" no encontrado`);
        this.name = 'AnimalNotFoundError';
    }
}

/**
 * Error cuando el animal ya fue eliminado
 */
export class AnimalDeletedError extends AnimalError {
    constructor(id: string) {
        super(`El animal con ID "${id}" ya fue eliminado`);
        this.name = 'AnimalDeletedError';
    }
}

/**
 * Error cuando el animal no está activo
 */
export class AnimalInactiveError extends AnimalError {
    constructor(id: number) {
        super(`El animal con ID "${id}" no está activo`);
        this.name = 'AnimalInactiveError';
    }
}

/**
 * Error cuando ya existe un animal con el mismo microchip
 */
export class AnimalAlreadyExistsError extends AnimalError {
    constructor(microchip: string) {
        super(`Ya existe un animal con el microchip "${microchip}"`);
        this.name = 'AnimalAlreadyExistsError';
    }
}

/**
 * Error cuando el animal no pertenece al refugio del usuario
 */
export class AnimalNotBelongsToShelterError extends AnimalError {
    constructor(animalId: number, shelterId: number) {
        super(`El animal "${animalId}" no pertenece al refugio "${shelterId}"`);
        this.name = 'AnimalNotBelongsToShelterError';
    }
}

/**
 * Error cuando se intenta realizar una operación no permitida en el estado actual
 */
export class AnimalInvalidStateError extends AnimalError {
    constructor(animalId: number, estado: string, operacion: string) {
        super(`No se puede realizar "${operacion}" porque el animal "${animalId}" está en estado "${estado}"`);
        this.name = 'AnimalInvalidStateError';
    }
}

/**
 * Error cuando el microchip tiene formato inválido
 */
export class AnimalInvalidMicrochipError extends AnimalError {
    constructor(microchip: string) {
        super(`El microchip "${microchip}" tiene un formato inválido`);
        this.name = 'AnimalInvalidMicrochipError';
    }
}

/**
 * Error cuando se intenta realizar una operación que requiere permisos específicos
 */
export class AnimalPermissionError extends AnimalError {
    constructor(operation: string) {
        super(`No tienes permisos para realizar la operación "${operation}" en animales`);
        this.name = 'AnimalPermissionError';
    }
}