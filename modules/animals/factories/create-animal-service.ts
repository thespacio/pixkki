
import { AnimalRepository } from "../repositories/animal.repository";
import { AnimalService } from "../services/animal.service";
import {createSupabaseServerClient} from "@/lib/supabase/server-client";

export async function createAnimalService(): Promise<AnimalService> {
    const supabase = await createSupabaseServerClient();
    const repository = new AnimalRepository(supabase);
    return new AnimalService(repository);
}