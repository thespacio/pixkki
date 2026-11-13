// app/api/v1/animales/route-helpers.ts

import { getCurrentUser } from "@/modules/auth";
import { ANIMAL_PERMISSIONS } from "@/modules/animals/access";
import { AnimalForbiddenError } from "@/modules/animals/types/animales.types";
import type { AuthenticatedUser } from "@/modules/auth/types";

/** El parser de `[id]` es genérico: vive en `lib/api` y se reexporta acá. */
export { parseRouteId } from "@/lib/api/request";

/** Exige sesión y permiso del módulo animals (la sesión la valida getCurrentUser). */
export async function requireAnimalUser(
    permission: string = ANIMAL_PERMISSIONS.view,
    accion = "operar sobre animales",
): Promise<AuthenticatedUser> {
    const user = await getCurrentUser();

    if (!user.permissions.includes(permission)) {
        throw new AnimalForbiddenError(accion);
    }

    return user;
}
