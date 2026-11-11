// modules/auth/login/service.ts

import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { AuthRepository } from "@/modules/auth/repository";
import { LoginService } from "@/modules/auth/services/login.service";
import { LoginInput, VerifyMfaInput } from "@/modules/auth/schemas";
import { LoginResult } from "@/modules/auth/types";

/**
 * El flujo de login ocurre en un Client Component, por lo que no puede usar
 * el cliente de servidor (next/headers): se ensambla el LoginService con el
 * cliente de navegador. La lógica (validaciones, MFA, multitenant) vive una
 * sola vez en LoginService y la comparten la UI y la API v1.
 */
function createBrowserLoginService(): LoginService {
    return new LoginService(
        new AuthRepository(getSupabaseBrowserClient())
    );
}

export async function login(
    email: string,
    password: string,
): Promise<LoginResult> {
    const input: LoginInput = { email, password };

    return createBrowserLoginService().login(input);
}

export async function verifyMfa(
    factorId: string,
    challengeId: string,
    code: string,
): Promise<LoginResult> {
    const input: VerifyMfaInput = { factorId, challengeId, code };

    return createBrowserLoginService().verifyMfa(input);
}
