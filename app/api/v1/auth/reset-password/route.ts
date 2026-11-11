import { NextRequest } from "next/server";

import { createAuthService, getAuthUser } from "@/modules/auth";
import { ResetPasswordSchema } from "@/modules/auth/schemas";
import { apiSuccess, apiValidationError, handleApiError } from "@/lib/api/responses";
import { readJsonBody } from "@/lib/api/request";

/**
 * Restablece la contraseña (RF0.5).
 *
 * El flujo de recuperación (enlace → /auth/callback) deja una sesión válida;
 * el cambio de contraseña se hace sobre esa sesión. La ruta es pública en
 * el middleware, pero sin sesión se responde 401.
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Requiere la sesión creada por el enlace de recuperación
        await getAuthUser();

        // 2. Frontera servidor: validación estructural (Zod)
        const parsed = ResetPasswordSchema.safeParse(
            await readJsonBody(request)
        );

        if (!parsed.success) {
            return apiValidationError(parsed.error);
        }

        // 3. Actualizar la contraseña del usuario autenticado
        const service = await createAuthService();
        await service.resetPassword(parsed.data);

        return apiSuccess({
            message: "Contraseña actualizada correctamente.",
        });
    } catch (error) {
        return handleApiError(error);
    }
}
