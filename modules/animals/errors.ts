export class AnimalNotFoundError extends Error {
    readonly code = "ANIMAL_NO_ENCONTRADO";
    readonly statusCode = 404;

    constructor(id: number) {
        super(`Animal ${id} no encontrado`);
        this.name = "AnimalNotFoundError";
    }
}

export class AnimalSpaceMismatchError extends Error {
    readonly code = "ESPACIO_INVALIDO";
    readonly statusCode = 400;

    constructor() {
        super("El espacio seleccionado no pertenece al refugio");
        this.name = "AnimalSpaceMismatchError";
    }
}

export class AnimalStateNotFoundError extends Error {
    readonly code = "ESTADO_INVALIDO";
    readonly statusCode = 400;

    constructor(id: number) {
        super(`Estado ${id} no encontrado`);
        this.name = "AnimalStateNotFoundError";
    }
}

export class AnimalClinicalForbiddenError extends Error {
    readonly code = "ROL_SIN_PERMISO";
    readonly statusCode = 403;

    constructor() {
        super("Solo un veterinario o un administrador puede realizar esta operación clínica.");
        this.name = "AnimalClinicalForbiddenError";
    }
}

export class QuarantineAlreadyReleasedError extends Error {
    readonly code = "CUARENTENA_YA_LIBERADA";
    readonly statusCode = 409;

    constructor() {
        super("La cuarentena del paciente ya fue liberada.");
        this.name = "QuarantineAlreadyReleasedError";
    }
}

/**
 * RF2.4: mientras `en_cuarentena = true` el paciente no puede pasar a
 * disponibilidad de adopción ni a áreas generales. La UI deshabilita el
 * control; esto es la autorización real en el servidor.
 */
export class AnimalEnCuarentenaError extends Error {
    readonly code = "ANIMAL_EN_CUARENTENA";
    readonly statusCode = 409;

    constructor() {
        super(
            "El paciente está en cuarentena. Registra el alta médica antes de continuar.",
        );
        this.name = "AnimalEnCuarentenaError";
    }
}

// ---------------------------------------------------------------------------
// RF2.2 / RF2.3 — errores devueltos por la RPC de eventos sanitarios.
// El repository traduce los códigos de la base de datos a estas clases para
// que la API y las Server Actions devuelvan siempre el mismo envelope.
// ---------------------------------------------------------------------------

type ClinicalInventoryErrorInit = {
    code: string;
    statusCode: number;
    message: string;
    name: string;
};

class ClinicalInventoryError extends Error {
    readonly code: string;
    readonly statusCode: number;

    constructor(init: ClinicalInventoryErrorInit) {
        super(init.message);
        this.name = init.name;
        this.code = init.code;
        this.statusCode = init.statusCode;
    }
}

export class LoteNoEncontradoError extends ClinicalInventoryError {
    constructor() {
        super({
            code: "LOTE_NO_ENCONTRADO",
            statusCode: 404,
            message: "El lote seleccionado no existe en este refugio.",
            name: "LoteNoEncontradoError",
        });
    }
}

export class LoteInactivoError extends ClinicalInventoryError {
    constructor() {
        super({
            code: "LOTE_INACTIVO",
            statusCode: 409,
            message: "El lote seleccionado está inactivo.",
            name: "LoteInactivoError",
        });
    }
}

export class LoteVencidoError extends ClinicalInventoryError {
    constructor() {
        super({
            code: "LOTE_VENCIDO",
            statusCode: 409,
            message: "El lote seleccionado está vencido.",
            name: "LoteVencidoError",
        });
    }
}

export class StockInsuficienteError extends ClinicalInventoryError {
    constructor() {
        super({
            code: "STOCK_INSUFICIENTE",
            statusCode: 409,
            message: "No hay unidades disponibles en el lote seleccionado.",
            name: "StockInsuficienteError",
        });
    }
}

export class ConflictoConcurrenciaError extends ClinicalInventoryError {
    constructor() {
        super({
            code: "CONFLICTO_CONCURRENCIA",
            statusCode: 409,
            message: "Otro usuario consumió la última unidad. Selecciona otro lote.",
            name: "ConflictoConcurrenciaError",
        });
    }
}

export class TipoEventoInvalidoError extends ClinicalInventoryError {
    constructor() {
        super({
            code: "TIPO_EVENTO_INVALIDO",
            statusCode: 400,
            message: "El insumo del lote no corresponde al tipo de evento.",
            name: "TipoEventoInvalidoError",
        });
    }
}

export class FechaRefuerzoInvalidaError extends ClinicalInventoryError {
    constructor() {
        super({
            code: "FECHA_REFUERZO_INVALIDA",
            statusCode: 400,
            message: "La fecha de refuerzo debe ser posterior a la de aplicación.",
            name: "FechaRefuerzoInvalidaError",
        });
    }
}

export class RefuerzoRequeridoError extends ClinicalInventoryError {
    constructor() {
        super({
            code: "REFUERZO_REQUERIDO",
            statusCode: 400,
            message: "Un esquema completo requiere fecha de refuerzo.",
            name: "RefuerzoRequeridoError",
        });
    }
}

export class FalloTransaccionInventarioError extends ClinicalInventoryError {
    constructor() {
        super({
            code: "FALLO_TRANSACCION_INVENTARIO",
            statusCode: 500,
            message: "No se pudo registrar el evento sanitario. Intenta de nuevo.",
            name: "FalloTransaccionInventarioError",
        });
    }
}
