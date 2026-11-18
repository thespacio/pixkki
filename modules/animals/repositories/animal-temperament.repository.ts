import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import { AnimalNotFoundError, NivelesInvalidosError } from "../errors";
import type { AnimalAccess } from "../access";
import type { CreateEvaluacionTemperamentoInput } from "../validators/animal-temperament.validators";

export type TemperamentEvaluation = {
    idEvaluacion: number;
    idAnimal: number;
    idRefugio: number;
    comportamiento: string;
    nivelEnergia: string;
    aptoPerros: string;
    aptoGatos: string;
    aptoNinos: string;
    idUsuario: number;
    fechaEvaluacion: string;
    temperamentoVigente: string | null;
};

type Row = {
    id_evaluacion_temperamento: number;
    id_animal: number;
    id_refugio: number | null;
    comportamiento: string | null;
    nivel_energia: string | null;
    apto_perros: string | null;
    apto_gatos: string | null;
    apto_ninos: string | null;
    id_usuario: number;
    fecha_evaluacion: string;
};

type RpcEnvelope = { ok: boolean; code?: string; data?: Record<string, unknown> };

function parseEnvelope(value: Json | null): RpcEnvelope {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw new Error("No se pudo registrar la evaluación de temperamento.");
    }
    const envelope = value as Record<string, unknown>;
    return {
        ok: envelope.ok === true,
        code: typeof envelope.code === "string" ? envelope.code : undefined,
        data:
            typeof envelope.data === "object" && envelope.data !== null && !Array.isArray(envelope.data)
                ? (envelope.data as Record<string, unknown>)
                : undefined,
    };
}

function toDomain(row: Row): TemperamentEvaluation {
    return {
        idEvaluacion: Number(row.id_evaluacion_temperamento),
        idAnimal: row.id_animal,
        idRefugio: row.id_refugio ?? 0,
        comportamiento: row.comportamiento ?? "",
        nivelEnergia: row.nivel_energia ?? "",
        aptoPerros: row.apto_perros ?? "",
        aptoGatos: row.apto_gatos ?? "",
        aptoNinos: row.apto_ninos ?? "",
        idUsuario: row.id_usuario,
        fechaEvaluacion: row.fecha_evaluacion,
        temperamentoVigente: null,
    };
}

export class AnimalTemperamentRepository {
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
        input: CreateEvaluacionTemperamentoInput,
        idUsuario: number,
    ): Promise<TemperamentEvaluation> {
        await this.assertAnimal(idAnimal, this.refugioDe(access));

        const { data, error } = await this.supabase.rpc("registrar_evaluacion_temperamento", {
            p_id_animal: idAnimal,
            p_comportamiento: input.comportamiento,
            p_nivel_energia: input.nivel_energia,
            p_apto_perros: input.apto_perros,
            p_apto_gatos: input.apto_gatos,
            p_apto_ninos: input.apto_ninos,
            p_fecha_evaluacion: input.fecha_evaluacion
                ? input.fecha_evaluacion.toISOString()
                : undefined,
            p_id_usuario: idUsuario,
        });
        if (error) throw error;

        const envelope = parseEnvelope(data);
        if (!envelope.ok) {
            if (envelope.code === "NIVELES_INVALIDOS") throw new NivelesInvalidosError();
            if (envelope.code === "ANIMAL_NO_ENCONTRADO") {
                throw new AnimalNotFoundError(idAnimal);
            }
            throw new Error("No se pudo registrar la evaluación de temperamento.");
        }
        if (!envelope.data) throw new Error("No se pudo registrar la evaluación de temperamento.");

        const d = envelope.data;
        return {
            idEvaluacion: Number(d.id_evaluacion),
            idAnimal: Number(d.id_animal),
            idRefugio: Number(d.id_refugio),
            comportamiento: String(d.comportamiento ?? ""),
            nivelEnergia: String(d.nivel_energia ?? ""),
            aptoPerros: String(d.apto_perros ?? ""),
            aptoGatos: String(d.apto_gatos ?? ""),
            aptoNinos: String(d.apto_ninos ?? ""),
            idUsuario: Number(d.id_usuario),
            fechaEvaluacion: String(d.fecha_evaluacion ?? ""),
            temperamentoVigente: (d.temperamento_vigente as string | null) ?? null,
        };
    }

    async listByAnimal(
        idAnimal: number,
        access: AnimalAccess,
    ): Promise<TemperamentEvaluation[]> {
        const idRefugio = this.refugioDe(access);
        await this.assertAnimal(idAnimal, idRefugio);

        let query = this.supabase
            .from("evaluacion_temperamento")
            .select("*")
            .eq("id_animal", idAnimal)
            .order("fecha_evaluacion", { ascending: false });
        if (idRefugio !== null) query = query.eq("id_refugio", idRefugio);

        const { data, error } = await query;
        if (error) throw error;
        return ((data ?? []) as unknown as Row[]).map(toDomain);
    }
}
