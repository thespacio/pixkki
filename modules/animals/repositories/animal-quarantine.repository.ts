import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { AnimalNotFoundError } from "../errors";
import { QuarantineAlreadyReleasedError } from "../errors";
import type { AnimalAccess } from "../access";
import type { CreateAltaCuarentenaInput } from "../validators/animal.validators";

export type QuarantineStatus = {
    idAnimal: number;
    enCuarentena: boolean;
    alerta: { codigo: "AISLAMIENTO_RIESGO_BIOLOGICO"; color: "rojo"; texto: "AISLAMIENTO / RIESGO BIOLÓGICO" } | null;
    fechaIngreso: string;
    alta: QuarantineRelease | null;
    historialAltas: QuarantineRelease[];
};

export type QuarantineRelease = {
    idAlta: number;
    idAnimal: number;
    idRefugio: number;
    observaciones: string;
    idUsuarioVeterinario: number;
    fechaAlta: string;
};

type AltaRow = {
    id_alta: number;
    id_animal: number;
    id_refugio: number;
    observaciones: string;
    id_usuario_veterinario: number;
    fecha_alta: string;
};

function toRelease(row: AltaRow): QuarantineRelease {
    return {
        idAlta: Number(row.id_alta),
        idAnimal: row.id_animal,
        idRefugio: row.id_refugio,
        observaciones: row.observaciones,
        idUsuarioVeterinario: row.id_usuario_veterinario,
        fechaAlta: row.fecha_alta,
    };
}

export class AnimalQuarantineRepository {
    constructor(private readonly supabase: SupabaseClient<Database>) {}

    private refugioDe(access: AnimalAccess): number | null {
        return access.allShelters ? null : access.shelterId;
    }

    private async getAnimal(idAnimal: number, idRefugio: number | null) {
        let query = this.supabase
            .from("animal")
            .select("id_animal, id_refugio, en_cuarentena, fecha_ingreso")
            .eq("id_animal", idAnimal)
            .is("deleted_at", null);
        if (idRefugio !== null) query = query.eq("id_refugio", idRefugio);
        const { data, error } = await query.maybeSingle();
        if (error) throw error;
        if (!data) throw new AnimalNotFoundError(idAnimal);
        return data;
    }

    async getStatus(idAnimal: number, access: AnimalAccess): Promise<QuarantineStatus> {
        const idRefugio = this.refugioDe(access);
        const animal = await this.getAnimal(idAnimal, idRefugio);

        let query = (this.supabase as unknown as SupabaseClient)
            .from("altas_cuarentena")
            .select("*")
            .eq("id_animal", idAnimal)
            .order("fecha_alta", { ascending: false });
        if (idRefugio !== null) query = query.eq("id_refugio", idRefugio);
        const { data, error } = await query;
        if (error) throw error;

        const releases = ((data ?? []) as AltaRow[]).map(toRelease);
        const latest = releases[0] ?? null;
        const enCuarentena = Boolean(animal.en_cuarentena);

        return {
            idAnimal,
            enCuarentena,
            alerta: enCuarentena
                ? {
                      codigo: "AISLAMIENTO_RIESGO_BIOLOGICO",
                      color: "rojo",
                      texto: "AISLAMIENTO / RIESGO BIOLÓGICO",
                  }
                : null,
            fechaIngreso: animal.fecha_ingreso as string,
            alta: enCuarentena ? null : latest,
            historialAltas: releases,
        };
    }

    async release(
        idAnimal: number,
        access: AnimalAccess,
        input: CreateAltaCuarentenaInput,
        idUsuarioVeterinario: number,
    ): Promise<QuarantineRelease & { enCuarentena: false }> {
        const idRefugioScope = this.refugioDe(access);
        const animal = await this.getAnimal(idAnimal, idRefugioScope);

        if (!animal.en_cuarentena) {
            throw new QuarantineAlreadyReleasedError();
        }

        const payload = {
            id_animal: idAnimal,
            id_refugio: animal.id_refugio,
            observaciones: input.observaciones.trim(),
            id_usuario_veterinario: idUsuarioVeterinario,
            ...(input.fecha_alta ? { fecha_alta: input.fecha_alta.toISOString() } : {}),
        };

        const { data: created, error: insertError } = await (this.supabase as unknown as SupabaseClient)
            .from("altas_cuarentena")
            .insert(payload)
            .select("*")
            .single();
        if (insertError) throw insertError;

        let update = this.supabase
            .from("animal")
            .update({ en_cuarentena: false })
            .eq("id_animal", idAnimal)
            .eq("en_cuarentena", true);
        if (idRefugioScope !== null) update = update.eq("id_refugio", idRefugioScope);
        const { error: updateError, data: updatedRows } = await update.select("id_animal");
        if (updateError) throw updateError;
        if (!updatedRows || updatedRows.length === 0) {
            // Carrera: otro proceso liberó primero
            throw new QuarantineAlreadyReleasedError();
        }

        return { ...toRelease(created as AltaRow), enCuarentena: false };
    }
}
