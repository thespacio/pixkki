import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { createAnimalService } from "@/modules/animals/factories/create-animal-service";
import { GeminiClient } from "@/modules/campaigns/ai/gemini-client";
import { isAdoptable, toAdoptableAnimal } from "@/modules/campaigns/adoptable-animals";
import type { AdoptableAnimalsPort } from "@/modules/campaigns/ports";
import { CampaignRepository } from "@/modules/campaigns/repositories/campaign.repository";
import { CampaignService } from "@/modules/campaigns/services/campaign.service";

export async function createCampaignService(): Promise<CampaignService> {
    const supabase = await createSupabaseServerClient();
    const animalService = await createAnimalService();

    // Adaptador: campañas pide "animales en adopción" y esto lo resuelve con el
    // servicio público del módulo de animales (que ya aplica sus propias reglas).
    const animals: AdoptableAnimalsPort = {
        async listAdoptable({ shelterId }) {
            const list =
                shelterId !== undefined
                    ? await animalService.listByRefugio(shelterId)
                    : await animalService.listVisible({ shelterId: 0, allShelters: true });

            return list.filter(isAdoptable).map(toAdoptableAnimal);
        },
    };

    // Si falta GEMINI_API_KEY no falla acá: el panel de campañas funciona igual y el
    // error aparece, con un mensaje claro, solo al pedir sugerencias.
    const suggester = new GeminiClient({
        apiKey: process.env.GEMINI_API_KEY,
        model: process.env.GEMINI_MODEL,
    });

    return new CampaignService({
        repository: new CampaignRepository(supabase),
        animals,
        suggester,
    });
}
