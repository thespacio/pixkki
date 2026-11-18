import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { AdoptionEvaluationRepository } from "../repositories/evaluation.repository";
import { AdoptionEvaluationService } from "../services/evaluation.service";

export async function createEvaluationService() {
    const supabase = await createSupabaseServerClient();
    return new AdoptionEvaluationService(new AdoptionEvaluationRepository(supabase));
}