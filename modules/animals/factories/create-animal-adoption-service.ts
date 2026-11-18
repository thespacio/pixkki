import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { AnimalAdoptionRepository } from "../repositories/animal-adoption.repository";
import { AnimalAdoptionService } from "../services/animal-adoption.service";

export async function createAnimalAdoptionService(): Promise<AnimalAdoptionService> {
    const supabase = await createSupabaseServerClient();
    const repository = new AnimalAdoptionRepository(supabase);
    return new AnimalAdoptionService(repository);
}
