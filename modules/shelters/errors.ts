// modules/shelters/errors.ts

/**
 * Error base para el módulo de shelters
 * Extiende Error para mantener compatibilidad con el sistema de errores de JavaScript
 */
export class ShelterError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly statusCode: number = 500,
        public readonly details?: unknown
    ) {
        super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

/**
 * Error lanzado cuando no se encuentra un refugio
 */
export class ShelterNotFoundError extends ShelterError {
    constructor(id: number) {
        super(
            `Refugio con ID "${id}" no encontrado`,
            'NOT_FOUND',
            404,
            { id }
        );
        this.name = 'ShelterNotFoundError';
    }
}

/**
 * Error lanzado cuando hay un problema en la capa de repository
 * No contiene lógica de negocio, solo errores de infraestructura
 */
export class ShelterRepositoryError extends ShelterError {
    constructor(
        message: string,
        code: string = 'REPOSITORY_ERROR',
        details?: unknown
    ) {
        super(
            message,
            code,
            500,
            details
        );
        this.name = 'ShelterRepositoryError';
    }
}

/**
 * Error lanzado cuando hay un problema de autorización
 */
export class ShelterAuthorizationError extends ShelterError {
    constructor(
        message: string,
        details?: unknown
    ) {
        super(
            message,
            'PERMISSION_DENIED',
            403,
            details
        );
        this.name = 'ShelterAuthorizationError';
    }
}

/**
 * Error lanzado cuando hay un problema de validación de negocio
 * Diferente de la validación de Zod (que es para validación de entrada)
 */
export class ShelterBusinessError extends ShelterError {
    constructor(
        message: string,
        code: string = 'BUSINESS_RULE_VIOLATION',
        details?: unknown
    ) {
        super(
            message,
            code,
            400,
            details
        );
        this.name = 'ShelterBusinessError';
    }
}