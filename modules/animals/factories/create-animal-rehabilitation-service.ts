import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { AnimalRehabilitationRepository } from "../repositories/animal-rehabilitation.repository";
import { AnimalRehabilitationService } from "../services/animal-rehabilitation.service";

export async function createAnimalRehabilitationService(): Promise<AnimalRehabilitationService> {
    const supabase = await createSupabaseServerClient();
    const repository = new AnimalRehabilitationRepository(supabase);
    return new AnimalRehabilitationService(repository);
}
