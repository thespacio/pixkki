import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { AdoptionStateRepository } from "../repositories/adoption.repository";
import { AdoptionStateService } from "../services/adoption.service";

export async function createAdoptionStateService() {
    const supabase = await createSupabaseServerClient();
    return new AdoptionStateService(new AdoptionStateRepository(supabase));
}