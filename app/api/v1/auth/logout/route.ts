import { logout } from "@/modules/auth";
import { apiSuccess, handleApiError } from "@/lib/api/responses";

/**
 * Cierra la sesión (RF0.5). Requiere sesión: el middleware responde 401
 * para /api/* sin autenticar. Delega en el service para invalidar y limpiar
 * las cookies (el route handler no toca Supabase directamente).
 */
export async function POST() {
    try {
        await logout();

        return apiSuccess({
            message: "Sesión cerrada correctamente.",
        });
    } catch (error) {
        return handleApiError(error);
    }
}
