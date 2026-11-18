import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { AdoptionApplicationRepository } from "../repositories/application.repository";
import { PublicCatalogRepository } from "../repositories/public-catalog.repository";
import { PublicCatalogService } from "../services/public-catalog.service";

export async function createPublicCatalogService() {
    const supabase = await createSupabaseServerClient();
    return new PublicCatalogService(
        new PublicCatalogRepository(supabase),
        new AdoptionApplicationRepository(supabase),
    );
}