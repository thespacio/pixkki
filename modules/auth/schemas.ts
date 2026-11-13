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

const passwordSchema = z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe tener al menos una minúscula')
    .regex(/[0-9]/, 'Debe tener al menos un número');

export const ResetPasswordSchema = z.object({
    password: passwordSchema,
});

export type ResetPasswordDTO = z.infer<typeof ResetPasswordSchema>;

export const acceptTermsSchema = z.object({
    accepted: z.boolean().refine((value) => value === true, {
        message: "Debes aceptar los Términos y Condiciones.",
    }),
});

export type AcceptTermsInput = z.infer<typeof acceptTermsSchema>;

export const changePasswordSchema = z
    .object({
        password: passwordSchema,
        confirmPassword: z.string("La confirmación de la contraseña es obligatoria."),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Las contraseñas no coinciden.",
        path: ["confirmPassword"],
    });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export type LoginInput = z.infer<typeof loginSchema>;

export const verifyMfaSchema = z.object({
    factorId: z
        .string("El factor de autenticación es obligatorio.")
        .min(1, "El factor de autenticación es obligatorio."),

    challengeId: z
        .string("El desafío de autenticación es obligatorio.")
        .min(1, "El desafío de autenticación es obligatorio."),

    code: z
        .string("El código de verificación es obligatorio.")
        .regex(/^\d{6}$/, "El código de verificación debe tener 6 dígitos."),
});

export type VerifyMfaInput = z.infer<typeof verifyMfaSchema>;