import {createSupabaseServerClient} from "@/lib/supabase/server-client";
import {AuthService} from "@/modules/auth/service";
import {AuthRepository} from "@/modules/auth/repository";
import {AuthAdminRepository} from "@/modules/auth/admin-repository";
import {createSupabaseAdminClient} from "@/lib/supabase/admin-client";
import {perRequest} from "@/lib/request-cache";

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
// El usuario actual se pide desde varios sitios en la MISMA petición (layout raíz,
// layout protegido, la página, acciones de servidor). `perRequest` hace que todos
// compartan un único resultado en vez de repetir ~4 consultas cada vez.
export const getCurrentUser = perRequest(async () => {
    return (await createAuthService()).getCurrentUser();
});

export const getAuthUser = perRequest(async () => {
    return (await createAuthService()).getAuthUser();
});

export async function getPermissions() {
    return (await createAuthService()).getPermissions();
}

export async function logout() {
    return (await createAuthService()).logout();
}

export async function getUsersByShelterId(id: number) {
    return (await createAuthService()).getUsersByShelterId(id);
}