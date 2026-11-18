export type AdoptionErrorDetails = {
    bloqueos?: string[];
    advertencias?: string[];
};

class AdoptionError extends Error {
    readonly code: string;
    readonly statusCode: number;
    readonly details?: AdoptionErrorDetails;

    constructor(init: {
        code: string;
        statusCode: number;
        message: string;
        name: string;
        details?: AdoptionErrorDetails;
    }) {
        super(init.message);
        this.name = init.name;
        this.code = init.code;
        this.statusCode = init.statusCode;
        this.details = init.details;
    }
}

export class DatosInvalidosError extends AdoptionError {
    constructor(message = "Los datos enviados no son válidos.") {
        super({ code: "DATOS_INVALIDOS", statusCode: 400, message, name: "DatosInvalidosError" });
    }
}

export class DescripcionInvalidaError extends AdoptionError {
    constructor() {
        super({
            code: "DESCRIPCION_INVALIDA",
            statusCode: 400,
            message: "La descripción pública debe tener entre 50 y 2000 caracteres.",
            name: "DescripcionInvalidaError",
        });
    }
}

export class FiltrosInvalidosError extends AdoptionError {
    constructor(message = "Los filtros proporcionados no son válidos.") {
        super({ code: "FILTROS_INVALIDOS", statusCode: 400, message, name: "FiltrosInvalidosError" });
    }
}

export class PrivacidadNoAceptadaError extends AdoptionError {
    constructor() {
        super({
            code: "PRIVACIDAD_NO_ACEPTADA",
            statusCode: 400,
            message: "Debes aceptar la política de privacidad.",
            name: "PrivacidadNoAceptadaError",
        });
    }
}

export class MayoriaDeEdadNoDeclaradaError extends AdoptionError {
    constructor() {
        super({
            code: "MAYORIA_DE_EDAD_NO_DECLARADA",
            statusCode: 400,
            message: "Debes declarar que eres mayor de edad.",
            name: "MayoriaDeEdadNoDeclaradaError",
        });
    }
}

export class SolicitudInvalidaError extends AdoptionError {
    constructor() {
        super({
            code: "SOLICITUD_INVALIDA",
            statusCode: 400,
            message: "La solicitud no es válida.",
            name: "SolicitudInvalidaError",
        });
    }
}

export class MotivoRequeridoError extends AdoptionError {
    constructor() {
        super({
            code: "MOTIVO_REQUERIDO",
            statusCode: 400,
            message: "Rechazar o cancelar exige un motivo de 10 a 500 caracteres.",
            name: "MotivoRequeridoError",
        });
    }
}

export class FechaFuturaError extends AdoptionError {
    constructor() {
        super({
            code: "FECHA_FUTURA",
            statusCode: 400,
            message: "La fecha de adopción no puede ser futura.",
            name: "FechaFuturaError",
        });
    }
}

export class RolSinPermisoError extends AdoptionError {
    constructor() {
        super({
            code: "ROL_SIN_PERMISO",
            statusCode: 403,
            message: "No tienes permiso para realizar esta acción.",
            name: "RolSinPermisoError",
        });
    }
}

export class AnimalNoEncontradoError extends AdoptionError {
    constructor() {
        super({
            code: "ANIMAL_NO_ENCONTRADO",
            statusCode: 404,
            message: "Animal no encontrado.",
            name: "AnimalNoEncontradoError",
        });
    }
}

export class AnimalNoDisponibleError extends AdoptionError {
    constructor() {
        super({
            code: "ANIMAL_NO_DISPONIBLE",
            statusCode: 404,
            message: "El animal no está disponible para adopción.",
            name: "AnimalNoDisponibleError",
        });
    }
}

export class PerfilNoEncontradoError extends AdoptionError {
    constructor() {
        super({
            code: "PERFIL_NO_ENCONTRADO",
            statusCode: 404,
            message: "Perfil de adopción no encontrado.",
            name: "PerfilNoEncontradoError",
        });
    }
}

export class RefugioNoEncontradoError extends AdoptionError {
    constructor() {
        super({
            code: "REFUGIO_NO_ENCONTRADO",
            statusCode: 404,
            message: "Refugio no encontrado.",
            name: "RefugioNoEncontradoError",
        });
    }
}

export class SolicitudNoEncontradaError extends AdoptionError {
    constructor() {
        super({
            code: "SOLICITUD_NO_ENCONTRADA",
            statusCode: 404,
            message: "Solicitud no encontrada.",
            name: "SolicitudNoEncontradaError",
        });
    }
}

