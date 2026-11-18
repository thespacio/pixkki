// modules/animals/repositories/clinical-record.repository.ts

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

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
    reservadoAdopcion: boolean;
    fechaAdopcion: string | null;
    activo: boolean;
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
    tipoEvento?: "vacunacion" | "desparasitacion";
};

export type ClinicalCheckup = {
    idChequeo: number;
    fechaChequeo: string;
    pesoKg: number;
    temperaturaC: number;
    frecuenciaCardiaca: number;
    frecuenciaRespiratoria: number;
    sintomas: string[];
    sintomaOtroDetalle: string | null;
    observaciones: string | null;
    idUsuario: number;
};

export type ClinicalQuarantineRelease = {
    idAlta: number;
    fechaAlta: string;
    observaciones: string;
    idUsuarioVeterinario: number;
};

export type ClinicalTransfer = {
    idTraslado: number;
    fechaTraslado: string;
    idEspacioOrigen: number;
    idEspacioDestino: number;
    motivo: string | null;
};

export type ClinicalRehabilitation = {
    idRehabilitacion: number;
    fechaInicio: string;
    fechaFin: string | null;
    tipo: string;
    objetivo: string;
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

export type ClinicalSurgerySupply = {
    idLoteInventario: number;
    nombreInsumo: string;
    cantidad: number;
};

export type ClinicalSurgery = {
    idCirugia: number;
    tipoCirugia: string;
    fechaCirugia: string;
    exitosa: boolean;
    notasPostoperatorias: string | null;
    idUsuario: number;
    insumos: ClinicalSurgerySupply[];
};

export type ClinicalRecordData = {
    animal: ClinicalAnimal;
    imagenes: ClinicalImage[];
    diagnosticos: ClinicalDiagnosis[];
    vacunaciones: ClinicalVaccination[];
    evaluacionesTemperamento: ClinicalTemperament[];
    cirugias: ClinicalSurgery[];
    chequeos: ClinicalCheckup[];
    altasCuarentena: ClinicalQuarantineRelease[];
    traslados: ClinicalTransfer[];
    rehabilitaciones: ClinicalRehabilitation[];
};

type SurgeryRowWithSupplies = {
    id_cirugia: number;
    tipo_cirugia: string;
    fecha_cirugia: string;
    exitosa: boolean;
    notas_postoperatorias: string | null;
    id_usuario: number;
    cirugia_insumo:
        | Array<{
              cantidad: number;
              id_lote_inventario: number;
              inventario_lote: {
                  inventario_insumo: { nombre: string } | null;
              } | null;
          }>
        | null;
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
        reservadoAdopcion: Boolean((row as any).reservado_adopcion),
        fechaAdopcion: ((row as any).fecha_adopcion as string | null) ?? null,
        activo: row.activo,
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

        const client = this.supabase;

        // Los chequeos y las altas filtran por refugio cuando el usuario no es
        // superadmin. El animal ya se validó arriba, pero el filtro explícito
        // mantiene la regla multitenant también en las tablas hijas.
        let chequeosQuery = client
            .from("chequeos_medicos")
            .select("id_chequeo, fecha_chequeo, peso_kg, temperatura_c, frecuencia_cardiaca, frecuencia_respiratoria, sintoma_otro_detalle, observaciones, id_usuario")
            .eq("id_animal", idAnimal)
            .order("fecha_chequeo", { ascending: false });
        if (idRefugio !== null) chequeosQuery = chequeosQuery.eq("id_refugio", idRefugio);

        let altasQuery = client
            .from("altas_cuarentena")
            .select("id_alta, fecha_alta, observaciones, id_usuario_veterinario")
            .eq("id_animal", idAnimal)
            .order("fecha_alta", { ascending: false });
        if (idRefugio !== null) altasQuery = altasQuery.eq("id_refugio", idRefugio);

        let eventosQuery = client
            .from("evento_sanitario")
            .select("id_evento, tipo_biologico, fecha_aplicacion, fecha_refuerzo, esquema_completo, observaciones, tipo_evento")
            .eq("id_animal", idAnimal)
            .order("fecha_aplicacion", { ascending: false });
        if (idRefugio !== null) eventosQuery = eventosQuery.eq("id_refugio", idRefugio);

        let evaluacionesQuery = client
            .from("evaluacion_temperamento")
            .select(
                "id_evaluacion_temperamento, fecha_evaluacion, comportamiento, nivel_energia, apto_perros, apto_gatos, apto_ninos",
            )
            .eq("id_animal", idAnimal)
            .order("fecha_evaluacion", { ascending: false });
        if (idRefugio !== null) evaluacionesQuery = evaluacionesQuery.eq("id_refugio", idRefugio);

        let trasladosQuery = client
            .from("traslado")
            .select("id_traslado, fecha_traslado, id_espacio_origen, id_espacio_destino, motivo")
            .eq("id_animal", idAnimal)
            .order("fecha_traslado", { ascending: false });
        if (idRefugio !== null) trasladosQuery = trasladosQuery.eq("id_refugio", idRefugio);

        let rehabilitacionesQuery = client
            .from("rehabilitacion")
            .select("id_rehabilitacion, fecha_inicio, fecha_fin, tipo, objetivo, observaciones")
            .eq("id_animal", idAnimal)
            .order("fecha_inicio", { ascending: false });
        if (idRefugio !== null) rehabilitacionesQuery = rehabilitacionesQuery.eq("id_refugio", idRefugio);

        let cirugiasQuery = client
            .from("cirugia_reproductiva")
            .select(
                "id_cirugia, tipo_cirugia, fecha_cirugia, exitosa, notas_postoperatorias, id_usuario, cirugia_insumo(cantidad, id_lote_inventario, inventario_lote(inventario_insumo(nombre)))",
            )
            .eq("id_animal", idAnimal)
            .order("fecha_cirugia", { ascending: false });
        if (idRefugio !== null) cirugiasQuery = cirugiasQuery.eq("id_refugio", idRefugio);

        const [
            { data: imagenes, error: imagenesError },
            { data: diagnosticos, error: diagnosticosError },
            eventosSanitariosRes,
            evaluacionesRes,
            cirugiasRes,
            chequeosRes,
            altasRes,
            trasladosRes,
            rehabilitacionesRes,
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
            eventosQuery,
            evaluacionesQuery,
            cirugiasQuery,
            chequeosQuery,
            altasQuery,
            trasladosQuery,
            rehabilitacionesQuery,
        ]);

        if (imagenesError) throw imagenesError;
        if (diagnosticosError) throw diagnosticosError;
        if (cirugiasRes.error) throw cirugiasRes.error;
        // Tablas nuevas pueden no existir aún en entornos sin migrar: tolerar ausencia.
        if (eventosSanitariosRes.error && !String((eventosSanitariosRes.error as { code?: string }).code ?? "").includes("42P01") && !String((eventosSanitariosRes.error as { code?: string }).code ?? "").includes("PGRST")) throw eventosSanitariosRes.error;
        if (chequeosRes.error && !String((chequeosRes.error as { code?: string }).code ?? "").includes("42P01") && !String((chequeosRes.error as { code?: string }).code ?? "").includes("PGRST")) throw chequeosRes.error;
        if (altasRes.error && !String((altasRes.error as { code?: string }).code ?? "").includes("42P01") && !String((altasRes.error as { code?: string }).code ?? "").includes("PGRST")) throw altasRes.error;
        if (evaluacionesRes.error && !String((evaluacionesRes.error as { code?: string }).code ?? "").includes("42P01") && !String((evaluacionesRes.error as { code?: string }).code ?? "").includes("PGRST")) throw evaluacionesRes.error;
        if (trasladosRes.error && !String((trasladosRes.error as { code?: string }).code ?? "").includes("42P01") && !String((trasladosRes.error as { code?: string }).code ?? "").includes("PGRST")) throw trasladosRes.error;
        if (rehabilitacionesRes.error && !String((rehabilitacionesRes.error as { code?: string }).code ?? "").includes("42P01") && !String((rehabilitacionesRes.error as { code?: string }).code ?? "").includes("PGRST")) throw rehabilitacionesRes.error;

        const eventosRows = (!eventosSanitariosRes.error ? (eventosSanitariosRes.data ?? []) : []) as Array<Record<string, unknown>>;
        const evaluacionesRows = (!evaluacionesRes.error ? (evaluacionesRes.data ?? []) : []) as Array<Record<string, unknown>>;
        const trasladosRows = (!trasladosRes.error ? (trasladosRes.data ?? []) : []) as Array<Record<string, unknown>>;
        const rehabilitacionesRows = (!rehabilitacionesRes.error ? (rehabilitacionesRes.data ?? []) : []) as Array<Record<string, unknown>>;
        const chequeosRows = (!chequeosRes.error ? (chequeosRes.data ?? []) : []) as Array<Record<string, unknown>>;

        // Los síntomas se consultan SOLO para los chequeos de este animal.
        // Antes se traían todos los de la tabla (fuga entre refugios).
        const chequeoIds = chequeosRows.map((row) => Number(row.id_chequeo));
        let sintomasRows: Array<Record<string, unknown>> = [];
        if (chequeoIds.length > 0) {
            const { data: sintomasData, error: sintomasError } = await client
                .from("chequeo_sintomas")
                .select("id_chequeo, sintoma")
                .in("id_chequeo", chequeoIds);
            if (sintomasError) {
                const code = String((sintomasError as { code?: string }).code ?? "");
                if (!code.includes("42P01") && !code.includes("PGRST")) throw sintomasError;
            } else {
                sintomasRows = (sintomasData ?? []) as Array<Record<string, unknown>>;
            }
        }
        const sintomasMap = new Map<number, string[]>();
        for (const row of sintomasRows) {
            const idc = Number(row.id_chequeo);
            const arr = sintomasMap.get(idc) ?? [];
            if (typeof row.sintoma === "string") arr.push(row.sintoma);
            sintomasMap.set(idc, arr);
        }

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
            vacunaciones: eventosRows.map((row) => ({
                idVacunacion: Number(row.id_evento),
                tipoBiologico: String(row.tipo_biologico ?? ""),
                fechaAplicacion: String(row.fecha_aplicacion ?? ""),
                fechaRefuerzo: (row.fecha_refuerzo as string | null) ?? null,
                esquemaCompleto: Boolean(row.esquema_completo),
                observaciones: (row.observaciones as string | null) ?? null,
                tipoEvento: (row.tipo_evento as "vacunacion" | "desparasitacion" | undefined) ?? "vacunacion",
            })),
            evaluacionesTemperamento: evaluacionesRows.map((row) => ({
                idEvaluacion: Number(row.id_evaluacion_temperamento),
                fechaEvaluacion: String(row.fecha_evaluacion ?? ""),
                comportamiento: (row.comportamiento as string | null) ?? null,
                nivelEnergia: (row.nivel_energia as string | null) ?? null,
                aptoPerros: (row.apto_perros as string | null) ?? null,
                aptoGatos: (row.apto_gatos as string | null) ?? null,
                aptoNinos: (row.apto_ninos as string | null) ?? null,
            })),
            cirugias: ((cirugiasRes.data ?? []) as unknown as SurgeryRowWithSupplies[]).map((row) => ({
                idCirugia: row.id_cirugia,
                tipoCirugia: row.tipo_cirugia,
                fechaCirugia: row.fecha_cirugia,
                exitosa: row.exitosa,
                notasPostoperatorias: row.notas_postoperatorias,
                idUsuario: row.id_usuario,
                insumos: (row.cirugia_insumo ?? []).map((insumo) => ({
                    idLoteInventario: insumo.id_lote_inventario,
                    nombreInsumo:
                        insumo.inventario_lote?.inventario_insumo?.nombre ?? "",
                    cantidad: insumo.cantidad,
                })),
            })),
            chequeos: chequeosRows.map((row) => {
                const idChequeo = Number(row.id_chequeo);
                return {
                    idChequeo,
                    fechaChequeo: String(row.fecha_chequeo ?? ""),
                    pesoKg: Number(row.peso_kg ?? 0),
                    temperaturaC: Number(row.temperatura_c ?? 0),
                    frecuenciaCardiaca: Number(row.frecuencia_cardiaca ?? 0),
                    frecuenciaRespiratoria: Number(row.frecuencia_respiratoria ?? 0),
                    sintomas: sintomasMap.get(idChequeo) ?? [],
                    sintomaOtroDetalle: (row.sintoma_otro_detalle as string | null) ?? null,
                    observaciones: (row.observaciones as string | null) ?? null,
                    idUsuario: Number(row.id_usuario ?? 0),
                };
            }),
            altasCuarentena: (!altasRes.error ? (altasRes.data ?? []) : []).map((row: Record<string, unknown>) => ({
                idAlta: Number(row.id_alta),
                fechaAlta: String(row.fecha_alta ?? ""),
                observaciones: String(row.observaciones ?? ""),
                idUsuarioVeterinario: Number(row.id_usuario_veterinario ?? 0),
            })),
            traslados: trasladosRows.map((row) => ({
                idTraslado: Number(row.id_traslado),
                fechaTraslado: String(row.fecha_traslado ?? ""),
                idEspacioOrigen: Number(row.id_espacio_origen ?? 0),
                idEspacioDestino: Number(row.id_espacio_destino ?? 0),
                motivo: (row.motivo as string | null) ?? null,
            })),
            rehabilitaciones: rehabilitacionesRows.map((row) => ({
                idRehabilitacion: Number(row.id_rehabilitacion),
                fechaInicio: String(row.fecha_inicio ?? ""),
                fechaFin: (row.fecha_fin as string | null) ?? null,
                tipo: String(row.tipo ?? ""),
                objetivo: String(row.objetivo ?? ""),
                observaciones: (row.observaciones as string | null) ?? null,
            })),
        };
    }
}
