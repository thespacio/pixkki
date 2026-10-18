"use server";


import {createCreateShelterWithAdminUseCase, createShelterService} from "@/modules/shelters/factories";
import {revalidatePath} from "next/cache";
import {getCurrentUser} from "@/modules/auth";
import {CreateShelterWithAdminInput, ShelterQueryParams, UpdateShelterInput} from "@/modules/shelters/types";

//Actions: hablan con el servidor

// ===== CONSULTAS =====

/**
 * Obtiene un refugio por su ID
 * Ruta: /shelters/[id]
 */
export async function getShelterDetailsByIdAction(id: number) {
    const authContext = await getCurrentUser();
    const service = await createShelterService();
    const shelter = await service.findById(id, authContext);

    return {
        success: true,
        data: shelter
    };
}

/**
 * Obtiene la lista de refugios con filtros
 * Ruta: /shelters
 */
export async function getSheltersAction(filters: ShelterQueryParams) {
    const authContext = await getCurrentUser();
    const service = await createShelterService();

    const result = await service.findAll(filters, authContext);

    return {
        success: true,
        data: result.data,
        pagination: result.pagination
    };
}

// ===== GESTIÓN =====

/**
 * Crea un nuevo refugio
 * Ruta: /shelters/new
 */

export async function createShelterAction(
    input: CreateShelterWithAdminInput
) {
    const useCase = await createCreateShelterWithAdminUseCase();

    return await useCase.execute(input);
}

/**
 * Actualiza un refugio existente
 * Ruta: /shelters/[id]/edit
 */
export async function updateShelterAction(id: number, updates: UpdateShelterInput) {
    console.log("hola");

    const authContext = await getCurrentUser();
    const service = await createShelterService();

    const result = await service.update(id, updates, authContext);

    // Revalidar las rutas afectadas
    revalidatePath(`/shelters/${id}`);
    revalidatePath('/shelters');
    revalidatePath('/shelters/manage');

    return {
        success: true,
        data: result.shelter,
        changes: result.changes,
        message: `Refugio actualizado exitosamente`
    };
}

// ===== ACCIONES ADICIONALES (MANTENIMIENTO) =====
/*

/!**
 * Elimina (desactiva) un refugio
 * Ruta: /shelters/manage
 *!/
export async function deactivateShelterAction(id: number) {
    const authContext = await getCurrentUser();
    const service = await createShelterService();

    // Actualizar el estado a inactivo
    const result = await service.update(id, { activo: false }, authContext);

    // Revalidar rutas
    revalidatePath(`/shelters/${id}`);
    revalidatePath('/shelters');
    revalidatePath('/shelters/manage');

    return {
        success: true,
        message: `Refugio desactivado exitosamente`,
        data: result.shelter
    };
}

/!**
 * Reactiva un refugio
 * Ruta: /shelters/manage
 *!/
export async function activateShelterAction(id: number) {
    const authContext = await getCurrentUser();
    const service = await createShelterService();

    // Actualizar el estado a activo
    const result = await service.update(id, { activo: true }, authContext);

    // Revalidar rutas
    revalidatePath(`/shelters/${id}`);
    revalidatePath('/shelters');
    revalidatePath('/shelters/manage');

    return {
        success: true,
        message: `Refugio reactivado exitosamente`,
        data: result.shelter
    };
}

/!**
 * Obtiene estadísticas de refugios (para dashboard)
 * Ruta: /shelters/info
 *!/
export async function getSheltersStatsAction(id: number) {
    const authContext = await getCurrentUser();
    const service = await createShelterService();
    const shelter = await service.findById(id, authContext);

    // Obtener todos los refugios para calcular estadísticas
    const result = await service.findAll({ limit: 1000, offset: 0 }, authContext);

    const stats = {
        total: result.pagination.total,
        active: result.data.filter(s => s.activo).length,
        inactive: result.data.filter(s => !s.activo).length,
        // Agrupar por ciudad o estado si es necesario
    };

    return {
        success: true,
        data: stats,
        id: shelter.id
    };
}*/
