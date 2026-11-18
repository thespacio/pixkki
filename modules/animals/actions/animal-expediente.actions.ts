"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/modules/auth";
import { ANIMAL_PERMISSIONS, getAnimalAccess } from "../access";
import { createAnimalMultimediaService } from "../factories/create-animal-multimedia-service";
import { createAnimalDiagnosisService } from "../factories/create-animal-diagnosis-service";
import { createClinicalRecordService } from "../factories/create-clinical-record-service";
import {
    CreateDiagnosticoBodySchema,
    SetPortadaSchema,
} from "../validators/animal.validators";
import {
    AnimalForbiddenError,
} from "../types/animales.types";
import {
    toErrorMessage,
    type AnimalActionResult,
} from "./animal-action-result";
import type { AnimalImage } from "../repositories/animal-multimedia.repository";
import type { AnimalDiagnosis } from "../repositories/animal-diagnosis.repository";
import type { ClinicalRecord } from "../services/clinical-record.service";

const ANIMALS_PATH = "/animales";

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

/** Elimina una imagen del expediente y reasigna portada si era necesario. */
export async function deleteAnimalImageAction(
    idAnimal: number,
    idImagen: number,
): Promise<AnimalActionResult> {
    try {
        const user = await getCurrentUser();
        ensureCan(user.permissions, ANIMAL_PERMISSIONS.edit, "gestionar imágenes");

        const animalId = parseId(idAnimal, "Animal");
        const imagenId = parseId(idImagen, "Imagen");

        const service = await createAnimalMultimediaService();
        await service.deleteImage(imagenId, animalId, getAnimalAccess(user));

        revalidatePath(ANIMALS_PATH);
        return { success: true, data: undefined };
    } catch (error) {
        return { success: false, error: toErrorMessage(error) };
    }
}

/** Designa una imagen como portada del expediente. */
export async function setAnimalPortadaAction(
    idAnimal: number,
    idImagen: number,
): Promise<AnimalActionResult<AnimalImage>> {
    try {
        const user = await getCurrentUser();
        ensureCan(user.permissions, ANIMAL_PERMISSIONS.edit, "gestionar imágenes");

        const data = SetPortadaSchema.parse({
            idAnimal,
            idImagen,
        });

        const service = await createAnimalMultimediaService();
        const imagen = await service.setPortada(
            data.idImagen,
            data.idAnimal,
            getAnimalAccess(user),
        );

        revalidatePath(ANIMALS_PATH);
        return { success: true, data: imagen };
    } catch (error) {
        return { success: false, error: toErrorMessage(error) };
    }
}

/** Registra el diagnóstico veterinario de ingreso (el usuario sale de la sesión). */
export async function createAnimalDiagnosisAction(
    idAnimal: number,
    input: unknown,
): Promise<AnimalActionResult<AnimalDiagnosis>> {
    try {
        const user = await getCurrentUser();
        const body = CreateDiagnosticoBodySchema.parse(input);

        const service = await createAnimalDiagnosisService();
        const diagnostico = await service.createDiagnosis(
            parseId(idAnimal, "Animal"),
            getAnimalAccess(user),
            body,
            { id: user.id, role: user.role },
        );

        revalidatePath(ANIMALS_PATH);
        return { success: true, data: diagnostico };
    } catch (error) {
        return { success: false, error: toErrorMessage(error) };
    }
}

/** Ficha clínica consolidada del expediente (solo lectura). */
export async function getAnimalClinicalRecordAction(
    idAnimal: number,
): Promise<AnimalActionResult<ClinicalRecord>> {
    try {
        const user = await getCurrentUser();
        ensureCan(user.permissions, ANIMAL_PERMISSIONS.view, "ver la ficha clínica");

        const service = await createClinicalRecordService();
        const ficha = await service.getClinicalRecord(
            parseId(idAnimal, "Animal"),
            getAnimalAccess(user),
        );

        return { success: true, data: ficha };
    } catch (error) {
        return { success: false, error: toErrorMessage(error) };
    }
}
