// modules/auth/index.ts
import {createSupabaseServerClient} from "@/lib/supabase/server-client";
import {SupabaseClient} from "@supabase/supabase-js";
import {Database} from "@/types/database";
import {AuthService} from "@/modules/auth/service";
import {AuthRepository} from "@/modules/auth/repository";

/**
 * Fachada pública del módulo auth para composición desde otros módulos:
 * evita que otros módulos importen AuthRepository/AuthService directamente.
 */
export function createAuthRepository(supabase: SupabaseClient<Database>) {
    return new AuthRepository(supabase);
}

export function createAuthServiceFrom(supabase: SupabaseClient<Database>) {
    return new AuthService(createAuthRepository(supabase));
}

export async function createAuthService() {
    const supabase = await createSupabaseServerClient();
    return createAuthServiceFrom(supabase);
}

export async function getCurrentUser() {
    return (await createAuthService()).getCurrentUser();
}

export async function getPermissions() {
    return (await createAuthService()).getPermissions();
}

export async function logout() {
    return (await createAuthService()).logout();
}