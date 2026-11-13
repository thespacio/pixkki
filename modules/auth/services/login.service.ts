// modules/auth/services/login.service.ts

import { AuthRepository, UserContext } from "@/modules/auth/repository";
import { loginSchema, verifyMfaSchema, LoginInput, VerifyMfaInput } from "@/modules/auth/schemas";
import { LoginResult } from "@/modules/auth/types";
import {
    AuthError,
    EmailNotVerifiedError,
    InactiveShelterError,
    InactiveUserError,
    UserNotFoundError,
} from "@/modules/auth/errors";
import { isSuperadminRole } from "@/modules/auth/authorization";

/**
 * Lógica de inicio de sesión (F-AUTH-01), compartida por la UI (cliente
 * browser) y la API v1 (route handlers): quien lo ensambla decide qué
 * cliente de Supabase inyectar en el AuthRepository.
 *
 * Pasos:
 *  1. Validación de entrada (Zod).
 *  2. signInWithPassword.
 *  3. F-AUTH-04: correo verificado.
 *  4. Contexto multitenant (el usuario debe existir en `usuario`).
 *  5. Cuenta activa.
 *  6. F-SHELTER-03: refugio activo (el superadmin está exento).
 *  7. MFA: si hay un factor TOTP verificado, se emite un desafío.
 *  8. Registro del último acceso.
 */
export class LoginService {
    constructor(
        private readonly repository: AuthRepository
    ) {}

    /**
     * Inicia sesión con correo y contraseña.
     * Devuelve el desafío MFA cuando el usuario tiene un factor verificado,
     * o el paso final de éxito cuando no se requiere MFA.
     */
    async login(input: LoginInput): Promise<LoginResult> {
        // 1. Validación de entrada (Zod como fuente única de verdad)
        const parsed = loginSchema.safeParse(input);

        if (!parsed.success) {
            const issue = parsed.error.issues[0];
            throw new AuthError(
                issue?.message ?? "Datos de acceso inválidos.",
                400,
                "VALIDATION_ERROR"
            );
        }

        // 2. Autenticación con correo y contraseña (F-AUTH-01)
        await this.repository.signInWithPassword(
            parsed.data.email,
            parsed.data.password,
        );

        // 3. F-AUTH-04: bloquear si el correo no está verificado
        const authUser = await this.repository.getAuthUser();

        if (!authUser.emailConfirmed) {
            await this.safelySignOut();
            throw new EmailNotVerifiedError();
        }

        // 4. El usuario debe existir en el contexto (multitenant)
        let context: UserContext;

        try {
            context = await this.repository.findUserContext(authUser.id);
        } catch {
            await this.safelySignOut();
            throw new UserNotFoundError();
        }

        // 5. La cuenta debe estar activa
        if (!context.activo) {
            await this.safelySignOut();
            throw new InactiveUserError();
        }

        // 6. F-SHELTER-03: el refugio debe estar activo.
        //    Exención: el superadmin administra todos los refugios, por lo
        //    que nunca se bloquea por el estado de un refugio (auto-lock).
        const roleName = await this.repository.findRoleNameById(context.rol);

        if (!isSuperadminRole(roleName)) {
            if (context.idRefugio === null) {
                await this.safelySignOut();
                throw new UserNotFoundError();
            }

            const shelterActive =
                await this.repository.isShelterActive(context.idRefugio);

            if (!shelterActive) {
                await this.safelySignOut();
                throw new InactiveShelterError();
            }
        }

        // 7. MFA: si el usuario tiene un factor TOTP verificado (aal2
        //    pendiente), se emite un desafío en lugar de completar el login.
        const aal = await this.repository.getAuthenticatorAssuranceLevel();

        if (aal.nextLevel === "aal2") {
            const factors = await this.repository.listMfaFactors();

            const factor = factors.find(
                factor => factor.status === "verified"
            );

            if (!factor) {
                throw new AuthError(
                    "No existe un factor MFA verificado para tu cuenta.",
                    403,
                    "MFA_FACTOR_NOT_FOUND"
                );
            }

            const challengeId =
                await this.repository.createMfaChallenge(factor.id);

            return {
                step: "mfa",
                factorId: factor.id,
                challengeId,
            };
        }

        // 8. Registrar último acceso
        await this.repository.updateLastLogin(context.idUsuario);

        return {
            step: "success",
        };
    }

    /**
     * Completa el login verificando el desafío MFA con el código TOTP.
     */
    async verifyMfa(input: VerifyMfaInput): Promise<LoginResult> {
        // 1. Validación de entrada (Zod como fuente única de verdad)
        const parsed = verifyMfaSchema.safeParse(input);

        if (!parsed.success) {
            const issue = parsed.error.issues[0];
            throw new AuthError(
                issue?.message ?? "Datos de verificación inválidos.",
                400,
                "VALIDATION_ERROR"
            );
        }

        // 2. Verificar el desafío (traduce errores de la API al dominio)
        await this.repository.verifyMfaChallenge(
            parsed.data.factorId,
            parsed.data.challengeId,
            parsed.data.code,
        );

        // 3. Registrar último acceso (best-effort: no bloquea el login)
        try {
            const authUser = await this.repository.getAuthUser();
            const context = await this.repository.findUserContext(authUser.id);
            await this.repository.updateLastLogin(context.idUsuario);
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

    /**
     * Cierra la sesión parcial creada por signInWithPassword cuando una
     * validación posterior falla. El error original prevalece: si el cierre
     * de sesión también falla, solo se registra.
     */
    private async safelySignOut(): Promise<void> {
        try {
            await this.repository.signOut();
        } catch (error) {
            console.error(
                "No se pudo cerrar la sesión parcial:",
                error
            );
        }
    }
}
