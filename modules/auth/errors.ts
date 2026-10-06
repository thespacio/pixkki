// modules/auth/errors.ts

export class AuthError extends Error {
    readonly statusCode: number;

    constructor(
        message: string,
        statusCode = 400
    ) {
        super(message);
        this.name = new.target.name;
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class UnauthorizedError extends AuthError {
    constructor(
        message = "No estás autenticado."
    ) {
        super(message, 401);
    }
}

export class ForbiddenError extends AuthError {
    constructor(
        message = "No tienes permiso para realizar esta acción."
    ) {
        super(message, 403);
    }
}

export class UserNotFoundError extends AuthError {
    constructor(
        message = "El usuario autenticado no existe."
    ) {
        super(message, 404);
    }
}

export class InactiveUserError extends AuthError {
    constructor(
        message = "La cuenta de usuario está deshabilitada."
    ) {
        super(message, 403);
    }
}

export class InactiveShelterError extends AuthError {
    constructor(
        message = "El refugio está deshabilitado."
    ) {
        super(message, 403);
    }
}

export class EmailNotVerifiedError extends AuthError {
    constructor(
        message = "El correo electrónico no ha sido verificado."
    ) {
        super(message, 403);
    }
}

export class MissingPermissionError extends AuthError {
    constructor(
        permission: string
    ) {
        super(
            `Permiso requerido faltante: ${permission}`,
            403
        );
    }
}

export class InvalidRoleError extends AuthError {
    constructor(
        role: string
    ) {
        super(
            `Rol requerido: ${role}`,
            403
        );
    }
}

export class OnboardingRequiredError extends AuthError {
    constructor(
        message = "El usuario debe completar el onboarding."
    ) {
        super(message, 403);
    }
}

export class MfaRequiredError extends AuthError {
    constructor(
        message = "Se requiere autenticación de dos factores."
    ) {
        super(message, 403);
    }
}

export class InvalidCredentialsError extends AuthError {
    constructor(
        message = "Correo o contraseña incorrectos."
    ) {
        super(message, 401);
    }
}

export class InvalidTotpCodeError extends Error {
    constructor() {
        super("El código de autenticación no es válido.");
        this.name = "InvalidTotpCodeError";
    }
}

export class MfaChallengeExpiredError extends Error {
    constructor() {
        super("El código ha expirado. Intenta nuevamente.");
        this.name = "MfaChallengeExpiredError";
    }
}

export class MfaEnrollmentError extends Error {
    constructor(message = "No fue posible configurar la autenticación en dos pasos.") {
        super(message);
        this.name = "MfaEnrollmentError";
    }
}