
import { AnimalMultimediaRepository } from "../repositories/animal-multimedia.repository";
import { AnimalMultimediaService } from "../services/animal-multimedia.service";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cloudinaryStorage } from "@/lib/storage/cloudinary.adapter";

export async function createAnimalMultimediaService(): Promise<AnimalMultimediaService> {
    const supabase = await createSupabaseServerClient();
    const repository = new AnimalMultimediaRepository(supabase, cloudinaryStorage);
    return new AnimalMultimediaService(repository);
}