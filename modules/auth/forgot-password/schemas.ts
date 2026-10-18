import { z } from "zod";

export const ForgotPasswordSchema = z.object({
    email: z.string().email("Correo electrónico inválido"),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;