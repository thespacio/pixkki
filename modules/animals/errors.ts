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

// ---------------------------------------------------------------------------
// Requerimiento 03 — socialización y espacios.
// ---------------------------------------------------------------------------

type SocializationErrorInit = {
    code: string;
    statusCode: number;
    message: string;
    name: string;
};

class SocializationError extends Error {
    readonly code: string;
    readonly statusCode: number;

    constructor(init: SocializationErrorInit) {
        super(init.message);
        this.name = init.name;
        this.code = init.code;
        this.statusCode = init.statusCode;
    }
}

export class EspacioNoEncontradoError extends SocializationError {
    constructor() {
        super({
            code: "ESPACIO_NO_ENCONTRADO",
            statusCode: 404,
            message: "El espacio seleccionado no existe en este refugio.",
            name: "EspacioNoEncontradoError",
        });
    }
}

export class EspacioInactivoError extends SocializationError {
    constructor() {
        super({
            code: "ESPACIO_INACTIVO",
            statusCode: 409,
            message: "El espacio seleccionado no está disponible.",
            name: "EspacioInactivoError",
        });
    }
}

export class CapacidadExcedidaError extends SocializationError {
    constructor() {
        super({
            code: "CAPACIDAD_EXCEDIDA",
            statusCode: 409,
            message: "El espacio destino no tiene cupo disponible.",
            name: "CapacidadExcedidaError",
        });
    }
}

export class ConflictoOcupacionError extends SocializationError {
    constructor() {
        super({
            code: "CONFLICTO_OCUPACION",
            statusCode: 409,
            message: "Otro traslado ocupó la última plaza. Selecciona otro espacio.",
            name: "ConflictoOcupacionError",
        });
    }
}

export class TrasladoMismoEspacioError extends SocializationError {
    constructor() {
        super({
            code: "TRASLADO_MISMO_ESPACIO",
            statusCode: 400,
            message: "El destino debe ser distinto del espacio actual.",
            name: "TrasladoMismoEspacioError",
        });
    }
}

export class TrasladoOrigenDesactualizadoError extends SocializationError {
    constructor() {
        super({
            code: "TRASLADO_ORIGEN_DESACTUALIZADO",
            statusCode: 409,
            message: "La ubicación del paciente cambió. Recarga la ficha e inténtalo de nuevo.",
            name: "TrasladoOrigenDesactualizadoError",
        });
    }
}

export class FalloTransaccionTrasladoError extends SocializationError {
    constructor() {
        super({
            code: "FALLO_TRANSACCION_TRASLADO",
            statusCode: 500,
            message: "No se pudo registrar el traslado. Intenta de nuevo.",
            name: "FalloTransaccionTrasladoError",
        });
    }
}

export class NivelesInvalidosError extends SocializationError {
    constructor() {
        super({
            code: "NIVELES_INVALIDOS",
            statusCode: 400,
            message: "Los niveles de energía o compatibilidad no son válidos.",
            name: "NivelesInvalidosError",
        });
    }
}

export class FechaFinInvalidaError extends SocializationError {
    constructor() {
        super({
            code: "FECHA_FIN_INVALIDA",
            statusCode: 400,
            message: "La fecha de fin no puede ser anterior a la de inicio.",
            name: "FechaFinInvalidaError",
        });
    }
}

// ---------------------------------------------------------------------------
// Requerimiento 04 — control poblacional (cirugía y aptitud para adopción).
// ---------------------------------------------------------------------------

export type AptitudAdopcionDetails = {
    bloqueos?: string[];
    advertencias?: string[];
};

type ControlPoblacionalErrorInit = {
    code: string;
    statusCode: number;
    message: string;
    name: string;
    details?: AptitudAdopcionDetails;
};

class ControlPoblacionalError extends Error {
    readonly code: string;
    readonly statusCode: number;
    readonly details?: AptitudAdopcionDetails;

    constructor(init: ControlPoblacionalErrorInit) {
        super(init.message);
        this.name = init.name;
        this.code = init.code;
        this.statusCode = init.statusCode;
        this.details = init.details;
    }
}

export class DatosInvalidosError extends ControlPoblacionalError {
    constructor(message = "Los datos enviados no son válidos.") {
        super({
            code: "DATOS_INVALIDOS",
            statusCode: 400,
            message,
            name: "DatosInvalidosError",
        });
    }
}

