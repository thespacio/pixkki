import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Campaign, CampaignAnimal, CampaignStatus } from "@/modules/campaigns/types";

type CampaignRow = Database["public"]["Tables"]["campana"]["Row"];
type CampaignUpdateRow = Database["public"]["Tables"]["campana"]["Update"];

type EmbeddedAnimal = {
    id_animal: number;
    nombre: string | null;
    especie: string;
    raza: string | null;
    sexo: string | null;
    edad_estimada: number | null;
};

type CampaignRowWithRelations = CampaignRow & {
    refugio: { nombre: string } | null;
    campana_animal: Array<{ animal: EmbeddedAnimal | null }> | null;
};

// Campaña + nombre del albergue + animales vinculados (a través de la tabla intermedia).
const SELECT_WITH_RELATIONS = `
  *,
  refugio:refugio(nombre),
  campana_animal(animal:animal(id_animal, nombre, especie, raza, sexo, edad_estimada))
`;

export type CampaignInsertData = {
    shelterId: number;
    title: string;
    content: string;
    hashtags: string[];
    callToAction: string | null;
    animalIds: number[];
    generatedByAi: boolean;
    aiModel: string | null;
    createdByUserId: number | null;
};

export type CampaignTextPatch = {
    title?: string;
    content?: string;
    hashtags?: string[];
    callToAction?: string | null;
};

export class CampaignRepository {
    constructor(private readonly supabase: SupabaseClient<Database>) {}

    private toDomain(row: CampaignRowWithRelations): Campaign {
        const animals: CampaignAnimal[] = (row.campana_animal ?? [])
            .map((link) => link.animal)
            .filter((a): a is EmbeddedAnimal => a !== null)
            .map((a) => ({
                idAnimal: a.id_animal,
                nombre: a.nombre,
                especie: a.especie,
                raza: a.raza,
                sexo: a.sexo,
                edadEstimada: a.edad_estimada,
            }))
            .sort((a, b) => a.idAnimal - b.idAnimal);

        return {
            id: row.id_campana,
            shelterId: row.id_refugio,
            shelterName: row.refugio?.nombre ?? null,
            title: row.titulo,
            content: row.contenido,
            hashtags: row.hashtags ?? [],
            callToAction: row.llamado_accion,
            status: row.estado as CampaignStatus,
            generatedByAi: row.generada_por_ia,
            aiModel: row.modelo_ia,
            createdAt: row.fecha_creacion,
            updatedAt: row.fecha_actualizacion,
            publishedAt: row.fecha_publicacion,
            animals,
        };
    }

    async findAllByShelter(shelterId: number): Promise<Campaign[]> {
        const { data, error } = await this.supabase
            .from("campana")
            .select(SELECT_WITH_RELATIONS)
            .eq("id_refugio", shelterId)
            .order("fecha_creacion", { ascending: false });

        if (error) throw error;
        return (data as unknown as CampaignRowWithRelations[]).map((row) => this.toDomain(row));
    }

    /** Todas las campañas de todos los albergues (uso exclusivo de superadmin). */
    async findAll(): Promise<Campaign[]> {
        const { data, error } = await this.supabase
            .from("campana")
            .select(SELECT_WITH_RELATIONS)
            .order("fecha_creacion", { ascending: false });

        if (error) throw error;
        return (data as unknown as CampaignRowWithRelations[]).map((row) => this.toDomain(row));
    }

    async findById(id: number): Promise<Campaign | null> {
        const { data, error } = await this.supabase
            .from("campana")
            .select(SELECT_WITH_RELATIONS)
            .eq("id_campana", id)
            .maybeSingle();

        if (error) throw error;
        return data ? this.toDomain(data as unknown as CampaignRowWithRelations) : null;
    }

    async shelterExists(shelterId: number): Promise<boolean> {
        const { count, error } = await this.supabase
            .from("refugio")
            .select("*", { count: "exact", head: true })
            .eq("id_refugio", shelterId);

        if (error) throw error;
        return (count ?? 0) > 0;
    }

    /**
     * Crea la campaña y sus vínculos con los animales. Son dos escrituras: si la
     * segunda falla, se elimina la campaña recién creada para no dejar una
     * publicación sin animales.
     */
    async create(data: CampaignInsertData): Promise<Campaign> {
        const { data: inserted, error } = await this.supabase
            .from("campana")
            .insert({
                id_refugio: data.shelterId,
                titulo: data.title,
                contenido: data.content,
                hashtags: data.hashtags,
                llamado_accion: data.callToAction,
                estado: "borrador",
                generada_por_ia: data.generatedByAi,
                modelo_ia: data.aiModel,
                id_usuario_creador: data.createdByUserId,
            })
            .select("id_campana")
            .single();

        if (error) throw error;
        const id = inserted.id_campana;

        const { error: linkError } = await this.supabase
            .from("campana_animal")
            .insert(data.animalIds.map((idAnimal) => ({ id_campana: id, id_animal: idAnimal })));

        if (linkError) {
            await this.supabase.from("campana").delete().eq("id_campana", id);
            throw linkError;
        }

        const created = await this.findById(id);
        if (!created) throw new Error("No se pudo leer la campaña recién creada");
        return created;
    }

    async updateText(id: number, patch: CampaignTextPatch): Promise<Campaign> {
        const update: CampaignUpdateRow = { fecha_actualizacion: new Date().toISOString() };
        if (patch.title !== undefined) update.titulo = patch.title;
        if (patch.content !== undefined) update.contenido = patch.content;
        if (patch.hashtags !== undefined) update.hashtags = patch.hashtags;
        if (patch.callToAction !== undefined) update.llamado_accion = patch.callToAction;

        const { error } = await this.supabase.from("campana").update(update).eq("id_campana", id);
        if (error) throw error;

        const updated = await this.findById(id);
        if (!updated) throw new Error("No se pudo leer la campaña actualizada");
        return updated;
    }

    async setStatus(id: number, status: CampaignStatus): Promise<Campaign> {
        const now = new Date().toISOString();
        const update: CampaignUpdateRow = { estado: status, fecha_actualizacion: now };
        // La fecha de publicación se fija al publicar y se conserva si luego se archiva.
        if (status === "publicada") update.fecha_publicacion = now;

        const { error } = await this.supabase.from("campana").update(update).eq("id_campana", id);
        if (error) throw error;

        const updated = await this.findById(id);
        if (!updated) throw new Error("No se pudo leer la campaña actualizada");
        return updated;
    }

    async delete(id: number): Promise<void> {
        const { error } = await this.supabase.from("campana").delete().eq("id_campana", id);
        if (error) throw error;
    }
}
