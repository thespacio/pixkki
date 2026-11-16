import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { AnimalQuarantineRepository } from "../repositories/animal-quarantine.repository";
import { AnimalQuarantineService } from "../services/animal-quarantine.service";

export async function createAnimalQuarantineService(): Promise<AnimalQuarantineService> {
    const supabase = await createSupabaseServerClient();
    const repository = new AnimalQuarantineRepository(supabase);
    return new AnimalQuarantineService(repository);
}
