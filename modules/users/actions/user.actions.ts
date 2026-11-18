"use server";

import { revalidatePath } from "next/cache";
import { CreateStaffSchema } from "@/modules/users/schemas";
import { createUserService } from "@/modules/users/factories/create-user-service";
import { getCurrentUser } from "@/modules/auth";
import { isSuperadmin } from "@/modules/auth/authorization";
import { ensureCanManageStaff } from "@/modules/users/authorization";
import {
    StaffShelterRequiredError,
    UserAuthorizationError,
} from "@/modules/users/errors";
import type { StaffListItem } from "@/modules/users/types";
import {
    toUserErrorMessage,
    type UserActionResult,
} from "./user-action-result";

/**
 * Frontera UI → aplicación para la gestión de personal.
 *
 * - Valida con Zod antes de cualquier efecto.
 * - Toma el `shelterId` del contexto autenticado; el cliente nunca lo elige
 *   salvo que sea superadmin (alcance global, RF00 regla 1).
 * - Devuelve un resultado tipado en lugar de lanzar excepciones al cliente.
 */
export async function createStaffAction(
    input: unknown,
): Promise<UserActionResult<{ tempPassword: string; message: string }>> {
    try {
        const parsed = CreateStaffSchema.parse(input);

        const currentUser = await getCurrentUser();
        if (!currentUser) {
            throw new UserAuthorizationError("Inicia sesión para continuar.");
        }
        ensureCanManageStaff(currentUser);

        const shelterId = isSuperadmin(currentUser)
            ? parsed.shelterId
            : currentUser.shelterId;
        if (!shelterId) {
            throw new StaffShelterRequiredError();
        }

        const service = await createUserService();
        const result = await service.createStaff({ ...parsed, shelterId });

        revalidatePath("/staff");
        return {
            success: true,
            data: { tempPassword: result.tempPassword, message: result.message },
        };
    } catch (error) {
        return { success: false, error: toUserErrorMessage(error) };
    }
}

/**
 * Personal del refugio de la sesión, o de todos los refugios si es superadmin.
 */
export async function getStaffAction(): Promise<UserActionResult<StaffListItem[]>> {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            throw new UserAuthorizationError("Inicia sesión para continuar.");
        }
        ensureCanManageStaff(currentUser);

        const shelterId = isSuperadmin(currentUser)
            ? null
            : currentUser.shelterId;
        if (shelterId === null && !isSuperadmin(currentUser)) {
            throw new UserAuthorizationError(
                "Tu usuario no está asociado a un refugio.",
            );
        }

        const service = await createUserService();
        return { success: true, data: await service.listStaff(shelterId) };
    } catch (error) {
        return { success: false, error: toUserErrorMessage(error) };
    }
}

/** Activa o desactiva un miembro, con alcance global para el superadmin. */
export async function toggleStaffStatusAction(
    id: number,
    activo: boolean,
): Promise<UserActionResult<StaffListItem>> {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            throw new UserAuthorizationError("Inicia sesión para continuar.");
        }
        ensureCanManageStaff(currentUser);

        const shelterId = isSuperadmin(currentUser)
            ? null
            : currentUser.shelterId;
        if (shelterId === null && !isSuperadmin(currentUser)) {
            throw new UserAuthorizationError(
                "Tu usuario no está asociado a un refugio.",
            );
        }

        const service = await createUserService();
        const user = await service.toggleStaffStatus(id, shelterId, activo);

        revalidatePath("/staff");
        return { success: true, data: user };
    } catch (error) {
        return { success: false, error: toUserErrorMessage(error) };
    }
}

/** Elimina un miembro, con alcance global para el superadmin. */
export async function deleteStaffAction(id: number): Promise<UserActionResult> {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            throw new UserAuthorizationError("Inicia sesión para continuar.");
        }
        ensureCanManageStaff(currentUser);

        const shelterId = isSuperadmin(currentUser)
            ? null
            : currentUser.shelterId;
        if (shelterId === null && !isSuperadmin(currentUser)) {
            throw new UserAuthorizationError(
                "Tu usuario no está asociado a un refugio.",
            );
        }

        const service = await createUserService();
        await service.deleteStaff(id, shelterId);

        revalidatePath("/staff");
        return { success: true, data: undefined };
    } catch (error) {
        return { success: false, error: toUserErrorMessage(error) };
    }
}
