// modules/animals/services/clinical-record.service.ts

import type {
    ClinicalDiagnosis,
    ClinicalRecordData,
    ClinicalRecordRepository,
    ClinicalSurgery,
    ClinicalTemperament,
    ClinicalVaccination,
    ClinicalCheckup,
    ClinicalQuarantineRelease,
} from "../repositories/clinical-record.repository";
import { AnimalNotFoundError } from "../types/animales.types";
import type { AnimalAccess } from "../access";

export type ClinicalTimelineEvent =
    | { tipo: "diagnostico"; fecha: string; detalle: ClinicalDiagnosis }
    | { tipo: "vacuna"; fecha: string; detalle: ClinicalVaccination }
    | { tipo: "prueba_temperamento"; fecha: string; detalle: ClinicalTemperament }
    | { tipo: "esterilizacion"; fecha: string; detalle: ClinicalSurgery }
    | { tipo: "chequeo"; fecha: string; detalle: ClinicalCheckup }
    | { tipo: "alta_cuarentena"; fecha: string; detalle: ClinicalQuarantineRelease };

export type ClinicalAlert = "cuarentena" | "estado_critico";

export type ClinicalRecord = Omit<ClinicalRecordData, "vacunaciones" | "evaluacionesTemperamento" | "cirugias" | "chequeos" | "altasCuarentena"> & {
    alertas: ClinicalAlert[];
    lineaTiempo: ClinicalTimelineEvent[];
};

/**
 * Servicio de negocio para la ficha clínica centralizada (RF1.4, US08).
 * Lógica pura: agrega y ordena el historial para la vista unificada.
 */
export class ClinicalRecordService {
    constructor(private readonly repository: ClinicalRecordRepository) {}

    async getClinicalRecord(
        idAnimal: number,
        access: AnimalAccess,
    ): Promise<ClinicalRecord> {
        // `null` para superadmin: el repository omite el filtro de refugio.
        const idRefugio = access.allShelters ? null : access.shelterId;
        const data = await this.repository.getByAnimal(idAnimal, idRefugio);
        if (!data) throw new AnimalNotFoundError(idAnimal);

        const lineaTiempo: ClinicalTimelineEvent[] = [
            ...data.diagnosticos.map((detalle) => ({
                tipo: "diagnostico" as const,
                fecha: detalle.fechaDiagnostico,
                detalle,
            })),
            ...data.vacunaciones.map((detalle) => ({
                tipo: "vacuna" as const,
                fecha: detalle.fechaAplicacion,
                detalle,
            })),
            ...data.evaluacionesTemperamento.map((detalle) => ({
                tipo: "prueba_temperamento" as const,
                fecha: detalle.fechaEvaluacion,
                detalle,
            })),
            ...data.cirugias.map((detalle) => ({
                tipo: "esterilizacion" as const,
                fecha: detalle.fechaCirugia,
                detalle,
            })),
            ...data.chequeos.map((detalle) => ({
                tipo: "chequeo" as const,
                fecha: detalle.fechaChequeo,
                detalle,
            })),
            ...data.altasCuarentena.map((detalle) => ({
                tipo: "alta_cuarentena" as const,
                fecha: detalle.fechaAlta,
                detalle,
            })),
        ].sort(
            (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
        );

        const alertas: ClinicalAlert[] = [];
        if (data.animal.enCuarentena) alertas.push("cuarentena");

        // Solo el diagnóstico más reciente define el estado clínico actual.
        const ultimoDiagnostico = data.diagnosticos[0];
        if (ultimoDiagnostico?.estadoGeneral === "Crítico") {
            alertas.push("estado_critico");
        }

        return {
            animal: data.animal,
            imagenes: data.imagenes,
            diagnosticos: data.diagnosticos,
            alertas,
            lineaTiempo,
        };
    }
}
