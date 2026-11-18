import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import {
    AnimalNoDisponibleError,
    AnimalYaReservadoError,
    DatosInvalidosError,
    ErrorInternoAdopcionesError,
    LimiteSolicitudesError,
    PrivacidadNoAceptadaError,
    SolicitudDuplicadaError,
    SolicitudInvalidaError,
    SolicitudNoEncontradaError,
    MayoriaDeEdadNoDeclaradaError,
} from "../errors";
import type { CreateSolicitudPublicaDTO, ListSolicitudesQueryDTO } from "../dtos/application.dto";

type RpcEnvelope = {
    ok: boolean;
    code?: string;
    message?: string;
    data?: Record<string, unknown>;
};

function parseEnvelope(value: Json | null): RpcEnvelope {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw new ErrorInternoAdopcionesError();
    }
    const e = value as Record<string, unknown>;
    return {
        ok: e.ok === true,
        code: typeof e.code === "string" ? e.code : undefined,
        message: typeof e.message === "string" ? e.message : undefined,
        data:
            typeof e.data === "object" && e.data !== null && !Array.isArray(e.data)
                ? (e.data as Record<string, unknown>)
                : undefined,
    };
}

function throwSolicitudCode(code: string | undefined, message?: string): never {
    switch (code) {
        case "PRIVACIDAD_NO_ACEPTADA":
            throw new PrivacidadNoAceptadaError();
        case "MAYORIA_DE_EDAD_NO_DECLARADA":
            throw new MayoriaDeEdadNoDeclaradaError();
        case "SOLICITUD_INVALIDA":
            throw new SolicitudInvalidaError();
        case "DATOS_INVALIDOS":
            throw new DatosInvalidosError(message);
        case "ANIMAL_NO_DISPONIBLE":
            throw new AnimalNoDisponibleError();
        case "SOLICITUD_DUPLICADA":
            throw new SolicitudDuplicadaError();
        case "LIMITE_SOLICITUDES":
            throw new LimiteSolicitudesError();
        case "ANIMAL_YA_RESERVADO":
            throw new AnimalYaReservadoError();
        case "SOLICITUD_NO_ENCONTRADA":
            throw new SolicitudNoEncontradaError();
        default:
            throw new ErrorInternoAdopcionesError();
    }
}

export class AdoptionApplicationRepository {
    constructor(private readonly supabase: SupabaseClient<Database>) {}

    async createPublic(idAnimal: number, body: CreateSolicitudPublicaDTO) {
        const { data, error } = await this.supabase.rpc("registrar_solicitud_adopcion", {
            p_id_animal: idAnimal,
            p_nombre_completo: body.nombre_completo,
            p_telefono: body.telefono,
            p_correo: body.correo,
            p_direccion: body.direccion,
            p_tiene_otras_mascotas: body.tiene_otras_mascotas,
            p_tiene_ninos: body.tiene_ninos,
            p_espacio_techado: body.espacio_techado,
            p_tiempo_solo_horas: body.tiempo_solo_horas ?? undefined,
            p_experiencia_mascotas: body.experiencia_mascotas ?? undefined,
            p_motivo_adopcion: body.motivo_adopcion,
            p_comentarios_generales: body.comentarios_generales ?? undefined,
            p_acepta_politica_privacidad: body.acepta_politica_privacidad,
            p_declara_mayor_edad: body.declara_mayor_edad,
        });
        if (error) throw error;
        const envelope = parseEnvelope(data);
        if (!envelope.ok) throwSolicitudCode(envelope.code, envelope.message);
        return envelope.data ?? {};
    }

    private scope(query: any, idRefugio: number | null) {
        return idRefugio === null ? query : query.eq("id_refugio", idRefugio);
    }

    async list(query: ListSolicitudesQueryDTO, idRefugio: number | null) {
        const from = (query.page - 1) * query.pageSize;
        const to = from + query.pageSize - 1;

        let q = this.supabase
            .from("solicitud_adopcion")
            .select(
                "*, adoptante:adoptante(id_adoptante,nombre_completo,correo,telefono), animal:animal(id_animal,nombre,especie,raza)",
                { count: "exact" },
            );

        q = this.scope(q, idRefugio);
        if (query.estado) q = q.eq("estado_solicitud", query.estado);
        if (query.id_animal) q = q.eq("id_animal", query.id_animal);
        if (query.desde) q = q.gte("fecha_solicitud", query.desde);
        if (query.hasta) q = q.lte("fecha_solicitud", query.hasta);

        q = q.order("fecha_solicitud", { ascending: false }).range(from, to);
        const { data, error, count } = await q;
        if (error) throw error;

        let items = data ?? [];
        if (query.q) {
            const term = query.q.toLowerCase();
            items = items.filter((s: any) => {
                const a = s.adoptante ?? {};
                const an = s.animal ?? {};
                return [a.nombre_completo, a.correo, a.telefono, an.nombre, String(s.id_solicitud)]
                    .filter(Boolean)
                    .some((v) => String(v).toLowerCase().includes(term));
            });
        }

        return { items, page: query.page, pageSize: query.pageSize, total: count ?? items.length };
    }

    async getById(idSolicitud: number, idRefugio: number | null) {
        let q = this.supabase
            .from("solicitud_adopcion")
            .select(
                "*, adoptante:adoptante(*), animal:animal(id_animal,nombre,especie,raza,sexo,edad_estimada,tamano,temperamento,vacunado,desparasitado,esterilizado,disponible_adopcion,reservado_adopcion,en_cuarentena,activo), evaluacion_adopcion(*)",
            )
            .eq("id_solicitud", idSolicitud);
        q = this.scope(q, idRefugio);
        const { data, error } = await q.maybeSingle();
        if (error) throw error;
        if (!data) throw new SolicitudNoEncontradaError();
        return data;
    }
}