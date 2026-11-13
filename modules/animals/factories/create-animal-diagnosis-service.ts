
import { AnimalDiagnosisRepository } from "../repositories/animal-diagnosis.repository";
import { AnimalDiagnosisService } from "../services/animal-diagnosis.service";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function createAnimalDiagnosisService(): Promise<AnimalDiagnosisService> {
    const supabase = await createSupabaseServerClient();
    const repository = new AnimalDiagnosisRepository(supabase);
    return new AnimalDiagnosisService(repository);
}