import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string("El correo electrónico es obligatorio.")
        .email("Ingrese un correo electrónico válido.")
        .trim()
        .toLowerCase(),

    password: z
        .string("La contraseña es obligatoria.")
        .min(1, "La contraseña es obligatoria."),
});

export const ResetPasswordSchema = z.object({
    password: z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
        .regex(/[a-z]/, 'Debe tener al menos una minúscula')
        .regex(/[0-9]/, 'Debe tener al menos un número'),
});

export type ResetPasswordDTO = z.infer<typeof ResetPasswordSchema>;

export type LoginInput = z.infer<typeof loginSchema>;