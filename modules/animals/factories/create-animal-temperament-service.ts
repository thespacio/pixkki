import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { AnimalTemperamentRepository } from "../repositories/animal-temperament.repository";
import { AnimalTemperamentService } from "../services/animal-temperament.service";

export async function createAnimalTemperamentService(): Promise<AnimalTemperamentService> {
    const supabase = await createSupabaseServerClient();
    const repository = new AnimalTemperamentRepository(supabase);
    return new AnimalTemperamentService(repository);
}
