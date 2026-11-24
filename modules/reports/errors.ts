/**
 * Errores de dominio del módulo reports.
 * `code` y `statusCode` son los que traduce `handleApiError`.
 */

export class PeriodoInvalidoReportesError extends Error {
    readonly code = "PERIODO_INVALIDO";
    readonly statusCode = 400;

    constructor(message = "La fecha inicial no puede ser posterior a la final.") {
        super(message);
        this.name = "PeriodoInvalidoReportesError";
    }
}

export class RangoExcedidoReportesError extends Error {
    readonly code = "RANGO_EXCEDIDO";
    readonly statusCode = 400;

    constructor(message = "El rango máximo es de 366 días.") {
        super(message);
        this.name = "RangoExcedidoReportesError";
    }
}

export class RolSinPermisoReportesError extends Error {
    readonly code = "ROL_SIN_PERMISO";
    readonly statusCode = 403;

    constructor(message = "Tu rol no tiene acceso a este resumen.") {
        super(message);
        this.name = "RolSinPermisoReportesError";
    }
}

export class RefugioFueraDeAlcanceError extends Error {
    readonly code = "REFUGIO_FUERA_DE_ALCANCE";
    readonly statusCode = 403;

    constructor(message = "No puedes consultar otro refugio.") {
        super(message);
        this.name = "RefugioFueraDeAlcanceError";
    }
}

export class ErrorInternoReportesError extends Error {
    readonly code = "ERROR_INTERNO";
    readonly statusCode = 500;

    constructor(message = "No se pudo generar el resumen del refugio.") {
        super(message);
        this.name = "ErrorInternoReportesError";
    }
}
