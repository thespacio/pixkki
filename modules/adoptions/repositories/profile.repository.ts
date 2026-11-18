import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import {
    AnimalNoDisponiblePublicacionError,
    AnimalNoEncontradoError,
    DatosInvalidosError,
    DescripcionInvalidaError,
    ErrorInternoAdopcionesError,
    PerfilSinFotografiaError,
} from "../errors";

type RpcEnvelope = {
    ok: boolean;
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
    data?: Record<string, unknown>;
};

function parseEnvelope(value: Json | null): RpcEnvelope {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw new ErrorInternoAdopcionesError();
    }
    const envelope = value as Record<string, unknown>;
    return {
        ok: envelope.ok === true,
        code: typeof envelope.code === "string" ? envelope.code : undefined,
        message: typeof envelope.message === "string" ? envelope.message : undefined,
        details:
            typeof envelope.details === "object" && envelope.details !== null && !Array.isArray(envelope.details)
                ? (envelope.details as Record<string, unknown>)
                : undefined,
        data:
            typeof envelope.data === "object" && envelope.data !== null && !Array.isArray(envelope.data)
                ? (envelope.data as Record<string, unknown>)
                : undefined,
    };
}

function throwForProfileCode(code: string | undefined, message?: string, details?: Record<string, unknown>): never {
    switch (code) {
        case "ANIMAL_NO_ENCONTRADO":
            throw new AnimalNoEncontradoError();
        case "PERFIL_SIN_FOTOGRAFIA":
            throw new PerfilSinFotografiaError();
        case "ANIMAL_NO_DISPONIBLE":
            throw new AnimalNoDisponiblePublicacionError(
                details?.bloqueos ? { bloqueos: details.bloqueos as string[] } : undefined,
            );
        case "DESCRIPCION_INVALIDA":
            throw new DescripcionInvalidaError();
        case "DATOS_INVALIDOS":
            throw new DatosInvalidosError(message);
        default:
            throw new ErrorInternoAdopcionesError();
    }
}

export class AdoptionProfileRepository {
    constructor(private readonly supabase: SupabaseClient<Database>) {}

    private scope(query: any, idRefugio: number | null) {
        return idRefugio === null ? query : query.eq("id_refugio", idRefugio);
    }

    private async assertAnimal(idAnimal: number, idRefugio: number | null) {
        let q = this.supabase
            .from("animal")
            .select("id_animal")
            .eq("id_animal", idAnimal)
            .is("deleted_at", null);
        q = this.scope(q, idRefugio);
        const { data, error } = await q.maybeSingle();
        if (error) throw error;
        if (!data) throw new AnimalNoEncontradoError();
    }

    async getByAnimal(idAnimal: number, idRefugio: number | null) {
        await this.assertAnimal(idAnimal, idRefugio);

        let pq = this.supabase
            .from("perfil_adopcion")
            .select("*")
            .eq("id_animal", idAnimal);
        pq = this.scope(pq, idRefugio);
        const { data: perfil, error: pErr } = await pq.maybeSingle();
        if (pErr) throw pErr;

        let fq = this.supabase
            .from("fotografia")
            .select("id_fotografia, url_archivo, url_thumbnail, es_principal, orden")
            .eq("id_animal", idAnimal)
            .order("es_principal", { ascending: false })
            .order("orden", { ascending: true })
            .order("id_fotografia", { ascending: true });
        const { data: fotos, error: fErr } = await fq;
        if (fErr) throw fErr;

        let aq = this.supabase
            .from("animal")
            .select("disponible_adopcion, en_cuarentena, activo, deleted_at, reservado_adopcion")
            .eq("id_animal", idAnimal);
        aq = this.scope(aq, idRefugio);
        const { data: animal, error: aErr } = await aq.maybeSingle();
        if (aErr) throw aErr;
        if (!animal) throw new AnimalNoEncontradoError();

        const desc = perfil?.descripcion_publica ?? null;
        const puedePublicarse =
            !!animal.disponible_adopcion &&
            !animal.en_cuarentena &&
            !!animal.activo &&
            animal.deleted_at === null &&
            !animal.reservado_adopcion &&
            typeof desc === "string" &&
            desc.trim().length >= 50 &&
            desc.trim().length <= 2000 &&
            (fotos?.length ?? 0) > 0;

        return {
            id_perfil_adopcion: perfil?.id_perfil_adopcion ?? null,
            id_animal: idAnimal,
            descripcion_publica: desc,
            publicado: perfil?.publicado ?? false,
            fecha_publicacion: perfil?.fecha_publicacion ?? null,
            fecha_despublicacion: perfil?.fecha_despublicacion ?? null,
            puede_publicarse: puedePublicarse,
            bloqueos: [],
            fotos: (fotos ?? []).map((f) => ({
                id_fotografia: f.id_fotografia,
                url_archivo: f.url_archivo,
                url_thumbnail: f.url_thumbnail,
                es_principal: f.es_principal,
                orden: f.orden,
            })),
        };
    }

    async upsert(
        idAnimal: number,
        body: { descripcion_publica?: string | null; publicado: boolean },
        idUsuario: number,
    ) {
        const { data, error } = await this.supabase.rpc("publicar_perfil_adopcion", {
            p_id_animal: idAnimal,
            p_descripcion_publica: body.descripcion_publica ?? undefined,
            p_publicado: body.publicado,
            p_id_usuario: idUsuario,
        });
        if (error) throw error;
        const envelope = parseEnvelope(data);
        if (!envelope.ok) {
            throwForProfileCode(envelope.code, envelope.message, envelope.details);
        }
        return envelope.data ?? {};
    }
}