"use server";

import { revalidatePath } from "next/cache";
import { CreateAnimalSchema, UpdateAnimalSchema } from "../validators/animal.validators";
import { createAnimalService } from "../factories/create-animal-service";
import type { CreateAnimalDTO } from "../dtos/create-animal.dto";
import type { UpdateAnimalDTO } from "../dtos/update-animal.dto";
import {getCurrentUser} from "@/modules/auth";

const ANIMALS_PATH = "/animales";

export async function createAnimalAction(dto: CreateAnimalDTO) {
    const data = CreateAnimalSchema.parse(dto);
    const user = await getCurrentUser();


    const service = await createAnimalService();
    const animal = await service.create(data, user.shelterId);

    revalidatePath(ANIMALS_PATH);
    return animal;
}

export async function updateAnimalAction(dto: UpdateAnimalDTO) {
    const data = UpdateAnimalSchema.parse(dto);
    const user = await getCurrentUser();


    const service = await createAnimalService();
    const animal = await service.update(data, user.shelterId);

    revalidatePath(ANIMALS_PATH);
    revalidatePath(`${ANIMALS_PATH}/${data.id}`);
    return animal;
}

export async function deleteAnimalAction(id: number) {
    const user = await getCurrentUser();

    const service = await createAnimalService();
    await service.delete(id, user.shelterId);

    revalidatePath(ANIMALS_PATH);
}