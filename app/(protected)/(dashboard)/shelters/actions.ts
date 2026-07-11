"use server";


import {createCreateShelterWithAdminUseCase} from "@/modules/shelters/factories";
import {CreateShelterWithAdminInput} from "@/modules/shelters/schemas";

export async function createShelterAction(
    input: CreateShelterWithAdminInput
) {
    const useCase = await createCreateShelterWithAdminUseCase();

    return await useCase.execute(input);
}