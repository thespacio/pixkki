import * as authClient from "../client";

import * as mfaClient from "../mfa/client";
import {getSupabaseBrowserClient} from "@/lib/supabase/browser-client";
import {AuthRepository, UserContext} from "@/modules/auth/repository";
import {loginSchema} from "@/modules/auth/schemas";
import {LoginResult} from "@/modules/auth/types";
import {
    AuthError,
    EmailNotVerifiedError,
    InactiveShelterError,
    InactiveUserError,
    UserNotFoundError,
} from "@/modules/auth/errors";
import {isSuperadminRole} from "@/modules/auth/authorization";

/**
 * Repositorio de auth ensamblado con el cliente de navegador.
 * El flujo de login ocurre en un Client Component, por lo que no
 * puede utilizar el cliente de servidor (next/headers).
 */
function createLoginRepository(): AuthRepository {
    return new AuthRepository(getSupabaseBrowserClient());
}

export async function login(
    email: string,
    password: string,
): Promise<LoginResult> {

    // 1. Validación de entrada (Zod como fuente única de verdad)
    const parsed = loginSchema.safeParse({ email, password });

    if (!parsed.success) {
        const issue = parsed.error.issues[0];
        throw new AuthError(
            issue?.message ?? "Datos de acceso inválidos",
            422
        );
    }

    // 2. Autenticación con correo y contraseña (F-AUTH-01)
    await authClient.login(
        parsed.data.email,
        parsed.data.password,
    );

    const repository = createLoginRepository();

    // 3. F-AUTH-04: bloquear si el correo no está verificado
    const authUser = await repository.getAuthUser();

    if (!authUser.emailConfirmed) {
        await authClient.logout();
        throw new EmailNotVerifiedError();
    }

    // 4. El usuario debe existir en el contexto (multitenant)
    let context: UserContext;

    try {
        context = await repository.findUserContext(authUser.id);
    } catch {
        await authClient.logout();
        throw new UserNotFoundError();
    }

    // 5. La cuenta debe estar activa
    if (!context.activo) {
        await authClient.logout();
        throw new InactiveUserError();
    }

    // 6. F-SHELTER-03: el refugio debe estar activo.
    //    Exención: el superadmin administra todos los refugios, por lo
    //    que nunca se bloquea por el estado de un refugio (auto-lock).
    const roleName = await repository.findRoleNameById(context.rol);

    if (!isSuperadminRole(roleName)) {
        const shelterActive = await repository.isShelterActive(context.idRefugio);

        if (!shelterActive) {
            await authClient.logout();
            throw new InactiveShelterError();
        }
    }

    // 7. MFA (si el factor está habilitado)
    const aal =
        await mfaClient.getAuthenticatorAssuranceLevel();

    if (
        aal.nextLevel === "aal2"
    ) {

        const factors =
            await mfaClient.listFactors();

        const factor =
            factors.find(
                factor =>
                    factor.status === "verified"
            );

        if (!factor) {
            throw new AuthError(
                "No existe un factor MFA.",
                403
            );
        }

        const challengeId =
            await mfaClient.challenge(
                factor.factorId
            );

        return {
            step: "mfa",
            factorId: factor.factorId,
            challengeId,
        };

    }

    // 8. Registrar último acceso
    await repository.updateLastLogin(context.idUsuario);
    return {
        step: "success",
    };

}

export async function verifyMfa(
    factorId: string,
    challengeId: string,
    code: string,
): Promise<LoginResult> {

    await mfaClient.verify(

        factorId,

        challengeId,

        code,

    );

    // Registrar último acceso (best-effort: no bloquea el login)
    try {
        const repository = createLoginRepository();
        const authUser = await repository.getAuthUser();
        const context = await repository.findUserContext(authUser.id);
        await repository.updateLastLogin(context.idUsuario);
    } catch (error) {
        console.error(
            "No se pudo actualizar el último login:",
            error
        );
    }

    return {

        step: "success",

    };

}