// modules/animals/index.ts
import {createSupabaseServerClient} from "@/lib/supabase/server-client";
import {AnimalRepository} from "@/modules/animals/repository";
import {AnimalService} from "@/modules/animals/service";
import {AuthenticatedUser} from "@/modules/auth/types";
export async function createAnimalService() {
    const supabase = await createSupabaseServerClient();
    const repository = new AnimalRepository(supabase);
    return new AnimalService(repository);
}

export async function getAnimal(user: AuthenticatedUser,
                                id: number) {
    return (await createAnimalService()).getAnimal(user,id);
}

export async function deleteAnimal(user: AuthenticatedUser,
                                id: number) {
    return (await createAnimalService()).deleteAnimal(user,id);
}