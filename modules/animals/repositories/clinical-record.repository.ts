// modules/animals/repositories/clinical-record.repository.ts

import type { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

type AnimalRow = Database["public"]["Tables"]["animal"]["Row"];

type AnimalRowWithRelations = AnimalRow & {
    espacio: { id_espacio: number; nombre_espacio: string } | null;
    animal_estado: { id_estado: number; nombre_estado: string } | null;
    refugio: { id_refugio: number; nombre: string } | null;
};

export type ClinicalAnimal = {
    idAnimal: number;
    uuid: string | null;
    idRefugio: number;
    refugioNombre: string | null;
    idEspacio: number;
    espacioNombre: string | null;
    idEstado: number;
    estadoNombre: string | null;
    nombre: string | null;
    especie: string;
    raza: string | null;
    sexo: string | null;
    edadEstimada: number | null;
    peso: number | null;
    procedencia: string;
    rasgosFisicos: string;
    estadoInicial: string;
    fechaIngreso: string;
    enCuarentena: boolean;
    disponibleAdopcion: boolean;
    esterilizado: boolean;
    vacunado: boolean;
    desparasitado: boolean;
    observaciones: string | null;
};

export type ClinicalImage = {
    idImagen: number;
    urlPublica: string;
    urlThumbnail: string | null;
    esPortada: boolean;
    orden: number;
    formato: string | null;
};

export type ClinicalDiagnosis = {
    idDiagnostico: number;
    estadoGeneral: string;
    requiereCuarentena: boolean;
    observaciones: string | null;
    idUsuarioVeterinario: number;
    fechaDiagnostico: string;
};

export type ClinicalVaccination = {
    idVacunacion: number;
    tipoBiologico: string;
    fechaAplicacion: string;
    fechaRefuerzo: string | null;
    esquemaCompleto: boolean;
    observaciones: string | null;
};

export type ClinicalTemperament = {
    idEvaluacion: number;
    fechaEvaluacion: string;
    comportamiento: string | null;
    nivelEnergia: string | null;
    aptoPerros: string | null;
    aptoGatos: string | null;
    aptoNinos: string | null;
};

export type ClinicalSurgery = {
    idCirugia: number;
    tipoCirugia: string;
    fechaCirugia: string;
    exitosa: boolean;
    notasPostoperatorias: string | null;
};

export type ClinicalRecordData = {
    animal: ClinicalAnimal;
    imagenes: ClinicalImage[];
    diagnosticos: ClinicalDiagnosis[];
    vacunaciones: ClinicalVaccination[];
    evaluacionesTemperamento: ClinicalTemperament[];
    cirugias: ClinicalSurgery[];
};

function toAnimalDomain(row: AnimalRowWithRelations): ClinicalAnimal {
    return {
        idAnimal: row.id_animal,
        uuid: row.uuid,
        idRefugio: row.id_refugio,
        refugioNombre: row.refugio?.nombre ?? null,
        idEspacio: row.id_espacio,
        espacioNombre: row.espacio?.nombre_espacio ?? null,
        idEstado: row.id_estado,
        estadoNombre: row.animal_estado?.nombre_estado ?? null,
        nombre: row.nombre,
        especie: row.especie,
        raza: row.raza,
        sexo: row.sexo,
        edadEstimada: row.edad_estimada,
        peso: row.peso,
        procedencia: row.procedencia,
        rasgosFisicos: row.rasgos_fisicos,
        estadoInicial: row.estado_inicial,
        fechaIngreso: row.fecha_ingreso,
        enCuarentena: row.en_cuarentena,
        disponibleAdopcion: row.disponible_adopcion,
        esterilizado: row.esterilizado,
        vacunado: row.vacunado,
        desparasitado: row.desparasitado,
        observaciones: row.observaciones,
    };
}

/**
 * Repository de lectura de la ficha clínica centralizada (RF1.4, US08).
 * Solo lectura: agrega animal, imágenes y el historial clínico disponible.
 * Siempre filtra por `id_refugio` en la consulta raíz (animal).
 */
export class ClinicalRecordRepository {
    constructor(private readonly supabase: SupabaseClient<Database>) {}

    /** Obtiene la ficha clínica completa de un animal (solo su refugio). */
    async getByAnimal(
        idAnimal: number,
        idRefugio: number | null,
    ): Promise<ClinicalRecordData | null> {
        let query = this.supabase
            .from("animal")
            .select(`
                *,
                espacio:espacio(id_espacio, nombre_espacio),
                animal_estado:animal_estado(id_estado, nombre_estado),
                refugio:refugio(id_refugio, nombre)
            `)
            .eq("id_animal", idAnimal)
            .is("deleted_at", null);

        // `null` = superadmin: puede leer la ficha de cualquier refugio.
        if (idRefugio !== null) {
            query = query.eq("id_refugio", idRefugio);
        }

        const { data: animal, error: animalError } = await query.maybeSingle();

        if (animalError) throw animalError;
        if (!animal) return null;

        const [
            { data: imagenes, error: imagenesError },
            { data: diagnosticos, error: diagnosticosError },
            { data: vacunaciones, error: vacunacionesError },
            { data: evaluaciones, error: evaluacionesError },
            { data: cirugias, error: cirugiasError },
        ] = await Promise.all([
            this.supabase
                .from("fotografia")
                .select(
                    "id_fotografia, url_archivo, url_thumbnail, es_principal, orden, formato",
                )
                .eq("id_animal", idAnimal)
                .order("orden", { ascending: true })
                .order("id_fotografia", { ascending: true }),
            this.supabase
                .from("diagnostico_veterinario")
                .select(
                    "id_diagnostico, estado_general, requiere_cuarentena, descripcion, id_usuario, fecha_diagnostico",
                )
                .eq("id_animal", idAnimal)
                .order("fecha_diagnostico", { ascending: false }),
            this.supabase
                .from("vacunacion")
                .select(
                    "id_vacunacion, tipo_biologico, fecha_aplicacion, fecha_refuerzo, esquema_completo, observaciones",
                )
                .eq("id_animal", idAnimal)
                .order("fecha_aplicacion", { ascending: false }),
            this.supabase
                .from("evaluacion_temperamento")
                .select(
                    "id_evaluacion_temperamento, fecha_evaluacion, comportamiento, nivel_energia, apto_perros, apto_gatos, apto_ninos",
                )
                .eq("id_animal", idAnimal)
                .order("fecha_evaluacion", { ascending: false }),
            this.supabase
                .from("cirugia_reproductiva")
                .select(
                    "id_cirugia, tipo_cirugia, fecha_cirugia, exitosa, notas_postoperatorias",
                )
                .eq("id_animal", idAnimal)
                .order("fecha_cirugia", { ascending: false }),
        ]);

        if (imagenesError) throw imagenesError;
        if (diagnosticosError) throw diagnosticosError;
        if (vacunacionesError) throw vacunacionesError;
        if (evaluacionesError) throw evaluacionesError;
        if (cirugiasError) throw cirugiasError;

        return {
            animal: toAnimalDomain(animal as unknown as AnimalRowWithRelations),
            imagenes: (imagenes ?? []).map((row) => ({
                idImagen: row.id_fotografia,
                urlPublica: row.url_archivo,
                urlThumbnail: row.url_thumbnail,
                esPortada: row.es_principal,
                orden: row.orden,
                formato: row.formato,
            })),
            diagnosticos: (diagnosticos ?? []).map((row) => ({
                idDiagnostico: row.id_diagnostico,
                estadoGeneral: row.estado_general,
                requiereCuarentena: row.requiere_cuarentena,
                observaciones:
                    row.descripcion.trim() === "" ? null : row.descripcion,
                idUsuarioVeterinario: row.id_usuario,
                fechaDiagnostico: row.fecha_diagnostico,
            })),
            vacunaciones: (vacunaciones ?? []).map((row) => ({
                idVacunacion: row.id_vacunacion,
                tipoBiologico: row.tipo_biologico,
                fechaAplicacion: row.fecha_aplicacion,
                fechaRefuerzo: row.fecha_refuerzo,
                esquemaCompleto: row.esquema_completo,
                observaciones: row.observaciones,
            })),
            evaluacionesTemperamento: (evaluaciones ?? []).map(
                (row) => ({
                    idEvaluacion: row.id_evaluacion_temperamento,
                    fechaEvaluacion: row.fecha_evaluacion,
                    comportamiento: row.comportamiento,
                    nivelEnergia: row.nivel_energia,
                    aptoPerros: row.apto_perros,
                    aptoGatos: row.apto_gatos,
                    aptoNinos: row.apto_ninos,
                }),
            ),
            cirugias: (cirugias ?? []).map((row) => ({
                idCirugia: row.id_cirugia,
                tipoCirugia: row.tipo_cirugia,
                fechaCirugia: row.fecha_cirugia,
                exitosa: row.exitosa,
                notasPostoperatorias: row.notas_postoperatorias,
            })),
        };
    }
}
