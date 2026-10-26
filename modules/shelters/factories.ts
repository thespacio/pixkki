import {createSupabaseServerClient} from "@/lib/supabase/server-client";
import {AuthRepository} from "@/modules/auth/repository";
import {ShelterRepository} from "@/modules/shelters/repository";
import {UserRepository} from "@/modules/users/repository";
import {AuthService} from "@/modules/auth/service";
import {CreateShelterWithAdminUseCase} from "@/modules/use-cases/createShelterWithAdmin";
import {createAuthService} from "@/modules/auth";
import {createSupabaseAdminClient} from "@/lib/supabase/admin-client";
import {AuthAdminRepository} from "@/modules/auth/admin-repository";
import {getSupabaseBrowserClient} from "@/lib/supabase/browser-client";
import {createServerClient} from "@supabase/ssr";
import {ShelterService} from "@/modules/shelters/service";

export async function createShelterService() {
    const supabase = await createSupabaseServerClient();
    const repository = new ShelterRepository(supabase);
    return new ShelterService(repository);
}

export async function createCreateShelterWithAdminUseCase() {
    const supabase = await createSupabaseServerClient();
    const authService = await createAuthService();

    const shelterRepository = new ShelterRepository(supabase);
    const userRepository = new UserRepository(supabase);

    return new CreateShelterWithAdminUseCase(
        authService,
        shelterRepository,
        userRepository
    );
}