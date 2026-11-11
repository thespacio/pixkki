"use server";

import { revalidatePath } from "next/cache";
import { CreateStaffSchema, type CreateStaffInput } from "@/modules/users/schemas";
import { createUserService } from "@/modules/users/factories/create-user-service";
import {getCurrentUser} from "@/modules/auth";
import {ensureCanManageStaff} from "@/modules/users/authorization";
import {User} from "@/modules/users/types";


export async function createStaffAction(input: CreateStaffInput) {
    // 1. Frontera servidor: validación estructural
    const parsed = CreateStaffSchema.parse(input);

    // 2. Contexto confiable: shelterId del admin autenticado, NO del cliente
    const currentUser = await getCurrentUser();
    if (!currentUser?.shelterId) {
        throw new Error("No autorizado");
    }

    // 3. Autorización: solo admin/superadmin gestiona personal (F-USERS-01)
    ensureCanManageStaff(currentUser);

    // 4. Delegar al Service
    const service = await createUserService();
    const result = await service.createStaff({
        ...parsed,
        shelterId: currentUser.shelterId,
    });

    // 5. Revalidar UI
    revalidatePath("/dashboard/staff");

    return result;
}

/**
 * Obtiene el personal del refugio del usuario autenticado (F-USERS-01).
 */
export async function getStaffAction(): Promise<User[]> {
    const currentUser = await getCurrentUser();

    ensureCanManageStaff(currentUser);

    if (!currentUser?.shelterId) {
        throw new Error("El usuario actual no está asociado a un refugio.");
    }

    const service = await createUserService();
    return service.listStaff(currentUser.shelterId);
}

/**
 * Activa o desactiva un miembro del personal del refugio actual.
 */
export async function toggleStaffStatusAction(id: number, activo: boolean): Promise<User> {
    const currentUser = await getCurrentUser();

    ensureCanManageStaff(currentUser);

    if (!currentUser?.shelterId) {
        throw new Error("El usuario actual no está asociado a un refugio.");
    }

    const service = await createUserService();
    return service.toggleStaffStatus(id, currentUser.shelterId, activo);
}

/**
 * Elimina un miembro del personal del refugio actual.
 */
export async function deleteStaffAction(id: number): Promise<void> {
    const currentUser = await getCurrentUser();

    ensureCanManageStaff(currentUser);

    if (!currentUser?.shelterId) {
        throw new Error("El usuario actual no está asociado a un refugio.");
    }

    const service = await createUserService();
    await service.deleteStaff(id, currentUser.shelterId);
}
