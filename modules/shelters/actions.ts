"use server";


import {createCreateShelterWithAdminUseCase, createShelterService} from "@/modules/shelters/factories";
import {ShelterAuthorization} from "@/modules/shelters/authorization";
import {revalidatePath} from "next/cache";
import {getCurrentUser} from "@/modules/auth";
import {CreateShelterWithAdminInput, ShelterQueryParams, UpdateShelterInput} from "@/modules/shelters/types";

//Actions: hablan con el servidor

// ===== CONSULTAS =====

/**
 * Obtiene un refugio por su ID
 * Ruta: /refugios/[id]
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
 * Ruta: /refugios
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
 * Ruta: /refugios/nuevo
 */

export async function createShelterAction(
    input: CreateShelterWithAdminInput
) {
    // Solo el superadmin puede dar de alta refugios y a su administrador.
    const authContext = await getCurrentUser();
    ShelterAuthorization.ensureCanCreate(authContext);

    const useCase = await createCreateShelterWithAdminUseCase();

    return await useCase.execute(input);
}

/**
 * Actualiza un refugio existente
 * Ruta: /refugios/[id]/edit
 */
export async function updateShelterAction(id: number, updates: UpdateShelterInput) {
    const authContext = await getCurrentUser();
    const service = await createShelterService();

    const result = await service.update(id, updates, authContext);

    // Revalidar las rutas afectadas
    revalidatePath(`/refugios/${id}`);
    revalidatePath('/refugios');
    revalidatePath('/refugios/manage');

    return {
        success: true,
        data: result.shelter,
        changes: result.changes,
        message: `Refugio actualizado exitosamente`
    };
}

/**
 * Activa o desactiva un refugio (F-SHELTER-03 / RF0.2)
 * Ruta: /refugios/manage (Switch de estado)
 * Solo el superadmin puede operarlo (la autorización se valida en el service).
 */
export async function toggleShelterStatusAction(id: number, activo: boolean) {
    try {
        const authContext = await getCurrentUser();
        const service = await createShelterService();

        const shelter = await service.updateStatus(id, activo, authContext);

        // Revalidar las rutas afectadas
        revalidatePath(`/refugios/${id}`);
        revalidatePath('/refugios');
        revalidatePath('/refugios/manage');

        return {
            success: true,
            message: `Refugio ${activo ? 'activado' : 'desactivado'} exitosamente`,
            data: shelter
        };
    } catch (error) {
        // El consumidor (ShelterStatusSwitch) espera un resultado tipado,
        // no una excepción: se traduce el error a mensaje para la UI.
        return {
            success: false,
            message: error instanceof Error
                ? error.message
                : 'Error al actualizar el estado del refugio',
            data: null
        };
    }
}

// ===== ACCIONES ADICIONALES (MANTENIMIENTO) =====
/*

/!**
 * Elimina (desactiva) un refugio
 * Ruta: /refugios/manage
 *!/
export async function deactivateShelterAction(id: number) {
    const authContext = await getCurrentUser();
    const service = await createShelterService();

    // Actualizar el estado a inactivo
    const result = await service.update(id, { activo: false }, authContext);

    // Revalidar rutas
    revalidatePath(`/refugios/${id}`);
    revalidatePath('/refugios');
    revalidatePath('/refugios/manage');

    return {
        success: true,
        message: `Refugio desactivado exitosamente`,
        data: result.shelter
    };
}

/!**
 * Reactiva un refugio
 * Ruta: /refugios/manage
 *!/
export async function activateShelterAction(id: number) {
    const authContext = await getCurrentUser();
    const service = await createShelterService();

    // Actualizar el estado a activo
    const result = await service.update(id, { activo: true }, authContext);

    // Revalidar rutas
    revalidatePath(`/refugios/${id}`);
    revalidatePath('/refugios');
    revalidatePath('/refugios/manage');

    return {
        success: true,
        message: `Refugio reactivado exitosamente`,
        data: result.shelter
    };
}

/!**
 * Obtiene estadísticas de refugios (para dashboard)
 * Ruta: /refugios/info
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
