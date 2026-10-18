import type { SupabaseClient } from "@supabase/supabase-js";
import type { AnimalState } from "../types/animal-state.types";
import {Database} from "@/types/database";

type Row = Database["public"]["Tables"]["animal_estado"]["Row"];

export class AnimalStateRepository {
    constructor(private readonly supabase: SupabaseClient<Database>) {}

    private toDomain(row: Row): AnimalState {
        return {
            idEstado: row.id_estado,
            nombreEstado: row.nombre_estado,
            descripcion: row.descripcion,
        };
    }

    async findAll(): Promise<AnimalState[]> {
        const { data, error } = await this.supabase
            .from("animal_estado")
            .select("*")
            .order("nombre_estado", { ascending: true });

        if (error) throw error;
        return data.map((row) => this.toDomain(row));
    }
}