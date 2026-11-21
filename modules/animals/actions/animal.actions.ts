"use server";

import { revalidatePath } from "next/cache";
import {
    CreateAnimalRequestSchema,
    CreateAnimalSchema,
    UpdateAnimalSchema,
} from "../validators/animal.validators";
import { createAnimalService } from "../factories/create-animal-service";
import { createAnimalStateService } from "../factories/create-animal-state-service";
import type { CreateAnimalDTO } from "../dtos/create-animal.dto";
import type { UpdateAnimalDTO } from "../dtos/update-animal.dto";
import { getCurrentUser } from "@/modules/auth";
import { ANIMAL_PERMISSIONS, getAnimalAccess } from "../access";
import {
    Animal,
    AnimalForbiddenError,
} from "@/modules/animals/types/animales.types";
import {
    toErrorMessage,
    type AnimalActionResult,
} from "./animal-action-result";

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

export async function createAnimalAction(
    dto: CreateAnimalDTO,
): Promise<AnimalActionResult<Animal>> {
    try {
        const user = await getCurrentUser();
        ensureCan(user.permissions, ANIMAL_PERMISSIONS.create, "registrar animales");

        // RF1.1/RF2.4: el cliente ya no elige el estado. Se ignora cualquier
        // idEstado que llegue y se resuelve "Cuarentena" en el servidor.
        const request = CreateAnimalRequestSchema.parse(dto);
        const estadoService = await createAnimalStateService();
        const idEstado = await estadoService.requireCuarentenaId();
        const data = CreateAnimalSchema.parse({ ...request, idEstado });

        const service = await createAnimalService();
        const animal = await service.create(data, getAnimalAccess(user));

        revalidatePath(ANIMALS_PATH);
        return { success: true, data: animal };
    } catch (error) {
        return { success: false, error: toErrorMessage(error) };
    }
}

export async function updateAnimalAction(
    dto: UpdateAnimalDTO,
): Promise<AnimalActionResult<Animal>> {
    try {
        const user = await getCurrentUser();
        ensureCan(user.permissions, ANIMAL_PERMISSIONS.edit, "editar animales");

        const data = UpdateAnimalSchema.parse(dto);
        const service = await createAnimalService();
        const animal = await service.update(data, getAnimalAccess(user));

        revalidatePath(ANIMALS_PATH);
        return { success: true, data: animal };
    } catch (error) {
        return { success: false, error: toErrorMessage(error) };
    }
}

export async function deleteAnimalAction(
    id: number,
): Promise<AnimalActionResult> {
    try {
        const user = await getCurrentUser();
        ensureCan(user.permissions, ANIMAL_PERMISSIONS.delete, "dar de baja animales");

        const service = await createAnimalService();
        await service.delete(id, getAnimalAccess(user));

        revalidatePath(ANIMALS_PATH);
        return { success: true, data: undefined };
    } catch (error) {
        return { success: false, error: toErrorMessage(error) };
    }
}
