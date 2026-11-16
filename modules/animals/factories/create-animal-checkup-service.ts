import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { AnimalCheckupRepository } from "../repositories/animal-checkup.repository";
import { AnimalCheckupService } from "../services/animal-checkup.service";

export async function createAnimalCheckupService(): Promise<AnimalCheckupService> {
    const supabase = await createSupabaseServerClient();
    const repository = new AnimalCheckupRepository(supabase);
    return new AnimalCheckupService(repository);
}
