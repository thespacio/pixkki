"use server";

import { revalidatePath } from "next/cache";
import {
    CreateStaffFormSchema,
    type CreateStaffFormInput,
} from "@/modules/users/schemas";
import { createUserService } from "@/modules/users/factories/create-user-service";
import {getCurrentUser} from "@/modules/auth";


export async function createStaffAction(input: CreateStaffFormInput) {
    const parsed = CreateStaffFormSchema.parse(input);
    const currentUser = await getCurrentUser();
    if (!currentUser?.shelterId) {
        throw new Error("No autorizado");
    }

    const service = await createUserService();
    const result = await service.createStaff(
        parsed,
        currentUser.shelterId,
    );

    revalidatePath("/staff");

    return result;
}

export async function getStaffAction() {
    const currentUser = await getCurrentUser();
    if (!currentUser?.shelterId) {
        throw new Error("No autorizado");
    }

    const service = await createUserService();
    return service.listStaff(currentUser.shelterId);
}

export async function getUsersGlobalAction(params: { search?: string; role?: string | number; activo?: boolean; limit?: number; offset?: number }) {
    const currentUser = await getCurrentUser();
    if (!currentUser?.shelterId) {
        throw new Error("No autorizado");
    }

    const service = await createUserService();
    return service.listGlobalUsers(params as any);
}

export async function toggleStaffStatusAction(id: number, activo: boolean) {
    const currentUser = await getCurrentUser();
    if (!currentUser?.shelterId) {
        throw new Error("No autorizado");
    }

    const service = await createUserService();
    return service.toggleStaffStatus(id, currentUser.shelterId, activo);
}

export async function deleteStaffAction(id: number) {
    const currentUser = await getCurrentUser();
    if (!currentUser?.shelterId) {
        throw new Error("No autorizado");
    }

    const service = await createUserService();
    await service.deleteStaff(id, currentUser.shelterId);
    revalidatePath("/dashboard/staff");

    return { success: true };
}