export class AnimalNoDisponiblePublicacionError extends AdoptionError {
    constructor(details?: AdoptionErrorDetails) {
        super({
            code: "ANIMAL_NO_DISPONIBLE",
            statusCode: 409,
            message: "El animal no cumple las condiciones para publicarse.",
            name: "AnimalNoDisponiblePublicacionError",
            details,
        });
    }
}

export class PerfilSinFotografiaError extends AdoptionError {
    constructor() {
        super({
            code: "PERFIL_SIN_FOTOGRAFIA",
            statusCode: 409,
            message: "El perfil solo se publica si el animal tiene al menos una fotografía.",
            name: "PerfilSinFotografiaError",
        });
    }
}

export class PerfilYaPublicadoError extends AdoptionError {
    constructor() {
        super({
            code: "PERFIL_YA_PUBLICADO",
            statusCode: 409,
            message: "El perfil ya se encuentra publicado.",
            name: "PerfilYaPublicadoError",
        });
    }
}

export class SolicitudDuplicadaError extends AdoptionError {
    constructor() {
        super({
            code: "SOLICITUD_DUPLICADA",
            statusCode: 409,
            message: "Ya existe una solicitud activa para este animal.",
            name: "SolicitudDuplicadaError",
        });
    }
}

export class LimiteSolicitudesError extends AdoptionError {
    constructor() {
        super({
            code: "LIMITE_SOLICITUDES",
            statusCode: 409,
            message: "Has alcanzado el límite de solicitudes activas en este refugio.",
            name: "LimiteSolicitudesError",
        });
    }
}

export class AnimalYaReservadoError extends AdoptionError {
    constructor() {
        super({
            code: "ANIMAL_YA_RESERVADO",
            statusCode: 409,
            message: "El animal ya tiene una reserva activa.",
            name: "AnimalYaReservadoError",
        });
    }
}

export class TransicionInvalidaError extends AdoptionError {
    constructor() {
        super({
            code: "TRANSICION_INVALIDA",
            statusCode: 409,
            message: "La transición de estado no es válida.",
            name: "TransicionInvalidaError",
        });
    }
}

export class EvaluacionRequeridaError extends AdoptionError {
    constructor() {
        super({
            code: "EVALUACION_REQUERIDA",
            statusCode: 409,
            message: "Se requiere al menos una evaluación para aprobar.",
            name: "EvaluacionRequeridaError",
        });
    }
}

export class UltimaEvaluacionNoAprobadaError extends AdoptionError {
    constructor() {
        super({
            code: "ULTIMA_EVALUACION_NO_APROBADA",
            statusCode: 409,
            message: "La última evaluación debe estar aprobada.",
            name: "UltimaEvaluacionNoAprobadaError",
        });
    }
}

export class SolicitudYaCerradaError extends AdoptionError {
    constructor() {
        super({
            code: "SOLICITUD_YA_CERRADA",
            statusCode: 409,
            message: "La solicitud ya está cerrada.",
            name: "SolicitudYaCerradaError",
        });
    }
}

export class SolicitudNoAprobadaError extends AdoptionError {
    constructor() {
        super({
            code: "SOLICITUD_NO_APROBADA",
            statusCode: 409,
            message: "Solo una solicitud aprobada puede completarse.",
            name: "SolicitudNoAprobadaError",
        });
    }
}

export class AdopcionYaCompletadaError extends AdoptionError {
    constructor() {
        super({
            code: "ADOPCION_YA_COMPLETADA",
            statusCode: 409,
            message: "La adopción ya fue completada.",
            name: "AdopcionYaCompletadaError",
        });
    }
}

export class DemasiadasSolicitudesError extends AdoptionError {
    readonly retryAfterSeconds: number;
    constructor(retryAfterSeconds = 3600) {
        super({
            code: "DEMASIADAS_SOLICITUDES",
            statusCode: 429,
            message: "Has realizado demasiadas solicitudes. Intenta más tarde.",
            name: "DemasiadasSolicitudesError",
        });
        this.retryAfterSeconds = retryAfterSeconds;
    }
}

export class ErrorInternoAdopcionesError extends AdoptionError {
    constructor() {
        super({
            code: "ERROR_INTERNO",
            statusCode: 500,
            message: "No se pudo procesar la solicitud. Intenta de nuevo.",
            name: "ErrorInternoAdopcionesError",
        });
    }
}

export function isAdoptionDomainError(
    error: unknown,
): error is { code: string; statusCode: number; message: string; details?: AdoptionErrorDetails } {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        "statusCode" in error &&
        "message" in error
    );
}