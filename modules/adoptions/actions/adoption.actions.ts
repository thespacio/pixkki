"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/modules/auth";
import { createPublicCatalogService } from "../factories/create-public-catalog-service";
import { createApplicationService } from "../factories/create-application-service";
import { createEvaluationService } from "../factories/create-evaluation-service";
import { createProfileService } from "../factories/create-profile-service";
import { createAdoptionStateService } from "../factories/create-adoption-service";
import { ADOPTION_PERMISSIONS } from "../access";
import { RolSinPermisoError } from "../errors";
import { PublicarAnimalEnAdopcionesSchema } from "../validators/public-profile.validators";
import { publicarAnimalEnAdopciones } from "@/modules/use-cases/publicar-animal-en-adopciones";
import {
    toAdoptionErrorResult,
    type AdoptionActionResult,
} from "./adoption-action-result";

function ensurePermission(permissions: string[], permission: string) {
    if (!permissions.includes(permission)) throw new RolSinPermisoError();
}

function getRequestIp(): string {
    const h = headers();
    return (
        h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        h.get("x-real-ip") ||
        "unknown"
    );
}

export async function listPublicAdoptionsAction(
    query: Record<string, string | undefined>,
): Promise<AdoptionActionResult<unknown>> {
    try {
        const service = await createPublicCatalogService();
        const data = await service.listCatalog(query);
        return { success: true, data };
    } catch (error) {
        return toAdoptionErrorResult(error);
    }
}

export async function getPublicAdoptionAction(
    idAnimal: number,
): Promise<AdoptionActionResult<unknown>> {
    try {
        const service = await createPublicCatalogService();
        const data = await service.getAnimal(idAnimal);
        return { success: true, data };
    } catch (error) {
        return toAdoptionErrorResult(error);
    }
}

export async function listPublicRefugiosAction(): Promise<AdoptionActionResult<unknown>> {
    try {
        const service = await createPublicCatalogService();
        const data = await service.listRefugios();
        return { success: true, data };
    } catch (error) {
        return toAdoptionErrorResult(error);
    }
}

export async function getPublicRefugioAction(
    slug: string,
): Promise<AdoptionActionResult<unknown>> {
    try {
        const service = await createPublicCatalogService();
        const data = await service.getRefugio(slug);
        return { success: true, data };
    } catch (error) {
        return toAdoptionErrorResult(error);
    }
}

export async function listPublicRefugioAdopcionesAction(
    slug: string,
    query: Record<string, string | undefined>,
): Promise<AdoptionActionResult<unknown>> {
    try {
        const service = await createPublicCatalogService();
        const data = await service.listByRefugio(slug, query);
        return { success: true, data };
    } catch (error) {
        return toAdoptionErrorResult(error);
    }
}

export async function submitPublicApplicationAction(
    idAnimal: number,
    body: unknown,
): Promise<AdoptionActionResult<unknown>> {
    try {
        const service = await createPublicCatalogService();
        const data = await service.submitApplication(idAnimal, body, getRequestIp());
        return { success: true, data };
    } catch (error) {
        return toAdoptionErrorResult(error);
    }
}

export async function consultarSeguimientoPorFolioAction(
    _folio: string,
): Promise<AdoptionActionResult<unknown>> {
    void _folio;
    return {
        success: false,
        error: "La consulta pública por folio aún no está disponible. El contrato backend (G-02) está pendiente de implementación.",
        code: "CONTRATO_PENDIENTE",
    };
}

export async function listSolicitudesAction(
    query: Record<string, string | undefined>,
): Promise<AdoptionActionResult<unknown>> {
    try {
        const user = await getCurrentUser();
        ensurePermission(user.permissions, ADOPTION_PERMISSIONS.view);
        const service = await createApplicationService();
        const data = await service.list(query, user);
        return { success: true, data };
    } catch (error) {
        return toAdoptionErrorResult(error);
    }
}

export async function getSolicitudAction(
    idSolicitud: number,
): Promise<AdoptionActionResult<unknown>> {
    try {
        const user = await getCurrentUser();
        ensurePermission(user.permissions, ADOPTION_PERMISSIONS.view);
        const service = await createApplicationService();
        const data = await service.getById(idSolicitud, user);
        return { success: true, data };
    } catch (error) {
        return toAdoptionErrorResult(error);
    }
}

