import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { SpaceRepository } from "@/modules/spaces/repositories/repository";
import { SpaceService } from "@/modules/spaces/service";

/** Fábrica del puerto de ocupación consumido por el módulo animals. */
export async function createSpaceOccupancyService(): Promise<SpaceService> {
    const supabase = await createSupabaseServerClient();
    const repository = new SpaceRepository(supabase);
    return new SpaceService(repository);
}
