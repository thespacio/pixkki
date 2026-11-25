import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import {
    AnimalNoDisponiblePublicacionError,
    AnimalNoEncontradoError,
    DatosInvalidosError,
    DescripcionInvalidaError,
    ErrorInternoAdopcionesError,
    PerfilSinFotografiaError,
} from "../errors";
import { evaluarElegibilidadPublicacion, traducirBloqueos } from "../services/profile-eligibility";
import { parseEnvelope } from "./rpc-envelope";

function throwForProfileCode(code: string | undefined, message?: string, details?: Record<string, unknown>): never {
    switch (code) {
        case "ANIMAL_NO_ENCONTRADO":
            throw new AnimalNoEncontradoError();
        case "PERFIL_SIN_FOTOGRAFIA":
            throw new PerfilSinFotografiaError();
        case "ANIMAL_NO_DISPONIBLE": {
            const codigos = Array.isArray(details?.bloqueos)
                ? (details.bloqueos as unknown[]).filter((b): b is string => typeof b === "string")
                : [];
            throw new AnimalNoDisponiblePublicacionError({ bloqueos: traducirBloqueos(codigos) });
        }
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

    private scope<T>(query: T, idRefugio: number | null): T {
        if (idRefugio === null) return query;
        return (query as T & { eq: (column: string, value: number) => T }).eq("id_refugio", idRefugio);
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

        const fq = this.supabase
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
        const elegibilidad = evaluarElegibilidadPublicacion({
            disponibleAdopcion: !!animal.disponible_adopcion,
            enCuarentena: !!animal.en_cuarentena,
            activo: !!animal.activo,
            eliminado: animal.deleted_at !== null,
            reservadoAdopcion: !!animal.reservado_adopcion,
            descripcionPublica: typeof desc === "string" ? desc : null,
            cantidadFotos: fotos?.length ?? 0,
        });

        return {
            id_perfil_adopcion: perfil?.id_perfil_adopcion ?? null,
            id_animal: idAnimal,
            id_refugio: perfil?.id_refugio ?? null,
            disponible_adopcion: !!animal.disponible_adopcion,
            descripcion_publica: desc,
            publicado: perfil?.publicado ?? false,
            fecha_publicacion: perfil?.fecha_publicacion ?? null,
            fecha_despublicacion: perfil?.fecha_despublicacion ?? null,
            updated_at: perfil?.updated_at ?? null,
            puede_publicarse: elegibilidad.puedePublicarse,
            bloqueos: elegibilidad.bloqueos,
            fotos: (fotos ?? []).map((f) => ({
                id_fotografia: f.id_fotografia,
                url_archivo: f.url_archivo,
                url_thumbnail: f.url_thumbnail,
                es_principal: f.es_principal,
                orden: f.orden,
            })),
        };
    }

    /**
     * Composición G-01 por lotes: perfiles y fotos de varios animales en dos
     * consultas. Los `id_animal` llegan ya filtrados por tenant desde el
     * servicio de animales; `fotografia` no tiene `id_refugio` propio.
     */
    async listByAnimalIds(ids: number[], idRefugio: number | null) {
        if (ids.length === 0) return { perfiles: [], fotos: [] };

        let pq = this.supabase
            .from("perfil_adopcion")
            .select("*")
            .in("id_animal", ids);
        pq = this.scope(pq, idRefugio);
        const { data: perfiles, error: pErr } = await pq;
        if (pErr) throw pErr;

        const { data: fotos, error: fErr } = await this.supabase
            .from("fotografia")
            .select("id_animal, id_fotografia, url_archivo, url_thumbnail, es_principal, orden")
            .in("id_animal", ids)
            .order("es_principal", { ascending: false })
            .order("orden", { ascending: true })
            .order("id_fotografia", { ascending: true });
        if (fErr) throw fErr;

        return { perfiles: perfiles ?? [], fotos: fotos ?? [] };
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