"use server";

// ---------------------------------------------------------------------------
// Requerimiento 03 — socialización y espacios (US12, US13, US14).
// Frontera UI -> aplicación: valida con Zod, delega en services y revalida.
// La autorización real se revalida siempre en el servidor.
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/modules/auth";
import { ANIMAL_PERMISSIONS, getAnimalAccess } from "../access";
import { createAnimalTransferService } from "../factories/create-animal-transfer-service";
import { createAnimalTemperamentService } from "../factories/create-animal-temperament-service";
import { createAnimalRehabilitationService } from "../factories/create-animal-rehabilitation-service";
import { createSpaceOccupancyService } from "@/modules/spaces/factories/create-space-occupancy-service";
import { CreateTrasladoSchema } from "../validators/animal-transfer.validators";
import { CreateEvaluacionTemperamentoSchema } from "../validators/animal-temperament.validators";
import { CreateRehabilitacionSchema } from "../validators/animal-rehabilitation.validators";
import { AnimalForbiddenError } from "../types/animales.types";
import type { SpaceWithOccupancy } from "@/modules/spaces/ports/space-occupancy.port";
import type { AnimalTransfer } from "../repositories/animal-transfer.repository";
import type { TemperamentEvaluation } from "../repositories/animal-temperament.repository";
import type { RehabilitationEntry } from "../repositories/animal-rehabilitation.repository";
import {
    toErrorMessage,
    type AnimalActionResult,
} from "./animal-action-result";

const ANIMALS_PATH = "/animales";

function ensureCan(permissions: string[], permission: string, accion: string): void {
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
    revalidatePath(`/animales/${idAnimal}/ficha-clinica`);
}

/** RF3.1: espacios del refugio con ocupación calculada. */
export async function getSpacesWithOccupancyAction(): Promise<
    AnimalActionResult<SpaceWithOccupancy[]>
> {
    try {
        const user = await getCurrentUser();
        ensureCan(user.permissions, ANIMAL_PERMISSIONS.view, "consultar espacios");

        const access = getAnimalAccess(user);
        const service = await createSpaceOccupancyService();
        const espacios = await service.listWithOccupancy(
            access.allShelters ? undefined : { shelterId: access.shelterId },
        );
        return { success: true, data: espacios };
    } catch (error) {
        return { success: false, error: toErrorMessage(error) };
    }
}

/** RF3.2: historial de traslados del paciente. */
export async function getAnimalTransfersAction(
    idAnimal: number,
): Promise<AnimalActionResult<AnimalTransfer[]>> {
    try {
        const user = await getCurrentUser();
        ensureCan(user.permissions, ANIMAL_PERMISSIONS.view, "ver los traslados");
        const service = await createAnimalTransferService();
        const traslados = await service.list(parseId(idAnimal, "Animal"), getAnimalAccess(user));
        return { success: true, data: traslados };
    } catch (error) {
        return { success: false, error: toErrorMessage(error) };
    }
}

/** RF3.2: registra el traslado; el alta médica opcional se autoriza en el service. */
export async function createAnimalTransferAction(
    idAnimal: number,
    input: unknown,
): Promise<AnimalActionResult<AnimalTransfer>> {
    try {
        const user = await getCurrentUser();
        ensureCan(user.permissions, ANIMAL_PERMISSIONS.view, "registrar traslados");
        const data = CreateTrasladoSchema.parse(input);
        const service = await createAnimalTransferService();
        const traslado = await service.create(
            parseId(idAnimal, "Animal"),
            getAnimalAccess(user),
            data,
            { id: user.id, role: user.role },
        );
        revalidateClinicalPaths(idAnimal);
        return { success: true, data: traslado };
    } catch (error) {
        return { success: false, error: toErrorMessage(error) };
    }
}

/** RF3.3: historial de evaluaciones de temperamento. */
export async function getAnimalTemperamentEvaluationsAction(
    idAnimal: number,
): Promise<AnimalActionResult<TemperamentEvaluation[]>> {
    try {
        const user = await getCurrentUser();
        ensureCan(user.permissions, ANIMAL_PERMISSIONS.view, "ver evaluaciones de temperamento");
        const service = await createAnimalTemperamentService();
        const evaluaciones = await service.list(parseId(idAnimal, "Animal"), getAnimalAccess(user));
        return { success: true, data: evaluaciones };
    } catch (error) {
        return { success: false, error: toErrorMessage(error) };
    }
}

/** RF3.3: registra una evaluación y actualiza el temperamento vigente. */
export async function createAnimalTemperamentEvaluationAction(
    idAnimal: number,
    input: unknown,
): Promise<AnimalActionResult<TemperamentEvaluation>> {
    try {
        const user = await getCurrentUser();
        ensureCan(user.permissions, ANIMAL_PERMISSIONS.view, "registrar evaluaciones");
        const data = CreateEvaluacionTemperamentoSchema.parse(input);
        const service = await createAnimalTemperamentService();
        const evaluacion = await service.create(
            parseId(idAnimal, "Animal"),
            getAnimalAccess(user),
            data,
            { id: user.id, role: user.role },
        );
        revalidateClinicalPaths(idAnimal);
        return { success: true, data: evaluacion };
    } catch (error) {
        return { success: false, error: toErrorMessage(error) };
    }
}

/** RF3.4: historial de rehabilitación. */
export async function getAnimalRehabilitationsAction(
    idAnimal: number,
): Promise<AnimalActionResult<RehabilitationEntry[]>> {
    try {
        const user = await getCurrentUser();
        ensureCan(user.permissions, ANIMAL_PERMISSIONS.view, "ver la rehabilitación");
        const service = await createAnimalRehabilitationService();
        const entradas = await service.list(parseId(idAnimal, "Animal"), getAnimalAccess(user));
        return { success: true, data: entradas };
    } catch (error) {
        return { success: false, error: toErrorMessage(error) };
    }
}

/** RF3.4: registra una entrada de rehabilitación. */
export async function createAnimalRehabilitationAction(
    idAnimal: number,
    input: unknown,
): Promise<AnimalActionResult<RehabilitationEntry>> {
    try {
        const user = await getCurrentUser();
        ensureCan(user.permissions, ANIMAL_PERMISSIONS.view, "registrar rehabilitación");
        const data = CreateRehabilitacionSchema.parse(input);
        const service = await createAnimalRehabilitationService();
        const entrada = await service.create(
            parseId(idAnimal, "Animal"),
            getAnimalAccess(user),
            data,
            { id: user.id, role: user.role },
        );
        revalidateClinicalPaths(idAnimal);
        return { success: true, data: entrada };
    } catch (error) {
        return { success: false, error: toErrorMessage(error) };
    }
}
