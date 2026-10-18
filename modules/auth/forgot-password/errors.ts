export class UnableToSendResetEmailError extends Error {
    constructor(message = "No se pudo enviar el correo de restablecimiento") {
        super(message);
        this.name = "UnableToSendResetEmailError";
    }
}