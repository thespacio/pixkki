"use server";

// ---------------------------------------------------------------------------
// Requerimiento 04 — control poblacional (US15, US16).
// Frontera UI -> aplicación: valida contexto, delega en services y revalida.
// La autorización real se revalida siempre en el servidor.
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/modules/auth";
import { ANIMAL_PERMISSIONS, getAnimalAccess } from "../access";
import { createAnimalSurgeryService } from "../factories/create-animal-surgery-service";
import { createAnimalAdoptionService } from "../factories/create-animal-adoption-service";
import { ControlPoblacionalError } from "../errors";
import { AnimalForbiddenError } from "../types/animales.types";
import type {
    AnimalSurgeryHistoryItem,
} from "../repositories/animal-surgery.repository";
import type {
    AdoptionAptitude,
    AdoptionPublication,
} from "../repositories/animal-adoption.repository";
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

function toActionError(error: unknown): AnimalActionResult<never> {
    if (error instanceof ControlPoblacionalError) {
        return {
            success: false,
            error: error.message,
            code: error.code,
            details: error.details,
        };
    }
    return { success: false, error: toErrorMessage(error) };
}

/** RF4.1: historial de cirugías del paciente (lectura). */
export async function getAnimalSurgeriesAction(
    idAnimal: number,
): Promise<AnimalActionResult<AnimalSurgeryHistoryItem[]>> {
    try {
        const user = await getCurrentUser();
        ensureCan(user.permissions, ANIMAL_PERMISSIONS.view, "ver las cirugías del paciente");

        const service = await createAnimalSurgeryService();
        const cirugias = await service.list(
            parseId(idAnimal, "Animal"),
            getAnimalAccess(user),
        );

        return { success: true, data: cirugias };
    } catch (error) {
        return toActionError(error);
    }
}

/** RF4.1: registra cirugía reproductiva. Solo veterinario/admin (validado en service). */
export async function createAnimalSurgeryAction(
    idAnimal: number,
    input: unknown,
): Promise<AnimalActionResult<import("../repositories/animal-surgery.repository").AnimalSurgery>> {
    try {
        const user = await getCurrentUser();
        ensureCan(user.permissions, ANIMAL_PERMISSIONS.view, "registrar cirugías");

        const service = await createAnimalSurgeryService();
        const cirugia = await service.create(
            parseId(idAnimal, "Animal"),
            getAnimalAccess(user),
            input,
            { id: user.id, role: user.role },
        );

        revalidateClinicalPaths(idAnimal);
        return { success: true, data: cirugia };
    } catch (error) {
        return toActionError(error);
    }
}

/** RF4.2: evalúa la aptitud de adopción (solo lectura). */
export async function getAnimalAdoptionAptitudeAction(
    idAnimal: number,
): Promise<AnimalActionResult<AdoptionAptitude>> {
    try {
        const user = await getCurrentUser();
        ensureCan(user.permissions, ANIMAL_PERMISSIONS.view, "ver la aptitud de adopción");

        const service = await createAnimalAdoptionService();
        const aptitud = await service.evaluate(
            parseId(idAnimal, "Animal"),
            getAnimalAccess(user),
        );

        return { success: true, data: aptitud };
    } catch (error) {
        return toActionError(error);
    }
}

/**
 * RF4.2: publica o despublica para adopción.
 * Requiere `animals.edit`; la excepción administrativa se revalida en la RPC.
 */
export async function setAnimalAdoptionAvailabilityAction(
    idAnimal: number,
    input: unknown,
): Promise<AnimalActionResult<AdoptionPublication>> {
    try {
        const user = await getCurrentUser();
        ensureCan(user.permissions, ANIMAL_PERMISSIONS.edit, "cambiar la disponibilidad de adopción");

        const service = await createAnimalAdoptionService();
        const resultado = await service.setDisponibility(
            parseId(idAnimal, "Animal"),
            getAnimalAccess(user),
            input,
            { id: user.id, role: user.role },
        );

        revalidateClinicalPaths(idAnimal);
        return { success: true, data: resultado };
    } catch (error) {
        return toActionError(error);
    }
}
