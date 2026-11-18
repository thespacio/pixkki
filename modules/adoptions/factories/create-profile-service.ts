import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { AdoptionProfileRepository } from "../repositories/profile.repository";
import { AdoptionProfileService } from "../services/profile.service";

export async function createProfileService() {
    const supabase = await createSupabaseServerClient();
    return new AdoptionProfileService(new AdoptionProfileRepository(supabase));
}