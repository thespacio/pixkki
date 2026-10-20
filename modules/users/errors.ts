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