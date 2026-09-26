import type { ForgotPasswordSchema } from "./schemas";
import z from "zod";

export type ForgotPasswordDTO = z.infer<typeof ForgotPasswordSchema>;

export interface ForgotPasswordResponse {
    success: boolean;
    message?: string;
}