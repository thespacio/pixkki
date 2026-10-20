<<<<<<< HEAD
// modules/users/index.ts
import {createSupabaseServerClient} from "@/lib/supabase/server-client";
import {SupabaseClient} from "@supabase/supabase-js";
import {Database} from "@/types/database";
import {UserRepository} from "@/modules/users/repository";

/**
 * Fachada pública del módulo users.
 * Otros módulos deben obtener un UserRepository a través de estas funciones
 * en vez de instanciar `@/modules/users/repository` directamente.
 */
export function createUserRepository(supabase: SupabaseClient<Database>) {
    return new UserRepository(supabase);
}

export async function createUserRepositoryFromServer() {
    const supabase = await createSupabaseServerClient();
    return createUserRepository(supabase);
}
=======
import {createSupabaseServerClient} from "@/lib/supabase/server-client";
import {AnimalRepository} from "@/modules/animals/repository";
import {AnimalService} from "@/modules/animals/service";
import {UserRepository} from "@/modules/users/repository";

export async function createUserService() {
    const supabase = await createSupabaseServerClient();
    //const repository = new UserRepository(supabase);
    //return new AnimalService(repository);
}
>>>>>>> origin/main
