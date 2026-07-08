import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import {AuthError} from "@/modules/auth/errors";
import { AuthError as SupabaseAuthError } from "@supabase/supabase-js";


export interface LoginRequest {
    email: string;
    password: string;
}

export async function login(
    email: string,
    password: string,
) {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {

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