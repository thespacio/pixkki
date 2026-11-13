import type { AuthenticatedUser } from "@/modules/auth/types";
import { isSuperadmin } from "@/modules/auth/authorization";

// Se reexporta para no romper a quien ya lo importaba desde acá: la regla vive en auth.
export { isSuperadmin };

/**
 * Alcance de un usuario sobre los animales:
 * - `shelterId`: su albergue propio.
 * - `allShelters`: true solo para superadmin (ve y opera sobre todos los albergues).
 */
export type AnimalAccess = {
    shelterId: number;
    allShelters: boolean;
};

export function getAnimalAccess(
    user: Pick<AuthenticatedUser, "role" | "shelterId">,
): AnimalAccess {
    // El superadmin no tiene albergue propio (`id_refugio` nullable) y opera a
    // nivel global, por lo que nunca usa `shelterId`. Para el resto siempre
    // existe un albergue asignado.
    return { shelterId: user.shelterId ?? 0, allShelters: isSuperadmin(user) };
}

/** Permisos del módulo de animales (nombres tal como están en `rol_permiso`). */
export const ANIMAL_PERMISSIONS = {
    view: "animals.view",
    create: "animals.create",
    edit: "animals.edit",
    delete: "animals.delete",
} as const;
