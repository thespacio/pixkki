import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { AdoptionApplicationRepository } from "../repositories/application.repository";
import { AdoptionApplicationService } from "../services/application.service";

export async function createApplicationService() {
    const supabase = await createSupabaseServerClient();
    return new AdoptionApplicationService(new AdoptionApplicationRepository(supabase));
}