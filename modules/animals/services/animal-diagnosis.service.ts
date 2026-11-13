// modules/animals/services/animal-diagnosis.service.ts

import type {
    AnimalDiagnosis,
    AnimalDiagnosisRepository,
} from "../repositories/animal-diagnosis.repository";
import {
    CreateDiagnosticoSchema,
    type CreateDiagnosticoBody,
} from "../validators/animal.validators";
import {
    AnimalDiagnosisForbiddenError,
    puedeRegistrarDiagnostico,
} from "../types/animales.types";
import type { AnimalAccess } from "../access";

type DiagnosisUser = {
    id: number;
    role: string;
};

/**
 * Servicio de negocio para diagnóstico veterinario de ingreso (RF1.3, US07).
 * Lógica pura: no accede a Supabase directamente.
 *
 * Reglas:
 * - Solo roles veterinario/admin pueden crear.
 * - Crítico o Delicado exigen observaciones (lo valida Zod).
 * - El usuario veterinario sale de la sesión, nunca del cliente.
 * - Si se marca "requiere cuarentena", el animal queda en cuarentena.
 */
export class AnimalDiagnosisService {
    constructor(private readonly repository: AnimalDiagnosisRepository) {}

    /** `null` para superadmin: el repository omite el filtro de refugio. */
    private refugioDe(access: AnimalAccess): number | null {
        return access.allShelters ? null : access.shelterId;
    }

    async createDiagnosis(
        idAnimal: number,
        access: AnimalAccess,
        body: CreateDiagnosticoBody,
        user: DiagnosisUser,
    ): Promise<AnimalDiagnosis> {
        if (!puedeRegistrarDiagnostico(user.role)) {
            throw new AnimalDiagnosisForbiddenError();
        }

        const data = CreateDiagnosticoSchema.parse({ ...body, idAnimal });
        const idRefugio = this.refugioDe(access);

        const diagnostico = await this.repository.create(
            idAnimal,
            idRefugio,
            {
                estadoGeneral: data.estadoGeneral,
                requiereCuarentena: data.requiereCuarentena,
                observaciones: data.observaciones ?? null,
            },
            user.id,
        );

        if (data.requiereCuarentena) {
            await this.repository.setCuarentena(idAnimal, idRefugio);
        }

        return diagnostico;
    }

    async listDiagnoses(
        idAnimal: number,
        access: AnimalAccess,
    ): Promise<AnimalDiagnosis[]> {
        return this.repository.listByAnimal(idAnimal, this.refugioDe(access));
    }
}
