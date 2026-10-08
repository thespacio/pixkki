export class EmailAlreadyInUseError extends Error {
    constructor(email: string) {
        super(`El correo ${email} ya está registrado`);
        this.name = "EmailAlreadyInUseError";
    }
}

export class StaffCreationFailedError extends Error {
    constructor(reason: string) {
        super(`No se pudo crear el miembro del personal: ${reason}`);
        this.name = "StaffCreationFailedError";
    }
}

/**
 * Error de autorización del módulo (gestión de personal / vista global).
 */
export class UserAuthorizationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "UserAuthorizationError";
    }
}

/**
 * Usuario no encontrado dentro del refugio (multitenant).
 */
export class UserNotFoundError extends Error {
    constructor(id: number) {
        super(`Usuario ${id} no encontrado`);
        this.name = "UserNotFoundError";
    }
}