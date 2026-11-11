// modules/auth/factories/create-login-service.ts

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { AuthRepository } from "@/modules/auth/repository";
import { LoginService } from "@/modules/auth/services/login.service";

/**
 * Ensambla el LoginService para su uso en el servidor (route handlers de
 * la API v1): AuthRepository con el cliente de servidor, que escribe las
 * cookies de sesión en la respuesta.
 */
export async function createLoginService(): Promise<LoginService> {
    const repository = new AuthRepository(
        await createSupabaseServerClient()
    );

    return new LoginService(repository);
}
