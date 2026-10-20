// modules/spaces/actions/space.actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {CreateSpaceInput, SpaceFilters, UpdateSpaceInput} from "@/modules/spaces/types/types";
import {createSpaceService} from "@/modules/spaces/factories/factories";
import {getAuthUser, getCurrentUser} from "@/modules/auth";
import {getShelterDetailsByIdAction} from "@/modules/shelters/actions";


/**
 * Crea un nuevo espacio
 */
export async function createSpaceAction(dto: CreateSpaceInput) {
    try {
        const user = await getCurrentUser();
        const shelterId = user.shelterId;
        const service = await createSpaceService();

        const result = await service.createSpace({
            dto,
            shelterId,
        });

        /*revalidatePath(`/shelters/${shelterId}/spaces`);
        revalidatePath(`/shelters/${shelterId}`);*/

        return {
            success: true,
            data: result,
        };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Error al crear el espacio',
        };
    }
}

/**
 * Obtiene un espacio por su ID
 */
export async function getSpaceAction(id: number) {
    try {
        const service = await createSpaceService();
        const result = await service.getSpaceById(id);
        return { success: true, data: result };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al obtener el espacio',
        };
    }
}

/**
 * Obtiene espacios con filtros
 */
export async function getSpacesAction(filters?: SpaceFilters) {
    try {
        const service = await createSpaceService();
        const result = await service.getSpaces(filters);
        return { success: true, data: result };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al obtener los espacios',
        };
    }
}

/**
 * Obtiene todos los espacios de un refugio
 */
export async function getSpacesByShelterAction(shelterId: number) {
    try {
        const service = await createSpaceService();
        const result = await service.getSpacesByShelter(shelterId);
        return { success: true, data: result };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al obtener los espacios del refugio',
        };
    }
}

/**
 * Actualiza un espacio
 */
export async function updateSpaceAction(id: number, dto: UpdateSpaceInput) {
    try {
        const service = await createSpaceService();

        // Obtener el shelterId antes de actualizar para revalidar las rutas correctas
        const currentSpace = await service.getSpaceById(id);

        const result = await service.updateSpace(id, dto);

        // Revalidar rutas relacionadas
        revalidatePath(`/shelters/${currentSpace.shelterId}/spaces`);
        revalidatePath(`/shelters/${currentSpace.shelterId}`);
        revalidatePath(`/spaces/${id}`);

        return { success: true, data: result };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al actualizar el espacio',
        };
    }
}

/**
 * Elimina un espacio
 */
export async function deleteSpaceAction(id: number) {
    try {
        const service = await createSpaceService();

        // Obtener el shelterId antes de eliminar para revalidar las rutas correctas
        const currentSpace = await service.getSpaceById(id);

        await service.deleteSpace(id);

        // Revalidar rutas relacionadas
        revalidatePath(`/shelters/${currentSpace.shelterId}/spaces`);
        revalidatePath(`/shelters/${currentSpace.shelterId}`);

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al eliminar el espacio',
        };
    }
}

/**
 * Verifica si un espacio está disponible
 */
export async function checkSpaceAvailabilityAction(spaceId: number) {
    try {
        const service = await createSpaceService();
        const result = await service.checkSpaceAvailability(spaceId);
        return { success: true, data: result };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al verificar disponibilidad',
        };
    }
}

/**
 * Obtiene espacios disponibles para un refugio
 */
export async function getAvailableSpacesAction(shelterId: number) {
    try {
        const service = await createSpaceService();
        const result = await service.getAvailableSpaces(shelterId);
        return { success: true, data: result };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al obtener espacios disponibles',
        };
    }
}

/**
 * Redirige al listado de espacios de un refugio después de una acción exitosa
 */
export async function redirectToShelterSpacesAction(shelterId: number) {
    redirect(`/shelters/${shelterId}/spaces`);
}