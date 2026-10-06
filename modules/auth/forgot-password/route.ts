import { NextRequest, NextResponse } from "next/server";
import { ForgotPasswordSchema } from "./schemas";
import { SupabaseForgotPasswordRepository } from "./repository";
import { ForgotPasswordService } from "./service";
import { UnableToSendResetEmailError } from "./errors";

export async function POST(request: NextRequest) {
    try {
        // 1. Validar entrada con Zod
        const body = await request.json();
        const validationResult = ForgotPasswordSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: "Datos inválidos",
                    details: validationResult.error.issues,
                },
                { status: 400 }
            );
        }

        // 2. Obtener el usuario autenticado (no necesario para este caso)
        // El envío de correo de restablecimiento es público

        // 3. Llamar al Service
        const repository = new SupabaseForgotPasswordRepository();
        const service = new ForgotPasswordService(repository);

        await service.forgotPassword(validationResult.data);

        // 4. Traducir el resultado a respuesta HTTP
        // Siempre devolvemos éxito incluso si el email no existe (previene user enumeration)
        return NextResponse.json(
            {
                success: true,
                message:
                    "Si el correo existe, recibirás un enlace para restablecer tu contraseña",
            },
            { status: 200 }
        );
    } catch (error) {
        // Manejo de errores específicos del dominio
        if (error instanceof UnableToSendResetEmailError) {
            // Aún así, devolvemos 200 para prevenir user enumeration
            return NextResponse.json(
                {
                    success: true,
                    message:
                        "Si el correo existe, recibirás un enlace para restablecer tu contraseña",
                },
                { status: 200 }
            );
        }

        // Errores no manejados
        console.error("Error en forgot-password:", error);
        return NextResponse.json(
            {
                error: "Error interno del servidor",
            },
            { status: 500 }
        );
    }
}