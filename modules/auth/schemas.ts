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

export type LoginInput = z.infer<typeof loginSchema>;