export async function createEvaluacionAction(
    idSolicitud: number,
    body: unknown,
): Promise<AdoptionActionResult<unknown>> {
    try {
        const user = await getCurrentUser();
        ensurePermission(user.permissions, ADOPTION_PERMISSIONS.evaluate);
        const service = await createEvaluationService();
        const data = await service.create(idSolicitud, body, user);
        revalidatePath("/adopciones/solicitudes");
        revalidatePath(`/adopciones/solicitudes/${idSolicitud}`);
        return { success: true, data };
    } catch (error) {
        return toAdoptionErrorResult(error);
    }
}

export async function listEvaluacionesAction(
    idSolicitud: number,
): Promise<AdoptionActionResult<unknown>> {
    try {
        const user = await getCurrentUser();
        ensurePermission(user.permissions, ADOPTION_PERMISSIONS.view);
        const service = await createEvaluationService();
        const data = await service.list(idSolicitud, user);
        return { success: true, data };
    } catch (error) {
        return toAdoptionErrorResult(error);
    }
}

export async function changeSolicitudEstadoAction(
    idSolicitud: number,
    body: unknown,
): Promise<AdoptionActionResult<unknown>> {
    try {
        const user = await getCurrentUser();
        ensurePermission(user.permissions, ADOPTION_PERMISSIONS.manage);
        const service = await createAdoptionStateService();
        const data = await service.changeState(idSolicitud, body, user);
        revalidatePath("/adopciones");
        revalidatePath("/adopciones/solicitudes");
        revalidatePath(`/adopciones/solicitudes/${idSolicitud}`);
        return { success: true, data };
    } catch (error) {
        return toAdoptionErrorResult(error);
    }
}

export async function completarAdopcionAction(
    idSolicitud: number,
    body: unknown,
): Promise<AdoptionActionResult<unknown>> {
    try {
        const user = await getCurrentUser();
        ensurePermission(user.permissions, ADOPTION_PERMISSIONS.complete);
        const service = await createAdoptionStateService();
        const data = await service.complete(idSolicitud, body, user);
        revalidatePath("/adopciones");
        revalidatePath("/adopciones/solicitudes");
        revalidatePath(`/adopciones/solicitudes/${idSolicitud}`);
        return { success: true, data };
    } catch (error) {
        return toAdoptionErrorResult(error);
    }
}

export async function getPerfilAdopcionAction(
    idAnimal: number,
): Promise<AdoptionActionResult<unknown>> {
    try {
        const user = await getCurrentUser();
        ensurePermission(user.permissions, ADOPTION_PERMISSIONS.view);
        const service = await createProfileService();
        const data = await service.get(idAnimal, user);
        return { success: true, data };
    } catch (error) {
        return toAdoptionErrorResult(error);
    }
}

export async function upsertPerfilAdopcionAction(
    idAnimal: number,
    body: unknown,
): Promise<AdoptionActionResult<unknown>> {
    try {
        const user = await getCurrentUser();
        ensurePermission(user.permissions, ADOPTION_PERMISSIONS.publish);
        const service = await createProfileService();
        const data = await service.upsert(idAnimal, body, user);
        revalidateAdoptionPaths(idAnimal);
        return { success: true, data };
    } catch (error) {
        return toAdoptionErrorResult(error);
    }
}

/** Revalida tanto el backoffice como el catálogo público tras publicar/despublicar. */
function revalidateAdoptionPaths(idAnimal: number): void {
    revalidatePath("/adopciones");
    revalidatePath("/adopciones/perfiles");
    revalidatePath("/adopciones/solicitudes");
    revalidatePath(`/adopciones/${idAnimal}`);
    revalidatePath("/adopciones/[idAnimal]", "page");
    revalidatePath("/refugios/[id]", "page");
    revalidatePath("/animales");
    revalidatePath(`/animales/${idAnimal}/ficha-clinica`);
}

/**
 * Flujo unificado: habilita al paciente (gatekeeper) y publica su perfil
 * público. Ambos pasos son necesarios para aparecer en el catálogo.
 */
export async function publicarAnimalEnAdopcionesAction(
    idAnimal: number,
    body: unknown,
): Promise<AdoptionActionResult<unknown>> {
    try {
        if (!Number.isInteger(idAnimal) || idAnimal <= 0) {
            throw new RolSinPermisoError();
        }
        const input = PublicarAnimalEnAdopcionesSchema.parse(body);
        const user = await getCurrentUser();
        const data = await publicarAnimalEnAdopciones(idAnimal, input, user);
        revalidateAdoptionPaths(idAnimal);
        return { success: true, data };
    } catch (error) {
        return toAdoptionErrorResult(error);
    }
}