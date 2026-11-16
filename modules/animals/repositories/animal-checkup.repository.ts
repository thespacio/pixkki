import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { AnimalNotFoundError } from "../errors";
import type { AnimalAccess } from "../access";
import type { CreateChequeoInput } from "../validators/animal.validators";

export type AnimalCheckup = {
    idChequeo: number;
    idAnimal: number;
    idRefugio: number;
    pesoKg: number;
    temperaturaC: number;
    frecuenciaCardiaca: number;
    frecuenciaRespiratoria: number;
    sintomas: string[];
    sintomaOtroDetalle: string | null;
    observaciones: string | null;
    idUsuario: number;
    fechaChequeo: string;
};

type CheckupRow = {
    id_chequeo: number;
    id_animal: number;
    id_refugio: number;
    peso_kg: number;
    temperatura_c: number;
    frecuencia_cardiaca: number;
    frecuencia_respiratoria: number;
    sintoma_otro_detalle: string | null;
    observaciones: string | null;
    id_usuario: number;
    fecha_chequeo: string;
};

function toDomain(row: CheckupRow, sintomas: string[]): AnimalCheckup {
    return {
        idChequeo: Number(row.id_chequeo),
        idAnimal: row.id_animal,
        idRefugio: row.id_refugio,
        pesoKg: Number(row.peso_kg),
        temperaturaC: Number(row.temperatura_c),
        frecuenciaCardiaca: row.frecuencia_cardiaca,
        frecuenciaRespiratoria: row.frecuencia_respiratoria,
        sintomas,
        sintomaOtroDetalle: row.sintoma_otro_detalle,
        observaciones: row.observaciones,
        idUsuario: row.id_usuario,
        fechaChequeo: row.fecha_chequeo,
    };
}

export class AnimalCheckupRepository {
    constructor(private readonly supabase: SupabaseClient<Database>) {}

    private refugioDe(access: AnimalAccess): number | null {
        return access.allShelters ? null : access.shelterId;
    }

    private async assertAnimal(idAnimal: number, idRefugio: number | null): Promise<void> {
        let query = this.supabase
            .from("animal")
            .select("id_animal")
            .eq("id_animal", idAnimal)
            .is("deleted_at", null);
        if (idRefugio !== null) query = query.eq("id_refugio", idRefugio);
        const { data, error } = await query.maybeSingle();
        if (error) throw error;
        if (!data) throw new AnimalNotFoundError(idAnimal);
    }

    async create(
        idAnimal: number,
        access: AnimalAccess,
        input: CreateChequeoInput,
        idUsuario: number,
    ): Promise<AnimalCheckup> {
        const idRefugioScope = this.refugioDe(access);
        await this.assertAnimal(idAnimal, idRefugioScope);

        // Resolver refugio real del animal (para superadmin/global scope)
        const { data: animal, error: animalError } = await this.supabase
            .from("animal")
            .select("id_animal, id_refugio")
            .eq("id_animal", idAnimal)
            .is("deleted_at", null)
            .maybeSingle();
        if (animalError) throw animalError;
        if (!animal) throw new AnimalNotFoundError(idAnimal);
        const idRefugio = animal.id_refugio;

        const payload = {
            id_animal: idAnimal,
            id_refugio: idRefugio,
            peso_kg: input.peso_kg,
            temperatura_c: input.temperatura_c,
            frecuencia_cardiaca: input.frecuencia_cardiaca,
            frecuencia_respiratoria: input.frecuencia_respiratoria,
            sintoma_otro_detalle: input.sintomas.includes("otro")
                ? (input.sintoma_otro_detalle ?? null)
                : null,
            observaciones: input.observaciones ?? null,
            id_usuario: idUsuario,
            ...(input.fecha_chequeo ? { fecha_chequeo: input.fecha_chequeo.toISOString() } : {}),
        };

        const { data: created, error } = await (this.supabase as unknown as SupabaseClient)
            .from("chequeos_medicos")
            .insert(payload)
            .select("*")
            .single();
        if (error) throw error;

        const sintomas = Array.from(new Set(input.sintomas));
        if (sintomas.length > 0) {
            const rows = sintomas.map((sintoma) => ({ id_chequeo: (created as CheckupRow).id_chequeo, sintoma }));
            const { error: symError } = await (this.supabase as unknown as SupabaseClient)
                .from("chequeo_sintomas")
                .insert(rows);
            if (symError) throw symError;
        }

        // Actualizar peso vigente del animal
        let weightUpdate = this.supabase
            .from("animal")
            .update({ peso: input.peso_kg })
            .eq("id_animal", idAnimal);
        if (idRefugioScope !== null) weightUpdate = weightUpdate.eq("id_refugio", idRefugioScope);
        const { error: weightError } = await weightUpdate;
        if (weightError) throw weightError;

        return toDomain(created as CheckupRow, sintomas);
    }

    async listByAnimal(idAnimal: number, access: AnimalAccess): Promise<AnimalCheckup[]> {
        const idRefugio = this.refugioDe(access);
        await this.assertAnimal(idAnimal, idRefugio);

        let query = (this.supabase as unknown as SupabaseClient)
            .from("chequeos_medicos")
            .select("*")
            .eq("id_animal", idAnimal)
            .order("fecha_chequeo", { ascending: false });
        if (idRefugio !== null) query = query.eq("id_refugio", idRefugio);
        const { data, error } = await query;
        if (error) throw error;

        const rows = (data ?? []) as CheckupRow[];
        if (rows.length === 0) return [];

        const ids = rows.map((r) => r.id_chequeo);
        const { data: symData, error: symError } = await (this.supabase as unknown as SupabaseClient)
            .from("chequeo_sintomas")
            .select("id_chequeo, sintoma")
            .in("id_chequeo", ids);
        if (symError) throw symError;

        const map = new Map<number, string[]>();
        for (const row of (symData ?? []) as Array<{ id_chequeo: number; sintoma: string }>) {
            const key = Number(row.id_chequeo);
            const arr = map.get(key) ?? [];
            arr.push(row.sintoma);
            map.set(key, arr);
        }

        return rows.map((row) => toDomain(row, map.get(Number(row.id_chequeo)) ?? []));
    }
}
