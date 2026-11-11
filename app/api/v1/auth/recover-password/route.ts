import { NextRequest } from "next/server";

import { createAuthService } from "@/modules/auth";
import { ForgotPasswordSchema } from "@/modules/auth/forgot-password/schemas";
import { apiSuccess, apiValidationError, handleApiError } from "@/lib/api/responses";
import { readJsonBody } from "@/lib/api/request";

/**
 * Solicita el correo de recuperación de contraseña (RF0.5). Ruta pública.
 *
 * La respuesta es siempre genérica (anti-enumeración de usuarios): si el
 * envío falla se registra internamente pero no se revela si el correo
 * existe, igual que hace la UI.
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Frontera servidor: validación estructural (Zod)
        const parsed = ForgotPasswordSchema.safeParse(
            await readJsonBody(request)
        );

        if (!parsed.success) {
            return apiValidationError(parsed.error);
        }

        // 2. Enviar el correo de recuperación
        try {
            const service = await createAuthService();
            await service.sendPasswordReset(parsed.data.email);
        } catch (error) {
            // Log interno: la respuesta al cliente es genérica a propósito
            // para no revelar si el correo está registrado.
            console.error("[api] recover-password:", error);
        }

        return apiSuccess({
            message: "Si el correo existe, recibirás un enlace para restablecer tu contraseña.",
        });
    } catch (error) {
        return handleApiError(error);
    }
}
