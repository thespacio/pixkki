// app/api/v1/animales/route-helpers.ts

import { getCurrentUser } from "@/modules/auth";
import { ANIMAL_PERMISSIONS } from "@/modules/animals/access";
import { AnimalForbiddenError } from "@/modules/animals/types/animales.types";
import type { AuthenticatedUser } from "@/modules/auth/types";

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

/** Error de path param inválido: `handleApiError` lo traduce a 400. */
class InvalidRouteParamError extends Error {
    readonly code = "PARAMETRO_INVALIDO";
    readonly statusCode = 400;

    constructor(field: string) {
        super(`${field} inválido`);
        this.name = "InvalidRouteParamError";
    }
}

/** Convierte el segmento `[id]` de la ruta en un entero positivo. */
export function parseRouteId(value: string, field = "ID"): number {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new InvalidRouteParamError(field);
    }

    return parsed;
}
