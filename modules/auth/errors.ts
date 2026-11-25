// modules/auth/errors.ts

export class AuthError extends Error {
    readonly statusCode: number;
    readonly code?: string;

    constructor(
        message: string,
        statusCode = 400,
        code?: string
    ) {
        super(message);
        this.name = new.target.name;
        this.statusCode = statusCode;
        this.code = code;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

/** El correo ya existe en Supabase Auth aunque no tenga fila en `usuario`. */
export class AuthEmailAlreadyInUseError extends AuthError {
    constructor(email: string) {
        super(`El correo ${email} ya está registrado en Auth.`, 409, "email_exists");
    }
}

export class UnauthorizedError extends AuthError {
    constructor(
        message = "Usuario no autenticado"
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

export class InvalidTotpCodeError extends AuthError {
    constructor() {
        super("El código de autenticación no es válido.", 400);
    }
}

export class MfaChallengeExpiredError extends AuthError {
    constructor() {
        super("El código ha expirado. Intenta nuevamente.", 400);
    }
}

export class MfaEnrollmentError extends AuthError {
    constructor(message = "No fue posible configurar la autenticación en dos pasos.", statusCode = 500) {
        super(message, statusCode);
    }
}