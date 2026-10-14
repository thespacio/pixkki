import {createSupabaseServerClient} from "@/lib/supabase/server-client";
import {ShelterRepository} from "@/modules/shelters/repository";
import {createAuthServiceFrom} from "@/modules/auth";
import {createUserRepository} from "@/modules/users";
import {CreateShelterWithAdminUseCase} from "@/modules/use-cases/createShelterWithAdmin";

export async function createCreateShelterWithAdminUseCase() {
    const supabase = await createSupabaseServerClient();

    const authService = createAuthServiceFrom(supabase);
    const shelterRepository = new ShelterRepository(supabase);
    const userRepository = createUserRepository(supabase);

    return new CreateShelterWithAdminUseCase(
        authService,
        shelterRepository,
        userRepository
    );
}