"use server";

import { revalidatePath } from "next/cache";
import { CreateStaffSchema, type CreateStaffInput } from "@/modules/users/schemas";
import { createUserService } from "@/modules/users/factories/create-user-service";
import {getCurrentUser} from "@/modules/auth";


export async function createStaffAction(input: CreateStaffInput) {
    // 1. Frontera servidor: validación estructural
    const parsed = CreateStaffSchema.parse(input);

    // 2. Contexto confiable: shelterId del admin autenticado, NO del cliente
    const currentUser = await getCurrentUser();
    if (!currentUser?.shelterId) {
        throw new Error("No autorizado");
    }

    // 3. Delegar al Service
    const service = await createUserService();
    const result = await service.createStaff({
        ...parsed,
        shelterId: currentUser.shelterId,
    });

    // 4. Revalidar UI
    revalidatePath("/dashboard/staff");

    return result;
}