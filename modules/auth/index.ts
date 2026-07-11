// modules/animals/index.ts
import {createSupabaseServerClient} from "@/lib/supabase/server-client";
import {AuthService} from "@/modules/auth/service";
import {AuthRepository} from "@/modules/auth/repository";

export async function createAuthService() {
    const supabase = await createSupabaseServerClient();
    const repository = new AuthRepository(supabase);
    return new AuthService(repository);
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