import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { DatosInvalidosError, SolicitudNoEncontradaError } from "../errors";
import type { CreateEvaluacionDTO } from "../dtos/evaluation.dto";

export class AdoptionEvaluationRepository {
    constructor(private readonly supabase: SupabaseClient<Database>) {}

    private scope(query: any, idRefugio: number | null) {
        return idRefugio === null ? query : query.eq("id_refugio", idRefugio);
    }

    private async getSolicitud(idSolicitud: number, idRefugio: number | null) {
        let q = this.supabase
            .from("solicitud_adopcion")
            .select("id_solicitud, id_refugio")
            .eq("id_solicitud", idSolicitud);
        q = this.scope(q, idRefugio);
        const { data, error } = await q.maybeSingle();
        if (error) throw error;
        if (!data) throw new SolicitudNoEncontradaError();
        return data;
    }

    async create(idSolicitud: number, body: CreateEvaluacionDTO, idUsuario: number, idRefugio: number | null) {
        const sol = await this.getSolicitud(idSolicitud, idRefugio);
        const fecha =
            body.fecha_evaluacion instanceof Date
                ? body.fecha_evaluacion.toISOString()
                : new Date().toISOString();

        const { data, error } = await this.supabase
            .from("evaluacion_adopcion")
            .insert({
                id_solicitud: idSolicitud,
                id_usuario: idUsuario,
                id_refugio: sol.id_refugio,
                tipo_evaluacion: body.tipo_evaluacion,
                resultado: body.resultado,
                puntuacion: body.puntuacion ?? null,
                comentarios: body.comentarios ?? null,
                fecha_evaluacion: fecha,
            })
            .select("*")
            .single();
        if (error) {
            if ((error as any).code === "23514") throw new DatosInvalidosError(error.message);
            throw error;
        }
        return data;
    }

    async listBySolicitud(idSolicitud: number, idRefugio: number | null) {
        await this.getSolicitud(idSolicitud, idRefugio);
        let q = this.supabase
            .from("evaluacion_adopcion")
            .select("*")
            .eq("id_solicitud", idSolicitud)
            .order("fecha_evaluacion", { ascending: false })
            .order("id_evaluacion_adopcion", { ascending: false });
        q = this.scope(q, idRefugio);
        const { data, error } = await q;
        if (error) throw error;
        return data ?? [];
    }
}