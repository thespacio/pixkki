"use server";

// ---------------------------------------------------------------------------
// Server Actions del control clínico (Requerimiento 02: RF2.1 y RF2.4).
//
// Frontera UI -> aplicación:
//   - validan entrada con Zod (fuente única de verdad),
//   - delegan la regla de negocio al service,
//   - el RBAC clínico (veterinario/admin) se revalida en el servidor.
//
// La UI solo oculta controles; estas actions son la autorización real para
// quien las invoque directamente desde el cliente.
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/modules/auth";
import { ANIMAL_PERMISSIONS, getAnimalAccess } from "../access";
import { createAnimalCheckupService } from "../factories/create-animal-checkup-service";
import { createAnimalQuarantineService } from "../factories/create-animal-quarantine-service";
import {
    CreateAltaCuarentenaSchema,
    CreateChequeoSchema,
} from "../validators/animal.validators";
import { AnimalForbiddenError } from "../types/animales.types";
import {
    toErrorMessage,
    type AnimalActionResult,
} from "./animal-action-result";
import type { AnimalCheckup } from "../repositories/animal-checkup.repository";
import type {
    QuarantineRelease,
    QuarantineStatus,
} from "../repositories/animal-quarantine.repository";

const ANIMALS_PATH = "/animals";

function ensureCan(
    permissions: string[],
    permission: string,
    accion: string,
): void {
    if (!permissions.includes(permission)) {
        throw new AnimalForbiddenError(accion);
    }
}

function parseId(value: number, field: string): number {
    if (!Number.isInteger(value) || value <= 0) {
        throw new Error(`${field} inválido`);
    }
    return value;
}

function revalidateClinicalPaths(idAnimal: number): void {
    revalidatePath(ANIMALS_PATH);
    revalidatePath(`/animals/${idAnimal}/clinical-record`);
}

/** Historial de chequeos médicos del paciente (solo lectura). */
export async function getAnimalCheckupsAction(
    idAnimal: number,
): Promise<AnimalActionResult<AnimalCheckup[]>> {
    try {
        const user = await getCurrentUser();
        ensureCan(user.permissions, ANIMAL_PERMISSIONS.view, "ver los chequeos del paciente");

        const service = await createAnimalCheckupService();
        const chequeos = await service.list(
            parseId(idAnimal, "Animal"),
            getAnimalAccess(user),
        );

        return { success: true, data: chequeos };
    } catch (error) {
        return { success: false, error: toErrorMessage(error) };
    }
}

/** Registra un chequeo con constantes vitales (RF2.1). Solo veterinario/admin. */
export async function createAnimalCheckupAction(
    idAnimal: number,
    input: unknown,
): Promise<AnimalActionResult<AnimalCheckup>> {
    try {
        const user = await getCurrentUser();
        ensureCan(user.permissions, ANIMAL_PERMISSIONS.view, "registrar chequeos");

        const data = CreateChequeoSchema.parse(input);
        const service = await createAnimalCheckupService();
        const chequeo = await service.create(
            parseId(idAnimal, "Animal"),
            getAnimalAccess(user),
            data,
            { id: user.id, role: user.role },
        );

        revalidateClinicalPaths(idAnimal);
        return { success: true, data: chequeo };
    } catch (error) {
        return { success: false, error: toErrorMessage(error) };
    }
}

/** Estado de cuarentena, alerta e historial de altas (RF2.4, lectura). */
export async function getAnimalQuarantineStatusAction(
    idAnimal: number,
): Promise<AnimalActionResult<QuarantineStatus>> {
    try {
        const user = await getCurrentUser();
        ensureCan(user.permissions, ANIMAL_PERMISSIONS.view, "ver el estado de cuarentena");

        const service = await createAnimalQuarantineService();
        const estado = await service.getStatus(
            parseId(idAnimal, "Animal"),
            getAnimalAccess(user),
        );

        return { success: true, data: estado };
    } catch (error) {
        return { success: false, error: toErrorMessage(error) };
    }
}

/** Registra el alta médica y libera la cuarentena (RF2.4). */
export async function releaseAnimalQuarantineAction(
    idAnimal: number,
    input: unknown,
): Promise<AnimalActionResult<QuarantineRelease & { enCuarentena: false }>> {
    try {
        const user = await getCurrentUser();
        ensureCan(user.permissions, ANIMAL_PERMISSIONS.view, "registrar el alta de cuarentena");

        const data = CreateAltaCuarentenaSchema.parse(input);
        const service = await createAnimalQuarantineService();
        const alta = await service.release(
            parseId(idAnimal, "Animal"),
            getAnimalAccess(user),
            data,
            { id: user.id, role: user.role },
        );

        revalidateClinicalPaths(idAnimal);
        return { success: true, data: alta };
    } catch (error) {
        return { success: false, error: toErrorMessage(error) };
    }
}
