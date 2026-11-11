import { NextRequest } from "next/server";

import { getAuthUser, getCurrentUser } from "@/modules/auth";
import { createLoginService } from "@/modules/auth/factories/create-login-service";
import { verifyMfaSchema } from "@/modules/auth/schemas";
import { toAuthUserResponse } from "@/modules/auth/dtos/auth-user.dto";
import { apiSuccess, apiValidationError, handleApiError } from "@/lib/api/responses";
import { readJsonBody } from "@/lib/api/request";

/**
 * Segundo paso del login con MFA (RF0.5). La ruta es pública en el
 * middleware, pero la verificación exige la sesión creada por el paso de
 * credenciales: sin sesión se responde 401.
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Requiere la sesión iniciada en el paso anterior del login
        await getAuthUser();

        // 2. Frontera servidor: validación estructural (Zod)
        const parsed = verifyMfaSchema.safeParse(
            await readJsonBody(request)
        );

        if (!parsed.success) {
            return apiValidationError(parsed.error);
        }

        // 3. Verificar el desafío MFA
        const service = await createLoginService();
        const result = await service.verifyMfa(parsed.data);

        // 4. Payload del usuario autenticado
        const user = await getCurrentUser();

        return apiSuccess({
            step: result.step,
            user: toAuthUserResponse(user),
        });
    } catch (error) {
        return handleApiError(error);
    }
}
