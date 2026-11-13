import type { AuthenticatedUser } from "@/modules/auth/types";
import { isSuperadmin } from "@/modules/auth/authorization";

/**
 * Alcance de un usuario sobre las campañas:
 * - `shelterId`: su albergue propio.
 * - `allShelters`: true solo para superadmin (gestiona las de todos los albergues).
 * - `userId`: quién crea la campaña (queda registrado).
 */
export type CampaignAccess = {
    shelterId: number;
    allShelters: boolean;
    userId: number;
};

export function getCampaignAccess(
    user: Pick<AuthenticatedUser, "id" | "role" | "shelterId">,
): CampaignAccess {
    // El superadmin no tiene albergue propio (`id_refugio` nullable) y opera a
    // nivel global, por lo que nunca usa `shelterId`.
    return { shelterId: user.shelterId ?? 0, allShelters: isSuperadmin(user), userId: user.id };
}

/** Permisos del módulo (nombres tal como están en `permiso` / `rol_permiso`). */
export const CAMPAIGN_PERMISSIONS = {
    view: "campaigns.view",
    create: "campaigns.create",
    edit: "campaigns.edit",
    delete: "campaigns.delete",
} as const;
