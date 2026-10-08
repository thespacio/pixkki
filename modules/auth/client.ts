import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import {AuthError, EmailNotVerifiedError} from "@/modules/auth/errors";


export interface LoginRequest {
    email: string;
    password: string;
}

export async function login(
    email: string,
    password: string,
): Promise<void> {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {

        // F-AUTH-04: bloquear inicio de sesión si el correo no está verificado
        if (
            error.status === 400 &&
            /email not confirmed/i.test(error.message)
        ) {
            throw new EmailNotVerifiedError();
        }

        switch (error.status) {

            case 400:
                throw new AuthError(
                    "Correo o contraseña incorrecta",
                    400
                );

            case 422:
                throw new AuthError(
                    "El correo electrónico no es válido",
                    422
                );

            default:
                throw new AuthError(
                    "Ocurrió un error al iniciar sesión",
                    error.status ?? 500
                );
        }
    }

    return
}

export async function logout(): Promise<void> {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
        throw error;
    }
}

export async function resetPassword(
    email: string
) {

    const supabase = getSupabaseBrowserClient();

    return supabase.auth.resetPasswordForEmail(email);

}

export async function updatePassword(password: string) {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase.auth.updateUser({
        password,
    });

    if (error) throw error;
}