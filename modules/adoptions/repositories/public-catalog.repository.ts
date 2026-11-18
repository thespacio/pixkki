import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { PerfilNoEncontradoError, RefugioNoEncontradoError } from "../errors";
import type { CatalogQuery } from "../validators/catalog.validators";

export class PublicCatalogRepository {
    constructor(private readonly supabase: SupabaseClient<Database>) {}

    async list(query: CatalogQuery) {
        const from = (query.page - 1) * query.pageSize;
        const to = from + query.pageSize - 1;

        let q = this.supabase
            .from("animal_adopcion_publica")
            .select("*", { count: "exact" });

        if (query.refugio) q = q.eq("refugio->>slug", query.refugio);
        if (query.especie) q = q.ilike("especie", query.especie);
        if (query.sexo) q = q.eq("sexo", query.sexo);
        if (query.tamano) q = q.ilike("tamano", query.tamano);
        if (typeof query.edadMin === "number") q = q.gte("edad_estimada", query.edadMin);
        if (typeof query.edadMax === "number") q = q.lte("edad_estimada", query.edadMax);
        if (query.temperamento) q = q.ilike("temperamento", `%${query.temperamento}%`);
        if (query.q) {
            const term = `%${query.q}%`;
            q = q.or(
                `nombre.ilike.${term},especie.ilike.${term},raza.ilike.${term},color.ilike.${term},descripcion_publica.ilike.${term}`,
            );
        }

        const orden = (query.orden ?? "recientes").toLowerCase();
        if (orden === "antiguos") {
            q = q.order("fecha_publicacion", { ascending: true });
        } else if (orden === "edad_asc") {
            q = q.order("edad_estimada", { ascending: true, nullsFirst: false });
        } else if (orden === "edad_desc") {
            q = q.order("edad_estimada", { ascending: false, nullsFirst: false });
        } else {
            q = q.order("fecha_publicacion", { ascending: false });
        }

        const { data, error, count } = await q.range(from, to);
        if (error) throw error;

        const items = (data ?? []).map((row: any) => ({
            id_animal: row.id_animal,
            nombre: row.nombre,
            especie: row.especie,
            raza: row.raza,
            sexo: row.sexo,
            edad_estimada: row.edad_estimada,
            tamano: row.tamano,
            color: row.color,
            temperamento: row.temperamento,
            vacunado: row.vacunado,
            desparasitado: row.desparasitado,
            esterilizado: row.esterilizado,
            compatibilidad: row.compatibilidad ?? null,
            foto_principal: row.foto_principal ?? null,
            refugio: {
                slug: row.refugio?.slug ?? null,
                nombre: row.refugio?.nombre ?? null,
                ciudad: row.refugio?.ciudad ?? null,
                estado: row.refugio?.estado ?? null,
            },
            fecha_publicacion: row.fecha_publicacion,
        }));

        return { items, page: query.page, pageSize: query.pageSize, total: count ?? 0 };
    }

    async getAnimal(idAnimal: number) {
        const { data, error } = await this.supabase
            .from("animal_adopcion_publica")
            .select("*")
            .eq("id_animal", idAnimal)
            .maybeSingle();
        if (error) throw error;
        if (!data) throw new PerfilNoEncontradoError();

        const row = data as any;
        return {
            id_animal: row.id_animal,
            nombre: row.nombre,
            especie: row.especie,
            raza: row.raza,
            sexo: row.sexo,
            edad_estimada: row.edad_estimada,
            tamano: row.tamano,
            color: row.color,
            temperamento: row.temperamento,
            vacunado: row.vacunado,
            desparasitado: row.desparasitado,
            esterilizado: row.esterilizado,
            rasgos_fisicos: row.rasgos_fisicos,
            descripcion_publica: row.descripcion_publica,
            compatibilidad: row.compatibilidad ?? null,
            fotos: row.fotos ?? [],
            refugio: row.refugio ?? null,
            fecha_publicacion: row.fecha_publicacion,
        };
    }

    async listRefugios() {
        const { data, error } = await this.supabase
            .from("refugio_publico")
            .select("*")
            .order("nombre", { ascending: true });
        if (error) throw error;
        return { refugios: data ?? [] };
    }

    async getRefugio(slug: string) {
        const { data, error } = await this.supabase
            .from("refugio_publico")
            .select("*")
            .eq("slug", slug)
            .maybeSingle();
        if (error) throw error;
        if (!data) throw new RefugioNoEncontradoError();
        return { refugio: data };
    }

    async listByRefugio(slug: string, query: CatalogQuery) {
        await this.getRefugio(slug);
        return this.list({ ...query, refugio: slug });
    }
}