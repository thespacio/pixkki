// modules/auth/index.ts
import {createSupabaseServerClient} from "@/lib/supabase/server-client";
import {SupabaseClient} from "@supabase/supabase-js";
import {Database} from "@/types/database";
import {AuthService} from "@/modules/auth/service";
import {AuthRepository} from "@/modules/auth/repository";
import {AuthAdminRepository} from "@/modules/auth/admin-repository";
import {createSupabaseAdminClient} from "@/lib/supabase/admin-client";

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

    const adminRepository = new AuthAdminRepository(
        createSupabaseAdminClient()
    );

    return new AuthService(
        repository,
        adminRepository
    );
}
export async function getCurrentUser() {
    return (await createAuthService()).getCurrentUser();
}

export async function getAuthUser() {
    return (await createAuthService()).getAuthUser();
}

export async function getPermissions() {
    return (await createAuthService()).getPermissions();
}

export async function getLoginRequirements() {
    return (await createAuthService()).getLoginRequirements();
}

export async function logout() {
    return (await createAuthService()).logout();
}

export async function getUsersByShelterId(id: number) {
    return (await createAuthService()).getUsersByShelterId(id);
}