// modules/spaces/factories/create-space-service.ts


import {createSupabaseServerClient} from "@/lib/supabase/server-client";
import {SpaceRepository} from "@/modules/spaces/repositories/repository";
import {SpaceService} from "@/modules/spaces/service";

export async function createSpaceService() {
    const supabase = await createSupabaseServerClient();
    const spaceRepository = new SpaceRepository(supabase);
    return new SpaceService(spaceRepository);
}