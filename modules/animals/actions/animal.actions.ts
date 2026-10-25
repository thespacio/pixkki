"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { CreateAnimalSchema, UpdateAnimalSchema } from "../validators/animal.validators";
import { createAnimalService } from "../factories/create-animal-service";
import type { CreateAnimalDTO } from "../dtos/create-animal.dto";
import type { UpdateAnimalDTO } from "../dtos/update-animal.dto";
import { getCurrentUser } from "@/modules/auth";
import { ANIMAL_PERMISSIONS, getAnimalAccess } from "../access";
import {
    Animal,
    AnimalForbiddenError,
    AnimalMicrochipDuplicateError,
    AnimalNotFoundError,
    AnimalShelterNotFoundError,
    AnimalSpaceMismatchError,
    AnimalStateNotFoundError,
} from "@/modules/animals/types/animales.types";

const ANIMALS_PATH = "/animals";

/**
 * Las acciones devuelven un resultado en vez de lanzar: en producción Next.js
 * oculta el mensaje de cualquier excepción que sale de una Server Action, y el
 * usuario vería un error genérico sin saber qué corregir.
 */
export type AnimalActionResult<T = void> =
    | { success: true; data: T }
    | { success: false; error: string };

// Errores de dominio cuyo mensaje ya está pensado para mostrarse al usuario.
const USER_FACING_ERRORS = [
    AnimalForbiddenError,
    AnimalMicrochipDuplicateError,
    AnimalNotFoundError,
    AnimalShelterNotFoundError,
    AnimalSpaceMismatchError,
    AnimalStateNotFoundError,
];

function toErrorMessage(error: unknown): string {
    if (error instanceof ZodError) {
        const issue = error.issues[0];
        const field = issue?.path.join(".");
        return field ? `${field}: ${issue.message}` : (issue?.message ?? "Datos inválidos");
    }

    if (USER_FACING_ERRORS.some((E) => error instanceof E)) {
        return (error as Error).message;
    }

    // Los errores de Supabase/PostgREST son objetos planos con `code` y `message`
    // (no instancias de Error), por eso se inspeccionan por forma.
    if (typeof error === "object" && error !== null && "code" in error) {
        const { code, message } = error as { code?: string; message?: string };

        if (code === "23505") {
            return "Ya existe un animal con ese microchip";
        }
        // Columna inexistente: la migración de la ficha de rescate no se aplicó.
        if (code === "PGRST204" || code === "42703") {
            return (
                "La base de datos aún no tiene las columnas de la ficha de rescate. " +
                "Ejecuta la migración database/migrations/20261024_animal_datos_rescate.sql en Supabase."
            );
        }
        if (code === "42501") {
            return "La base de datos rechazó la operación por permisos (RLS).";
        }
        console.error("[animal.actions] Error de Supabase:", { code, message });
        return "No se pudo completar la operación. Intenta de nuevo.";
    }

    console.error("[animal.actions] Error inesperado:", error);
    return "No se pudo completar la operación. Intenta de nuevo.";
}

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

        const data = CreateAnimalSchema.parse(dto);
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
