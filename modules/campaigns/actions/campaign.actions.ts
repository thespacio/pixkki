"use server";

import { revalidatePath } from "next/cache";
import { ZodError, z } from "zod";
import { getCurrentUser } from "@/modules/auth";
import { rateLimit } from "@/lib/rate-limit";
import { CAMPAIGN_PERMISSIONS, getCampaignAccess } from "@/modules/campaigns/access";
import { createCampaignService } from "@/modules/campaigns/factories/create-campaign-service";
import { isMissingTableError, MISSING_MIGRATION_MESSAGE } from "@/modules/campaigns/db-errors";
import {
    AiServiceError,
    CampaignAnimalsError,
    CampaignForbiddenError,
    CampaignNotFoundError,
    CampaignPublishError,
    CampaignRateLimitError,
    CampaignShelterNotFoundError,
    NoAdoptableAnimalsError,
    type Campaign,
    type SuggestionBatch,
} from "@/modules/campaigns/types";
import {
    CampaignStatusChangeSchema,
    CreateCampaignSchema,
    GenerateSuggestionsSchema,
    UpdateCampaignSchema,
    type CampaignStatusChangeInput,
    type CreateCampaignInput,
    type GenerateSuggestionsInput,
    type UpdateCampaignInput,
} from "@/modules/campaigns/validators";

const CAMPAIGNS_PATH = "/campaigns";
const LANDING_PATH = "/";

// Pedir sugerencias cuesta cuota de la IA: tope por usuario para frenar clics repetidos o abuso.
const GENERATION_LIMIT = { limit: 8, windowMs: 10 * 60 * 1000 };

/**
 * Las acciones devuelven un resultado en vez de lanzar: en producción Next.js
 * oculta el mensaje de cualquier excepción que sale de una Server Action, y el
 * usuario vería un error genérico sin saber qué corregir.
 */
export type CampaignActionResult<T = void> =
    | { success: true; data: T }
    | { success: false; error: string };

// Errores cuyo mensaje ya está pensado para mostrarse al usuario.
const USER_FACING_ERRORS = [
    AiServiceError,
    CampaignAnimalsError,
    CampaignForbiddenError,
    CampaignNotFoundError,
    CampaignPublishError,
    CampaignRateLimitError,
    CampaignShelterNotFoundError,
    NoAdoptableAnimalsError,
];

function toErrorMessage(error: unknown): string {
    if (error instanceof ZodError) {
        const issue = error.issues[0];
        const field = issue?.path.join(".");
        return field ? `${field}: ${issue.message}` : (issue?.message ?? "Datos inválidos");
    }

    if (USER_FACING_ERRORS.some((E) => error instanceof E)) {
        return (error as Error).message;
    }

    // Los errores de Supabase/PostgREST son objetos con `code` y `message`.
    if (typeof error === "object" && error !== null && "code" in error) {
        const { code, message } = error as { code?: string; message?: string };

        // Tabla o vista inexistente: falta aplicar la migración de campañas.
        if (isMissingTableError(error)) return MISSING_MIGRATION_MESSAGE;
        if (code === "42501") {
            return "La base de datos rechazó la operación por permisos (RLS).";
        }
        console.error("[campaign.actions] Error de Supabase:", { code, message });
        return "No se pudo completar la operación. Intenta de nuevo.";
    }

    console.error("[campaign.actions] Error inesperado:", error);
    return "No se pudo completar la operación. Intenta de nuevo.";
}

function ensureCan(permissions: string[], permission: string, accion: string): void {
    if (!permissions.includes(permission)) throw new CampaignForbiddenError(accion);
}

function refresh(): void {
    // Panel del personal y landing pública (la landing muestra las campañas publicadas).
    revalidatePath(CAMPAIGNS_PATH);
    revalidatePath(LANDING_PATH);
}

export async function generateCampaignSuggestionsAction(
    input: GenerateSuggestionsInput,
): Promise<CampaignActionResult<SuggestionBatch>> {
    try {
        const user = await getCurrentUser();
        ensureCan(user.permissions, CAMPAIGN_PERMISSIONS.create, "generar sugerencias de campañas");

        const data = GenerateSuggestionsSchema.parse(input);

        const limit = rateLimit(`campaigns:generate:${user.id}`, GENERATION_LIMIT);
        if (!limit.allowed) throw new CampaignRateLimitError(limit.retryAfterSeconds);

        const service = await createCampaignService();
        const batch = await service.generate(data, getCampaignAccess(user));

        return { success: true, data: batch };
    } catch (error) {
        return { success: false, error: toErrorMessage(error) };
    }
}

export async function createCampaignAction(
    input: CreateCampaignInput,
): Promise<CampaignActionResult<Campaign>> {
    try {
        const user = await getCurrentUser();
        ensureCan(user.permissions, CAMPAIGN_PERMISSIONS.create, "crear campañas");

        const data = CreateCampaignSchema.parse(input);
        const service = await createCampaignService();
        const campaign = await service.create(data, getCampaignAccess(user));

        refresh();
        return { success: true, data: campaign };
    } catch (error) {
        return { success: false, error: toErrorMessage(error) };
    }
}

export async function updateCampaignAction(
    input: UpdateCampaignInput,
): Promise<CampaignActionResult<Campaign>> {
    try {
        const user = await getCurrentUser();
        ensureCan(user.permissions, CAMPAIGN_PERMISSIONS.edit, "editar campañas");

        const data = UpdateCampaignSchema.parse(input);
        const service = await createCampaignService();
        const campaign = await service.updateText(data, getCampaignAccess(user));

        refresh();
        return { success: true, data: campaign };
    } catch (error) {
        return { success: false, error: toErrorMessage(error) };
    }
}

export async function setCampaignStatusAction(
    input: CampaignStatusChangeInput,
): Promise<CampaignActionResult<Campaign>> {
    try {
        const user = await getCurrentUser();
        ensureCan(user.permissions, CAMPAIGN_PERMISSIONS.edit, "publicar o archivar campañas");

        const data = CampaignStatusChangeSchema.parse(input);
        const service = await createCampaignService();
        const campaign = await service.setStatus(data.id, data.status, getCampaignAccess(user));

        refresh();
        return { success: true, data: campaign };
    } catch (error) {
        return { success: false, error: toErrorMessage(error) };
    }
}

export async function deleteCampaignAction(id: number): Promise<CampaignActionResult> {
    try {
        const user = await getCurrentUser();
        ensureCan(user.permissions, CAMPAIGN_PERMISSIONS.delete, "eliminar campañas");

        const campaignId = z.number().int().positive().parse(id);
        const service = await createCampaignService();
        await service.delete(campaignId, getCampaignAccess(user));

        refresh();
        return { success: true, data: undefined };
    } catch (error) {
        return { success: false, error: toErrorMessage(error) };
    }
}
