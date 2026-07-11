import {createSupabaseServerClient} from "@/lib/supabase/server-client";
import {AuthRepository} from "@/modules/auth/repository";
import {ShelterRepository} from "@/modules/shelters/repository";
import {UserRepository} from "@/modules/users/repository";
import {AuthService} from "@/modules/auth/service";
import {CreateShelterWithAdminUseCase} from "@/modules/use-cases/createShelterWithAdmin";

export async function createCreateShelterWithAdminUseCase() {
    const supabase = await createSupabaseServerClient();

    const authRepository = new AuthRepository(supabase);
    const shelterRepository = new ShelterRepository(supabase);
    const userRepository = new UserRepository(supabase);

    const authService = new AuthService(authRepository);

    return new CreateShelterWithAdminUseCase(
        authService,
        shelterRepository,
        userRepository
    );
}