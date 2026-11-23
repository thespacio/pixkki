
import { AnimalRepository } from "../repositories/animal.repository";
import { AnimalService } from "../services/animal.service";
import { createSpaceOccupancyService } from "@/modules/spaces/factories/create-space-occupancy-service";
import {createSupabaseServerClient} from "@/lib/supabase/server-client";

export async function createAnimalService(): Promise<AnimalService> {
    const supabase = await createSupabaseServerClient();
    const repository = new AnimalRepository(supabase);
    // RF3.1/RF2.4: el service valida cupo, disponibilidad y tipo de espacio a
    // través del puerto público de `spaces`, sin acceso directo a Supabase.
    const espacios = await createSpaceOccupancyService();
    return new AnimalService(repository, espacios);
}
