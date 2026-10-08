"use server"

import {createAuthService} from "@/modules/auth/index";
import {
    ResetPasswordSchema,
    acceptTermsSchema,
    changePasswordSchema,
} from "@/modules/auth/schemas";

type ActionResult = {
    success: boolean;
    message: string;
};

export async function sendPasswordResetAction(email: string): Promise<ActionResult> {
    try {
        const auth = await createAuthService();

        await auth.sendPasswordReset(email);

        return { success: true, message: 'Correo enviado exitosamente' };
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Error al enviar recuperación",
        };
    }
}

export async function resetPasswordAction(password: string): Promise<ActionResult> {
    const parsed = ResetPasswordSchema.safeParse({ password });

    if (!parsed.success) {
        return {
            success: false,
            message: parsed.error.issues[0]?.message ?? "Contraseña inválida",
        };
    }

    try {
        const service = await createAuthService();
        await service.resetPassword(parsed.data);
        return { success: true, message: 'Contraseña actualizada exitosamente' };
    }
    catch (error) {
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
 * Cambio obligatorio de contraseña en primer login (F-AUTH-03).
 */
export async function changePasswordAction(input: unknown): Promise<ActionResult> {
    const parsed = changePasswordSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: parsed.error.issues[0]?.message ?? "Datos inválidos",
        };
    }

    try {
        const service = await createAuthService();
        await service.changePassword(parsed.data);
        return { success: true, message: 'Contraseña actualizada exitosamente' };
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Error al cambiar la contraseña",
        };
    }
}

/**
 * Aceptación de Términos y Condiciones (F-AUTH-05).
 */
export async function acceptTermsAction(input: unknown): Promise<ActionResult> {
    const parsed = acceptTermsSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: "Debes aceptar los Términos y Condiciones.",
        };
    }

    try {
        const service = await createAuthService();
        await service.acceptTerms();
        return { success: true, message: 'Términos y Condiciones aceptados' };
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