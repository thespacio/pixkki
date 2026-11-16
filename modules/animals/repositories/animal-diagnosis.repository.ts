// modules/animals/repositories/animal-diagnosis.repository.ts

import type { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";
import { AnimalNotFoundError } from "../types/animales.types";

type DiagnosticoRow = Database["public"]["Tables"]["diagnostico_veterinario"]["Row"];
type DiagnosticoInsert =
    Database["public"]["Tables"]["diagnostico_veterinario"]["Insert"];

const SELECT_COLUMNS = `
    id_diagnostico,
    id_animal,
    estado_general,
    requiere_cuarentena,
    descripcion,
    tratamiento_inicial,
    requiere_cirugia,
    id_usuario,
    fecha_diagnostico
`;

/** Diagnóstico veterinario expuesto al dominio (camelCase). */
export type AnimalDiagnosis = {
    idDiagnostico: number;
    idAnimal: number;
    estadoGeneral: string;
    requiereCuarentena: boolean;
    observaciones: string | null;
    tratamientoInicial: string | null;
    requiereCirugia: boolean;
    idUsuarioVeterinario: number;
    fechaDiagnostico: string;
};

function toDomain(row: DiagnosticoRow): AnimalDiagnosis {
    return {
        idDiagnostico: row.id_diagnostico,
        idAnimal: row.id_animal,
        estadoGeneral: row.estado_general,
        requiereCuarentena: row.requiere_cuarentena,
        // La tabla real llama `descripcion` a las observaciones médicas.
        observaciones: row.descripcion.trim() === "" ? null : row.descripcion,
        tratamientoInicial: row.tratamiento_inicial,
        requiereCirugia: row.requiere_cirugia,
        idUsuarioVeterinario: row.id_usuario,
        fechaDiagnostico: row.fecha_diagnostico,
    };
}

/**
 * Repository de diagnósticos veterinarios de ingreso.
 * Único punto de acceso a Supabase para `diagnostico_veterinario`.
 *
 * La tabla real no tiene `id_refugio`: antes de leer o escribir se comprueba
 * que el animal pertenezca al refugio de la sesión.
 */
export class AnimalDiagnosisRepository {
    constructor(private readonly supabase: SupabaseClient<Database>) {}

    /**
     * 404 cuando el animal no existe o pertenece a otro refugio.
     * `idRefugio === null` significa superadmin: se omite el filtro de tenant.
     */
    private async assertAnimal(
        idAnimal: number,
        idRefugio: number | null,
    ): Promise<void> {
        let query = this.supabase
            .from("animal")
            .select("id_animal")
            .eq("id_animal", idAnimal)
            .is("deleted_at", null);

        if (idRefugio !== null) {
            query = query.eq("id_refugio", idRefugio);
        }

        const { data, error } = await query.maybeSingle();

        if (error) throw error;
        if (!data) throw new AnimalNotFoundError(idAnimal);
    }

    /** Crea un diagnóstico de ingreso vinculado al animal y refugio. */
    async create(
        idAnimal: number,
        idRefugio: number | null,
        data: {
            estadoGeneral: string;
            requiereCuarentena: boolean;
            observaciones: string | null;
        },
        idUsuarioVeterinario: number,
    ): Promise<AnimalDiagnosis> {
        await this.assertAnimal(idAnimal, idRefugio);

        const insert: DiagnosticoInsert = {
            id_animal: idAnimal,
            estado_general: data.estadoGeneral,
            requiere_cuarentena: data.requiereCuarentena,
            descripcion: data.observaciones ?? "",
            tratamiento_inicial: null,
            id_usuario: idUsuarioVeterinario,
        };

        const { data: result, error } = await this.supabase
            .from("diagnostico_veterinario")
            .insert(insert)
            .select(SELECT_COLUMNS)
            .single();

        if (error) throw error;
        return toDomain(result);
    }

    /** Lista los diagnósticos de un animal (solo su refugio). */
    async listByAnimal(
        idAnimal: number,
        idRefugio: number | null,
    ): Promise<AnimalDiagnosis[]> {
        await this.assertAnimal(idAnimal, idRefugio);

        const { data, error } = await this.supabase
            .from("diagnostico_veterinario")
            .select(SELECT_COLUMNS)
            .eq("id_animal", idAnimal)
            .order("fecha_diagnostico", { ascending: false });

        if (error) throw error;
        return data.map(toDomain);
    }
}
