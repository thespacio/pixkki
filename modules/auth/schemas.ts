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

/**
 * Reglas únicas de fortaleza de contraseña (fuente única de verdad).
 */
export const passwordSchema = z
    .string("La contraseña es obligatoria.")
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe tener al menos una mayúscula")
    .regex(/[a-z]/, "Debe tener al menos una minúscula")
    .regex(/[0-9]/, "Debe tener al menos un número");

export const ResetPasswordSchema = z.object({
    password: passwordSchema,
});

/**
 * Cambio obligatorio de contraseña en primer login (F-AUTH-03).
 */
export const changePasswordSchema = z
    .object({
        password: passwordSchema,
        confirmPassword: z.string("Confirma la contraseña."),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
    });

/**
 * Aceptación de Términos y Condiciones (F-AUTH-05).
 */
export const acceptTermsSchema = z.object({
    accepted: z.literal(true),
});

/**
 * Banderas de estado guardadas en `user_metadata` de Supabase Auth.
 */
export const authUserMetadataSchema = z.object({
    password_change_required: z.boolean().optional(),
    terminos_aceptados: z.boolean().optional(),
    terminos_version: z.string().optional(),
    terminos_aceptado_en: z.string().optional(),
});

export type ResetPasswordDTO = z.infer<typeof ResetPasswordSchema>;
export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;
export type AcceptTermsDTO = z.infer<typeof acceptTermsSchema>;
export type AuthUserMetadataDTO = z.infer<typeof authUserMetadataSchema>;

export type LoginInput = z.infer<typeof loginSchema>;