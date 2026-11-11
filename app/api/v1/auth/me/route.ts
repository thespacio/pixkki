import { getCurrentUser } from "@/modules/auth";
import { toAuthUserResponse } from "@/modules/auth/dtos/auth-user.dto";
import { apiSuccess, handleApiError } from "@/lib/api/responses";

/**
 * Usuario autenticado actual (RF0.5). Requiere sesión: el middleware
 * responde 401 para /api/* sin autenticar.
 */
export async function GET() {
    try {
        const user = await getCurrentUser();

        return apiSuccess(toAuthUserResponse(user));
    } catch (error) {
        return handleApiError(error);
    }
}
