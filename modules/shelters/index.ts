import {createSupabaseServerClient} from "@/lib/supabase/server-client";
import {ShelterRepository} from "@/modules/shelters/repository";
import {ShelterService} from "@/modules/shelters/service";


export async function createShelterService() {
    const supabase = await createSupabaseServerClient();
    const repository = new ShelterRepository(supabase);
    return new ShelterService(repository);
}