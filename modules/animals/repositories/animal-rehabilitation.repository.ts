import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { AnimalNotFoundError } from "../errors";
import type { AnimalAccess } from "../access";
import type { CreateRehabilitacionInput } from "../validators/animal-rehabilitation.validators";

export type RehabilitationEntry = {
    idRehabilitacion: number;
    idAnimal: number;
    idRefugio: number;
    tipo: string;
    fechaInicio: string;
    fechaFin: string | null;
    objetivo: string;
    observaciones: string | null;
    idUsuario: number;
    fechaRegistro: string;
};

type Row = {
    id_rehabilitacion: number;
    id_animal: number;
    id_refugio: number;
    tipo: string;
    fecha_inicio: string;
    fecha_fin: string | null;
    objetivo: string;
    observaciones: string | null;
    id_usuario: number;
    fecha_registro: string;
};

function toDomain(row: Row): RehabilitationEntry {
    return {
        idRehabilitacion: Number(row.id_rehabilitacion),
        idAnimal: row.id_animal,
        idRefugio: row.id_refugio,
        tipo: row.tipo,
        fechaInicio: row.fecha_inicio,
        fechaFin: row.fecha_fin,
        objetivo: row.objetivo,
        observaciones: row.observaciones,
        idUsuario: row.id_usuario,
        fechaRegistro: row.fecha_registro,
    };
}

export class AnimalRehabilitationRepository {
    constructor(private readonly supabase: SupabaseClient<Database>) {}

    private refugioDe(access: AnimalAccess): number | null {
        return access.allShelters ? null : access.shelterId;
    }

    private async getAnimal(idAnimal: number, idRefugio: number | null) {
        let query = this.supabase
            .from("animal")
            .select("id_animal, id_refugio")
            .eq("id_animal", idAnimal)
            .is("deleted_at", null);
        if (idRefugio !== null) query = query.eq("id_refugio", idRefugio);
        const { data, error } = await query.maybeSingle();
        if (error) throw error;
        if (!data) throw new AnimalNotFoundError(idAnimal);
        return data;
    }

    async create(
        idAnimal: number,
        access: AnimalAccess,
        input: CreateRehabilitacionInput,
        idUsuario: number,
    ): Promise<RehabilitationEntry> {
        const animal = await this.getAnimal(idAnimal, this.refugioDe(access));

        const { data, error } = await this.supabase
            .from("rehabilitacion")
            .insert({
                id_animal: idAnimal,
                id_refugio: animal.id_refugio,
                id_usuario: idUsuario,
                tipo: input.tipo,
                fecha_inicio: input.fecha_inicio,
                fecha_fin: input.fecha_fin ?? null,
                objetivo: input.objetivo.trim(),
                observaciones: input.observaciones ?? null,
            })
            .select("*")
            .single();
        if (error) throw error;
        return toDomain(data as Row);
    }

    async listByAnimal(
        idAnimal: number,
        access: AnimalAccess,
    ): Promise<RehabilitationEntry[]> {
        const idRefugio = this.refugioDe(access);
        await this.getAnimal(idAnimal, idRefugio);

        let query = this.supabase
            .from("rehabilitacion")
            .select("*")
            .eq("id_animal", idAnimal)
            .order("fecha_inicio", { ascending: false });
        if (idRefugio !== null) query = query.eq("id_refugio", idRefugio);

        const { data, error } = await query;
        if (error) throw error;
        return ((data ?? []) as unknown as Row[]).map(toDomain);
    }
}
