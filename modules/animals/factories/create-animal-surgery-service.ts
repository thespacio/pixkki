import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { AnimalSurgeryRepository } from "../repositories/animal-surgery.repository";
import { AnimalSurgeryService } from "../services/animal-surgery.service";

export async function createAnimalSurgeryService(): Promise<AnimalSurgeryService> {
    const supabase = await createSupabaseServerClient();
    const repository = new AnimalSurgeryRepository(supabase);
    return new AnimalSurgeryService(repository);
}
