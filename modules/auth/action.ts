"use server"

import {createAuthService, getCurrentUser} from "@/modules/auth/index";
import {
    acceptTermsSchema,
    changePasswordSchema,
    ResetPasswordSchema,
} from "@/modules/auth/schemas";
import {ForgotPasswordInput} from "@/modules/auth/forgot-password/schemas";
import {redirect} from "next/navigation";

export async function sendPasswordResetAction(email: string) {
    try {
        const auth = await createAuthService();

        await auth.sendPasswordReset(email);

        console.log("Reset password reset successfully");

        return { success: true, message: 'Correo enviado exitosamente' };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Error al enviar recuperación",
        };
    }
}
/**
 * Aceptación de Términos y Condiciones (F-AUTH-05 / US27).
 * Registra la versión vigente y el timestamp de aceptación del usuario
 * autenticado. El checkbox es obligatorio: si no se acepta, no se escribe nada.
 */
export async function acceptTermsAction(input: unknown) {
    try {
        const parsed = acceptTermsSchema.safeParse(input);

        if (!parsed.success) {
            return {
                success: false,
                message:
                    parsed.error.issues[0]?.message ??
                    "Debes aceptar los Términos y Condiciones.",
            };
        }

        const user = await getCurrentUser();
        const service = await createAuthService();

        await service.acceptTerms(user.id, user.shelterId);

        return {
            success: true,
            message: "Términos y Condiciones aceptados correctamente.",
        };
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Error al aceptar los Términos y Condiciones",
        };
    }
}

/**
 * Cambio de contraseña del usuario autenticado (F-AUTH-03 / US02).
 * Se usa tanto en el primer inicio de sesión con contraseña temporal como
 * en el flujo de recuperación.
 */
export async function changePasswordAction(input: unknown) {
    try {
        const parsed = changePasswordSchema.safeParse(input);

        if (!parsed.success) {
            return {
                success: false,
                message:
                    parsed.error.issues[0]?.message ??
                    "Datos de contraseña inválidos.",
            };
        }

        // Requiere sesión: el cambio se aplica sobre el usuario autenticado.
        await getCurrentUser();

        const service = await createAuthService();
        await service.changePassword({ password: parsed.data.password });

        return {
            success: true,
            message: "Contraseña actualizada exitosamente.",
        };
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Error al cambiar contraseña",
        };
    }
}

/**
 * Marca el onboarding inicial como completado (US30).
 * Solo aplica a usuarios con refugio asignado: el superadmin opera a nivel
 * global y no pasa por el asistente de espacios.
 */
export async function completeOnboardingAction() {
    try {
        const user = await getCurrentUser();

        if (user.shelterId === null) {
            return {
                success: false,
                message: "El superadministrador no requiere onboarding.",
            };
        }

        const service = await createAuthService();
        await service.completeOnboarding(user.id);

        return {
            success: true,
            message: "Configuración inicial completada.",
        };
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Error al completar la configuración inicial",
        };
    }
}

export async function resetPasswordAction(password: string) {
    try {
        const dto = ResetPasswordSchema.parse({
            password: password,
        });
        const service = await createAuthService();
        await service.resetPassword(dto);
        console.log("Reset password reset successfully");
        return { success: true, message: 'Contraseña actualizada exitosamente' };
    }
    catch (error) {
        console.log(error);
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Error al cambiar contraseña",
        };
    }
}

/**
 * Resuelve las flags de compuerta post-login del usuario autenticado
 * (RF0.5, RF0.7, RF0.9). Se invoca desde el cliente tras un login exitoso
 * para decidir el siguiente paso de la compuerta: cambio de contraseña,
 * aceptación de términos, onboarding o panel.
 */
export async function getAuthFlagsAction() {
    try {
        const user = await getCurrentUser();
        return {
            success: true,
            data: {
                requiresPasswordChange: user.requiresPasswordChange,
                requiresOnboarding: user.requiresOnboarding,
                termsAccepted: user.termsAccepted,
                shelterId: user.shelterId,
                role: user.role,
            },
        };
    } catch (error) {
        return {
            success: false,
            message: "No se pudo obtener la sesión del usuario.",
        };
    }
}