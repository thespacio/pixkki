// modules/spaces/actions/space.actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {CreateSpaceInput, SpaceFilters, UpdateSpaceInput} from "@/modules/spaces/types/types";
import {createSpaceService} from "@/modules/spaces/factories/factories";
import {getCurrentUser} from "@/modules/auth";
import {isAdmin, isSuperadmin} from "@/modules/auth/authorization";
import type {AuthenticatedUser} from "@/modules/auth/types";
import type { SpaceWithOccupancy } from "@/modules/spaces/ports/space-occupancy.port";

const NO_SHELTER_ERROR = 'El usuario no tiene un albergue asignado';
const FORBIDDEN_ERROR = 'No tienes permisos para gestionar espacios';

/**
 * Alcance multitenant de las consultas:
 * - superadmin → `undefined` (sin filtro, ve todos los refugios)
 * - resto      → su propio `shelterId` (o -1 si no tiene, que nunca coincide)
 */
function shelterScope(user: AuthenticatedUser): number | undefined {
    return isSuperadmin(user) ? undefined : user.shelterId ?? -1;
}

/** Las mutaciones de espacios están reservadas a Admin y Superadmin. */
function canManageSpaces(user: AuthenticatedUser): boolean {
    return isAdmin(user) || isSuperadmin(user);
}

/**
 * Crea un nuevo espacio
 */
export async function createSpaceAction(dto: CreateSpaceInput) {
    try {
        const user = await getCurrentUser();

        if (!canManageSpaces(user)) {
            return { success: false, error: FORBIDDEN_ERROR };
        }

        if (user.shelterId === null) {
            return { success: false, error: NO_SHELTER_ERROR };
        }

        const shelterId = user.shelterId;
        const service = await createSpaceService();

        const result = await service.createSpace({
            dto,
            shelterId,
        });

        revalidatePath('/espacios');
        revalidatePath(`/refugios/${shelterId}`);

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
        const user = await getCurrentUser();
        const service = await createSpaceService();
        const result = await service.getSpaceById(id, shelterScope(user));
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
        const user = await getCurrentUser();

        // El superadmin puede filtrar por cualquier refugio; el resto solo por
        // el suyo, aunque envíe otro `shelterId`.
        const scopedFilters: SpaceFilters | undefined = isSuperadmin(user)
            ? filters
            : { ...filters, shelterId: user.shelterId ?? -1 };

        const service = await createSpaceService();
        const result = await service.getSpaces(scopedFilters);
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
        const user = await getCurrentUser();

        if (!isSuperadmin(user) && shelterId !== user.shelterId) {
            return { success: false, error: FORBIDDEN_ERROR };
        }

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
 * Obtiene espacios del refugio con ocupación calculada (RF3.1).
 * `onlyWithCapacity` filtra espacios con capacidad libre > 0 tras calcular ocupación.
 */
export async function getSpacesWithOccupancyAction(
    filters?: SpaceFilters,
    options?: { onlyWithCapacity?: boolean }
): Promise<{ success: true; data: SpaceWithOccupancy[] } | { success: false; error: string }> {
    try {
        const user = await getCurrentUser();

        const scopedFilters: SpaceFilters | undefined = isSuperadmin(user)
            ? filters
            : { ...filters, shelterId: user.shelterId ?? -1 };

        const service = await createSpaceService();
        const result = await service.listWithOccupancy(scopedFilters);
        const data = options?.onlyWithCapacity
            ? result.filter((space) => space.capacidadLibre > 0)
            : result;

        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al obtener los espacios',
        };
    }
}

/**
 * Actualiza un espacio
 */
export async function updateSpaceAction(id: number, dto: UpdateSpaceInput) {
    try {
        const user = await getCurrentUser();

        if (!canManageSpaces(user)) {
            return { success: false, error: FORBIDDEN_ERROR };
        }

        const scope = shelterScope(user);
        const service = await createSpaceService();

        // Obtener el shelterId antes de actualizar para revalidar las rutas correctas
        const currentSpace = await service.getSpaceById(id, scope);

        const result = await service.updateSpace(id, dto, scope);

        // Revalidar rutas relacionadas
        revalidatePath(`/espacios`);
        revalidatePath(`/refugios/${currentSpace.shelterId}`);

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
        const user = await getCurrentUser();

        if (!canManageSpaces(user)) {
            return { success: false, error: FORBIDDEN_ERROR };
        }

        const scope = shelterScope(user);
        const service = await createSpaceService();

        // Obtener el shelterId antes de eliminar para revalidar las rutas correctas
        const currentSpace = await service.getSpaceById(id, scope);

        await service.deleteSpace(id, scope);

        // Revalidar rutas relacionadas
        revalidatePath(`/espacios`);
        revalidatePath(`/refugios/${currentSpace.shelterId}`);

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
        const user = await getCurrentUser();
        const service = await createSpaceService();
        const result = await service.checkSpaceAvailability(spaceId, shelterScope(user));
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
        const user = await getCurrentUser();

        if (!isSuperadmin(user) && shelterId !== user.shelterId) {
            return { success: false, error: FORBIDDEN_ERROR };
        }

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
    redirect(`/refugios/${shelterId}`);
}
