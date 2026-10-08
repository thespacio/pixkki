import {createSupabaseServerClient} from "@/lib/supabase/server-client";
import {AuthService} from "@/modules/auth/service";
import {AuthRepository} from "@/modules/auth/repository";
import {AuthAdminRepository} from "@/modules/auth/admin-repository";
import {createSupabaseAdminClient} from "@/lib/supabase/admin-client";

export async function createAuthService() {
    const repository = new AuthRepository(
        await createSupabaseServerClient()
    );

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