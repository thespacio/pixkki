"use server";

import {revalidatePath} from "next/cache";

import {getCurrentUser} from "@/modules/auth";
import {
    createCreateShelterWithAdminUseCase,
    createShelterService
} from "@/modules/shelters/factories";
import {
    CreateShelterWithAdminSchema,
    UpdateShelterSchema
} from "@/modules/shelters/schemas";
import {
    Shelter,
    ShelterListItem,
    ShelterQueryParams
} from "@/modules/shelters/types";
import {ShelterError} from "@/modules/shelters/errors";

type FailureResult = {
    success: false;
    message: string;
};

type Pagination = {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
};

type DetailsResult =
    | { success: true; data: Shelter }
    | FailureResult;

type ListResult =
    | { success: true; data: ShelterListItem[]; pagination: Pagination }
    | FailureResult;

type CreateResult =
    | { success: true; data: { id: number; nombre: string }; message: string }
    | FailureResult;

type UpdateResult =
    | { success: true; data: Shelter; changes: string[]; message: string }
    | FailureResult;

type StatusResult =
    | { success: true; message: string }
    | FailureResult;

function toErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof ShelterError || error instanceof Error) {
        return error.message;
    }
    return fallback;
}

// ===== CONSULTAS =====

/**
 * Obtiene un refugio por su ID
 * Ruta: /shelters/[id]
 */
export async function getShelterDetailsByIdAction(id: number): Promise<DetailsResult> {
    try {
        const authContext = await getCurrentUser();
        const service = await createShelterService();
        const shelter = await service.findById(id, authContext);

        return {
            success: true,
            data: shelter
        };
    } catch (error) {
        return {
            success: false,
            message: toErrorMessage(error, 'Error al obtener el refugio')
        };
    }
}

/**
 * Obtiene la lista de refugios con filtros
 * Ruta: /shelters
 */
export async function getSheltersAction(filters: ShelterQueryParams): Promise<ListResult> {
    try {
        const authContext = await getCurrentUser();
        const service = await createShelterService();

        const result = await service.findAll(filters, authContext);

        return {
            success: true,
            data: result.data,
            pagination: result.pagination
        };
    } catch (error) {
        return {
            success: false,
            message: toErrorMessage(error, 'Error al obtener los refugios')
        };
    }
}

// ===== GESTIÓN =====

/**
 * Crea un nuevo refugio con su administrador (F-SHELTER-02).
 * Valida entrada con Zod y autoriza antes de ejecutar el use case.
 * Ruta: /shelters/new
 */
export async function createShelterAction(
    input: unknown
): Promise<CreateResult> {
    // 1. Validación de entrada (Zod) antes de cualquier efecto
    const parsed = CreateShelterWithAdminSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: parsed.error.issues[0]?.message ?? "Datos inválidos"
        };
    }

    try {
        // 2. Contexto de autorización (F-SHELTER-02: Solo superadmin)
        const authContext = await getCurrentUser();

        // 3. Ejecutar el use case
        const useCase = await createCreateShelterWithAdminUseCase();
        const result = await useCase.execute(
            parsed.data,
            authContext
        );

        revalidatePath('/shelters');

        return {
            success: true,
            message: `Refugio "${result.shelter.nombre}" creado exitosamente`,
            data: result.shelter
        };
    } catch (error) {
        return {
            success: false,
            message: toErrorMessage(error, "Error al crear el refugio")
        };
    }
}

/**
 * Actualiza un refugio existente
 * Ruta: /shelters/[id]/edit
 */
export async function updateShelterAction(
    id: number,
    updates: unknown
): Promise<UpdateResult> {
    // 1. Validación de entrada (Zod)
    const parsed = UpdateShelterSchema.safeParse(updates);

    if (!parsed.success) {
        return {
            success: false,
            message: parsed.error.issues[0]?.message ?? "Datos inválidos"
        };
    }

    try {
        const authContext = await getCurrentUser();
        const service = await createShelterService();

        const result = await service.update(
            id,
            parsed.data,
            authContext
        );

        // Revalidar las rutas afectadas
        revalidatePath(`/shelters/${id}`);
        revalidatePath('/shelters');

        return {
            success: true,
            data: result.shelter,
            changes: result.changes,
            message: `Refugio actualizado exitosamente`
        };
    } catch (error) {
        return {
            success: false,
            message: toErrorMessage(error, "Error al actualizar el refugio")
        };
    }
}

/**
 * Activa o desactiva un refugio (F-SHELTER-03).
 * Bloquea el login de los usuarios del refugio inactivo y lo oculta
 * del catálogo público.
 */
export async function toggleShelterStatusAction(
    id: number,
    activo: boolean
): Promise<StatusResult> {
    try {
        const authContext = await getCurrentUser();
        const service = await createShelterService();

        const result = await service.setStatus(id, activo, authContext);

        revalidatePath('/shelters');
        revalidatePath(`/shelters/${id}`);

        return {
            success: true,
            message: result.message
        };
    } catch (error) {
        return {
            success: false,
            message: toErrorMessage(error, "Error al actualizar el estado del refugio")
        };
    }
}

// ===== ACCIONES ADICIONALES (MANTENIMIENTO) =====
