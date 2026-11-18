export class EmailAlreadyInUseError extends Error {
    constructor(email: string) {
        super(`El correo ${email} ya está registrado`);
        this.name = "EmailAlreadyInUseError";
    }
}

export class UserNotFoundError extends Error {
    constructor(id: number) {
        super(`Usuario con ID ${id} no encontrado`);
        this.name = "UserNotFoundError";
    }
}

export class UserAuthorizationError extends Error {
    constructor(message = "No tienes permisos para realizar esta acción.") {
        super(message);
        this.name = "UserAuthorizationError";
    }
}

export class StaffCreationFailedError extends Error {
    constructor(reason: string) {
        super(`No se pudo crear el miembro del personal: ${reason}`);
        this.name = "StaffCreationFailedError";
    }
}

/** El superadmin debe indicar el refugio donde se crea el miembro. */
export class StaffShelterRequiredError extends Error {
    constructor() {
        super("Selecciona el refugio al que pertenecerá el nuevo miembro.");
        this.name = "StaffShelterRequiredError";
    }
}