export class FechaFuturaError extends ControlPoblacionalError {
    constructor() {
        super({
            code: "FECHA_FUTURA",
            statusCode: 400,
            message: "La fecha de la cirugía no puede ser futura.",
            name: "FechaFuturaError",
        });
    }
}

export class InsumosDuplicadosError extends ControlPoblacionalError {
    constructor() {
        super({
            code: "INSUMOS_DUPLICADOS",
            statusCode: 400,
            message: "Un mismo lote no puede repetirse en la misma cirugía.",
            name: "InsumosDuplicadosError",
        });
    }
}

export class CantidadInvalidaError extends ControlPoblacionalError {
    constructor() {
        super({
            code: "CANTIDAD_INVALIDA",
            statusCode: 400,
            message: "La cantidad de cada insumo debe ser un entero mayor o igual a 1.",
            name: "CantidadInvalidaError",
        });
    }
}

export class CirugiaDuplicadaError extends ControlPoblacionalError {
    constructor() {
        super({
            code: "CIRUGIA_DUPLICADA",
            statusCode: 409,
            message: "Ya existe una cirugía registrada para este paciente, tipo y fecha.",
            name: "CirugiaDuplicadaError",
        });
    }
}

export class TipoInsumoInvalidoError extends ControlPoblacionalError {
    constructor() {
        super({
            code: "TIPO_INSUMO_INVALIDO",
            statusCode: 409,
            message: "El lote seleccionado no es un insumo quirúrgico.",
            name: "TipoInsumoInvalidoError",
        });
    }
}

export class FalloTransaccionCirugiaError extends ControlPoblacionalError {
    constructor() {
        super({
            code: "FALLO_TRANSACCION_CIRUGIA",
            statusCode: 500,
            message: "No se pudo registrar la cirugía. Intenta de nuevo.",
            name: "FalloTransaccionCirugiaError",
        });
    }
}

export class AptitudAdopcionInsuficienteError extends ControlPoblacionalError {
    constructor(details: AptitudAdopcionDetails) {
        super({
            code: "APTITUD_ADOPCION_INSUFICIENTE",
            statusCode: 409,
            message: "El paciente no cumple los criterios para ser publicado en adopción.",
            name: "AptitudAdopcionInsuficienteError",
            details,
        });
    }
}

export class BloqueoNoExcepcionableError extends ControlPoblacionalError {
    constructor(details?: AptitudAdopcionDetails) {
        super({
            code: "BLOQUEO_NO_EXCEPCIONABLE",
            statusCode: 409,
            message:
                "El paciente tiene bloqueos que no pueden omitirse con una excepción.",
            name: "BloqueoNoExcepcionableError",
            details,
        });
    }
}

export class ExcepcionNoAutorizadaError extends ControlPoblacionalError {
    constructor() {
        super({
            code: "EXCEPCION_NO_AUTORIZADA",
            statusCode: 403,
            message: "Solo un administrador puede autorizar una excepción de aptitud.",
            name: "ExcepcionNoAutorizadaError",
        });
    }
}

export class MotivoExcepcionRequeridoError extends ControlPoblacionalError {
    constructor() {
        super({
            code: "MOTIVO_EXCEPCION_REQUERIDO",
            statusCode: 400,
            message: "La excepción requiere un motivo de entre 20 y 1000 caracteres.",
            name: "MotivoExcepcionRequeridoError",
        });
    }
}

export class ExcepcionInnecesariaError extends ControlPoblacionalError {
    constructor() {
        super({
            code: "EXCEPCION_INNECESARIA",
            statusCode: 400,
            message: "El paciente ya cumple todos los criterios; no requiere excepción.",
            name: "ExcepcionInnecesariaError",
        });
    }
}

export class ErrorInternoAdopcionError extends ControlPoblacionalError {
    constructor() {
        super({
            code: "ERROR_INTERNO",
            statusCode: 500,
            message: "No se pudo procesar la disponibilidad de adopción. Intenta de nuevo.",
            name: "ErrorInternoAdopcionError",
        });
    }
}

/**
 * La edición general del expediente ya no puede cambiar `disponible_adopcion`:
 * la publicación pasa siempre por el gatekeeper dedicado.
 */
export class GatekeeperAdopcionRequeridoError extends ControlPoblacionalError {
    constructor() {
        super({
            code: "GATEKEEPER_ADOPCION_REQUERIDO",
            statusCode: 409,
            message:
                "Usa la operación de disponibilidad de adopción para publicar o despublicar al paciente.",
            name: "GatekeeperAdopcionRequeridoError",
        });
    }
}
