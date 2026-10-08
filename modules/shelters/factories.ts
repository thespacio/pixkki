import {createSupabaseServerClient} from "@/lib/supabase/server-client";
import {ShelterRepository} from "@/modules/shelters/repository";
import {UserRepository} from "@/modules/users/repository";
import {CreateShelterWithAdminUseCase} from "@/modules/use-cases/createShelterWithAdmin";
import {createAuthService} from "@/modules/auth";
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
    const shelterService = new ShelterService(shelterRepository);
    const userRepository = new UserRepository(supabase);

    return new CreateShelterWithAdminUseCase(
        authService,
        shelterService,
        shelterRepository,
        userRepository
    );
}