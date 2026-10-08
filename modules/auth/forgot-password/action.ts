"use server";

import { ForgotPasswordSchema } from "./schemas";
import {createAuthService} from "@/modules/auth";


export async function forgotPasswordAction(formData: FormData) {
    const parsed = ForgotPasswordSchema.safeParse({
        email: formData.get("email"),
    });

    if (!parsed.success) {
        return {
            success: false,
            message: "Correo electrónico inválido",
        };
    }

    try {
        const service = await createAuthService();

        // Previene user enumeration: siempre se responde éxito
        await service.sendPasswordReset(parsed.data.email);

        return {
            success: true,
            message: "Si el correo existe, recibirás un enlace de recuperación",
        };
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