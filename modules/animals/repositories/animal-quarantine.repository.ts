import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import { AnimalNotFoundError, QuarantineAlreadyReleasedError } from "../errors";
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

type AltaRpcEnvelope = {
    ok: boolean;
    code?: string;
    data?: Record<string, unknown>;
};

function parseAltaEnvelope(value: Json | null): AltaRpcEnvelope {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw new Error("Respuesta inválida de la RPC de alta de cuarentena.");
    }
    const envelope = value as Record<string, unknown>;
    return {
        ok: envelope.ok === true,
        code: typeof envelope.code === "string" ? envelope.code : undefined,
        data:
            typeof envelope.data === "object" &&
            envelope.data !== null &&
            !Array.isArray(envelope.data)
                ? (envelope.data as Record<string, unknown>)
                : undefined,
    };
}

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

        let query = this.supabase
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

        // RF2.4 (regla 15): UPDATE condicional e INSERT del alta en una única
        // transacción. La RPC devuelve `ok: false` si otro proceso liberó al
        // paciente primero, sin dejar registros huérfanos ni compensaciones.
        const { data, error } = await this.supabase.rpc("registrar_alta_cuarentena", {
            p_id_animal: idAnimal,
            p_observaciones: input.observaciones.trim(),
            p_fecha_alta: input.fecha_alta
                ? input.fecha_alta.toISOString()
                : new Date().toISOString(),
            p_id_usuario: idUsuarioVeterinario,
        });
        if (error) throw error;

        const envelope = parseAltaEnvelope(data);
        if (!envelope.ok || envelope.code === "CUARENTENA_YA_LIBERADA") {
            throw new QuarantineAlreadyReleasedError();
        }
        if (!envelope.data) {
            throw new Error("Respuesta inválida de la RPC de alta de cuarentena.");
        }

        const alta = envelope.data;
        return {
            idAlta: Number(alta.id_alta),
            idAnimal: Number(alta.id_animal),
            idRefugio: Number(alta.id_refugio),
            observaciones: String(alta.observaciones),
            idUsuarioVeterinario: Number(alta.id_usuario_veterinario),
            fechaAlta: String(alta.fecha_alta),
            enCuarentena: false,
        };
    }
}
