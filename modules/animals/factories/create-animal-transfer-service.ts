import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { AnimalTransferRepository } from "../repositories/animal-transfer.repository";
import { AnimalTransferService } from "../services/animal-transfer.service";

export async function createAnimalTransferService(): Promise<AnimalTransferService> {
    const supabase = await createSupabaseServerClient();
    const repository = new AnimalTransferRepository(supabase);
    return new AnimalTransferService(repository);
}
