// modules/animals/index.ts
import {createSupabaseServerClient} from "@/lib/supabase/server-client";
import {AnimalRepository} from "@/modules/animals/repository";
import {AnimalService} from "@/modules/animals/service";
import {UserRepository} from "@/modules/users/repository";

export async function createUserService() {
    const supabase = await createSupabaseServerClient();
    //const repository = new UserRepository(supabase);
    //return new AnimalService(repository);
}