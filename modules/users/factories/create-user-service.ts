import {UserService} from "@/modules/users/user.service";
import {createSupabaseServerClient} from "@/lib/supabase/server-client";
import {createSupabaseAdminClient} from "@/lib/supabase/admin-client";
import {UserRepository} from "@/modules/users/repository";
import {AuthAdminRepository} from "@/modules/auth/admin-repository";


export async function createUserService(): Promise<UserService> {
    const supabase = await createSupabaseServerClient();

    const userRepository = new UserRepository(supabase);
    const authAdminRepository = new AuthAdminRepository(createSupabaseAdminClient());

    return new UserService(userRepository, authAdminRepository);
}