import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import {
    AdopcionYaCompletadaError,
    AnimalNoDisponibleError,
    AnimalYaReservadoError,
    DatosInvalidosError,
    ErrorInternoAdopcionesError,
    EvaluacionRequeridaError,
    FechaFuturaError,
    MotivoRequeridoError,
    SolicitudNoAprobadaError,
    SolicitudNoEncontradaError,
    SolicitudYaCerradaError,
    TransicionInvalidaError,
    UltimaEvaluacionNoAprobadaError,
} from "../errors";

import { parseEnvelope } from "./rpc-envelope";

function throwStateCode(code: string | undefined, message?: string): never {
    switch (code) {
        case "SOLICITUD_NO_ENCONTRADA":
            throw new SolicitudNoEncontradaError();
        case "SOLICITUD_YA_CERRADA":
            throw new SolicitudYaCerradaError();
        case "TRANSICION_INVALIDA":
            throw new TransicionInvalidaError();
        case "MOTIVO_REQUERIDO":
            throw new MotivoRequeridoError();
        case "EVALUACION_REQUERIDA":
            throw new EvaluacionRequeridaError();
        case "ULTIMA_EVALUACION_NO_APROBADA":
            throw new UltimaEvaluacionNoAprobadaError();
        case "ANIMAL_YA_RESERVADO":
            throw new AnimalYaReservadoError();
        case "ANIMAL_NO_DISPONIBLE":
            throw new AnimalNoDisponibleError();
        case "SOLICITUD_NO_APROBADA":
            throw new SolicitudNoAprobadaError();
        case "ADOPCION_YA_COMPLETADA":
            throw new AdopcionYaCompletadaError();
        case "FECHA_FUTURA":
            throw new FechaFuturaError();
        case "DATOS_INVALIDOS":
            throw new DatosInvalidosError(message);
        default:
            throw new ErrorInternoAdopcionesError();
    }
}

export class AdoptionStateRepository {
    constructor(private readonly supabase: SupabaseClient<Database>) {}

    async changeState(
        idSolicitud: number,
        estado: string,
        motivo: string | null | undefined,
        idUsuario: number,
    ) {
        const { data, error } = await this.supabase.rpc("cambiar_estado_solicitud_adopcion", {
            p_id_solicitud: idSolicitud,
            p_estado_solicitud: estado,
            p_motivo: motivo ?? undefined,
            p_id_usuario: idUsuario,
        });
        if (error) throw error;
        const envelope = parseEnvelope(data);
        if (!envelope.ok) throwStateCode(envelope.code, envelope.message);
        return envelope.data ?? {};
    }

    async complete(
        idSolicitud: number,
        fechaAdopcion: string,
        observaciones: string | null | undefined,
        idUsuario: number,
    ) {
        const { data, error } = await this.supabase.rpc("completar_adopcion", {
            p_id_solicitud: idSolicitud,
            p_fecha_adopcion: fechaAdopcion,
            p_observaciones: observaciones ?? undefined,
            p_id_usuario: idUsuario,
        });
        if (error) throw error;
        const envelope = parseEnvelope(data);
        if (!envelope.ok) throwStateCode(envelope.code, envelope.message);
        return envelope.data ?? {};
    }
}