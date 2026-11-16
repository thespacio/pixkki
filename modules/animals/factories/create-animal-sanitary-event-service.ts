import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { AnimalSanitaryEventRepository } from "../repositories/animal-sanitary-event.repository";
import { AnimalSanitaryEventService } from "../services/animal-sanitary-event.service";

export async function createAnimalSanitaryEventService(): Promise<AnimalSanitaryEventService> {
    const supabase = await createSupabaseServerClient();
    const repository = new AnimalSanitaryEventRepository(supabase);
    return new AnimalSanitaryEventService(repository);
}
