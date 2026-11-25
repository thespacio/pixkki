// ---------------------------------------------------------------------------
// Caso de uso compartido: habilitar (gatekeeper de Épica 4) y publicar el
// perfil público (Épica 5) en una sola operación de usuario.
//
// Compone servicios públicos de `animals` y `adoptions`; ninguno de los dos
// módulos conoce la implementación del otro. Necesita `animals.edit` para
// habilitar al paciente y `adoptions.publish` para publicar el perfil.
// ---------------------------------------------------------------------------

import type { AuthenticatedUser } from "@/modules/auth/types";
import { ANIMAL_PERMISSIONS, getAnimalAccess } from "@/modules/animals/access";
import { createAnimalAdoptionService } from "@/modules/animals/factories/create-animal-adoption-service";
import type { AdoptionPublication } from "@/modules/animals/repositories/animal-adoption.repository";
import { ADOPTION_PERMISSIONS } from "@/modules/adoptions/access";
import { createProfileService } from "@/modules/adoptions/factories/create-profile-service";
import {
    FalloGatekeeperAdopcionError,
    PublicacionIncompletaError,
    RolSinPermisoError,
} from "@/modules/adoptions/errors";
import type { PublicarAnimalEnAdopcionesInput } from "@/modules/adoptions/validators/public-profile.validators";

type Resultado = {
    /** null cuando el animal ya estaba habilitado y no hubo que repetir el gatekeeper. */
    aptitud: AdoptionPublication | null;
    perfil: unknown;
};

function extraerBloqueos(error: unknown): string[] {
    if (typeof error !== "object" || error === null || !("details" in error)) return [];
    const bloqueos = (error as { details?: { bloqueos?: unknown } }).details?.bloqueos;
    return Array.isArray(bloqueos)
        ? bloqueos.filter((b): b is string => typeof b === "string")
        : [];
}

function mensajeDe(error: unknown): string {
    return error instanceof Error && error.message
        ? error.message
        : "No se pudo completar la operación.";
}

export async function publicarAnimalEnAdopciones(
    idAnimal: number,
    input: PublicarAnimalEnAdopcionesInput,
    user: AuthenticatedUser,
): Promise<Resultado> {
    const permisos = user.permissions;
    if (!permisos.includes(ADOPTION_PERMISSIONS.publish)) {
        throw new RolSinPermisoError();
    }

    const profileService = await createProfileService();
    const estado = await profileService.get(idAnimal, user) as { disponible_adopcion?: boolean };
    const requiereGatekeeper = estado?.disponible_adopcion !== true;

    if (requiereGatekeeper && !permisos.includes(ANIMAL_PERMISSIONS.edit)) {
        throw new RolSinPermisoError();
    }

    // Paso 1 — gatekeeper: habilita al paciente para adopción. Si ya está
    // habilitado, la RPC de perfil revalida igualmente todas las condiciones.
    let aptitud: AdoptionPublication | null = null;
    if (requiereGatekeeper) {
        const animalService = await createAnimalAdoptionService();
        try {
            aptitud = await animalService.setDisponibility(
                idAnimal,
                getAnimalAccess(user),
                {
                    disponible_adopcion: true,
                    autorizar_excepcion: input.autorizar_excepcion,
                    motivo_excepcion: input.motivo_excepcion ?? null,
                },
                { id: user.id, role: user.role },
            );
        } catch (error) {
            if (typeof error === "object" && error !== null && "code" in error) {
                const codigo = String((error as { code: unknown }).code);
                throw new FalloGatekeeperAdopcionError(
                    codigo,
                    mensajeDe(error),
                    extraerBloqueos(error),
                );
            }
            throw error;
        }
    }

    // Paso 2 — perfil público: aquí es donde el animal entra al catálogo.
    try {
        const perfil = await profileService.upsert(
            idAnimal,
            { descripcion_publica: input.descripcion_publica, publicado: true },
            user,
        );
        return { aptitud, perfil };
    } catch (error) {
        throw new PublicacionIncompletaError(mensajeDe(error), extraerBloqueos(error));
    }
}
