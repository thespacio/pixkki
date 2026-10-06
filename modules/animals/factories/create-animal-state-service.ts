
import { AnimalStateRepository } from "../repositories/animal-state.repository";
import {createSupabaseServerClient} from "@/lib/supabase/server-client";
import {AnimalStateService} from "@/modules/animals/services/animal-state.service";

export async function createAnimalStateService(): Promise<AnimalStateService> {
    const supabase = await createSupabaseServerClient();
    const repository = new AnimalStateRepository(supabase);
    return new AnimalStateService(repository);
}