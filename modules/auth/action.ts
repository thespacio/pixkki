"use server"

import {createAuthService} from "@/modules/auth/index";
import {ResetPasswordSchema} from "@/modules/auth/schemas";
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