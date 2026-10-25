import type { CampaignRepository } from "@/modules/campaigns/repositories/campaign.repository";
import type { CampaignSuggester } from "@/modules/campaigns/ai/gemini-client";
import type { AdoptableAnimalsPort } from "@/modules/campaigns/ports";
import type { CampaignAccess } from "@/modules/campaigns/access";
import type {
    AdoptableAnimal,
    Campaign,
    CampaignStatus,
    SuggestionBatch,
} from "@/modules/campaigns/types";
import {
    CampaignAnimalsError,
    CampaignNotFoundError,
    CampaignPublishError,
    CampaignShelterNotFoundError,
    NoAdoptableAnimalsError,
} from "@/modules/campaigns/types";
import type {
    CreateCampaignInput,
    GenerateSuggestionsInput,
    UpdateCampaignInput,
} from "@/modules/campaigns/validators";

type Dependencies = {
    repository: CampaignRepository;
    animals: AdoptableAnimalsPort;
    suggester: CampaignSuggester;
};

export class CampaignService {
    private readonly repository: CampaignRepository;
    private readonly animals: AdoptableAnimalsPort;
    private readonly suggester: CampaignSuggester;

    constructor({ repository, animals, suggester }: Dependencies) {
        this.repository = repository;
        this.animals = animals;
        this.suggester = suggester;
    }

    /** Campañas visibles: todas si es superadmin, solo las de su albergue si no. */
    async list(access: CampaignAccess): Promise<Campaign[]> {
        return access.allShelters
            ? this.repository.findAll()
            : this.repository.findAllByShelter(access.shelterId);
    }

    /** Animales en adopción sobre los que se puede armar una campaña. */
    async listAdoptable(access: CampaignAccess): Promise<AdoptableAnimal[]> {
        return this.animals.listAdoptable(access.allShelters ? {} : { shelterId: access.shelterId });
    }

    /**
     * Pide sugerencias a la IA. NO guarda nada: son propuestas que una persona
     * revisa, edita y decide guardar.
     */
    async generate(input: GenerateSuggestionsInput, access: CampaignAccess): Promise<SuggestionBatch> {
        const shelterId = await this.resolveShelter(access, input.idRefugio);

        const adoptable = await this.animals.listAdoptable({ shelterId });
        if (adoptable.length === 0) throw new NoAdoptableAnimalsError();

        let selected = adoptable;
        if (input.animalIds && input.animalIds.length > 0) {
            const wanted = new Set(input.animalIds);
            selected = adoptable.filter((a) => wanted.has(a.idAnimal));
            // Si pidió un animal que no está en adopción (o es de otro albergue), no se continúa.
            if (selected.length !== wanted.size) throw new CampaignAnimalsError();
        }

        const { suggestions, model } = await this.suggester.suggest({
            animals: selected,
            count: input.count,
            tone: input.tone,
            shelterName: selected[0]?.shelterName ?? null,
        });

        return { suggestions, model, shelterId, shelterName: selected[0]?.shelterName ?? null };
    }

    /** Guarda una campaña como BORRADOR: publicarla es un paso aparte y consciente. */
    async create(input: CreateCampaignInput, access: CampaignAccess): Promise<Campaign> {
        const shelterId = await this.resolveShelter(access, input.idRefugio);

        // Los animales deben ser de este albergue y seguir en adopción: no se confía en lo que envió el cliente.
        const adoptable = await this.animals.listAdoptable({ shelterId });
        const allowed = new Set(adoptable.map((a) => a.idAnimal));
        if (!input.animalIds.every((id) => allowed.has(id))) throw new CampaignAnimalsError();

        return this.repository.create({
            shelterId,
            title: input.title,
            content: input.content,
            hashtags: input.hashtags ?? [],
            callToAction: input.callToAction ?? null,
            animalIds: input.animalIds,
            generatedByAi: input.generatedByAi ?? false,
            aiModel: input.generatedByAi ? (input.aiModel ?? null) : null,
            createdByUserId: access.userId,
        });
    }

    async updateText(input: UpdateCampaignInput, access: CampaignAccess): Promise<Campaign> {
        await this.getAccessible(input.id, access);

        return this.repository.updateText(input.id, {
            title: input.title,
            content: input.content,
            hashtags: input.hashtags,
            callToAction: input.callToAction,
        });
    }

    async setStatus(id: number, status: CampaignStatus, access: CampaignAccess): Promise<Campaign> {
        const campaign = await this.getAccessible(id, access);
        if (campaign.status === status) return campaign;

        if (status === "publicada") {
            // Publicar solo tiene sentido si aún hay algún animal para adoptar:
            // la landing oculta a los que ya no están disponibles.
            const adoptable = await this.animals.listAdoptable({ shelterId: campaign.shelterId });
            const available = new Set(adoptable.map((a) => a.idAnimal));
            if (!campaign.animals.some((a) => available.has(a.idAnimal))) {
                throw new CampaignPublishError();
            }
        }

        return this.repository.setStatus(id, status);
    }

    async delete(id: number, access: CampaignAccess): Promise<void> {
        await this.getAccessible(id, access);
        await this.repository.delete(id);
    }

    // -----------------------------------------------------------------------

    /** El superadmin puede elegir albergue; los demás siempre usan el suyo, aunque envíen otro id. */
    private async resolveShelter(access: CampaignAccess, requested?: number): Promise<number> {
        const shelterId = access.allShelters && requested ? requested : access.shelterId;

        if (shelterId !== access.shelterId) {
            const exists = await this.repository.shelterExists(shelterId);
            if (!exists) throw new CampaignShelterNotFoundError();
        }
        return shelterId;
    }

    /** Responde "no existe" tanto si no hay campaña como si es de otro albergue: no revela cuál es el caso. */
    private async getAccessible(id: number, access: CampaignAccess): Promise<Campaign> {
        const campaign = await this.repository.findById(id);
        if (!campaign) throw new CampaignNotFoundError();
        if (!access.allShelters && campaign.shelterId !== access.shelterId) {
            throw new CampaignNotFoundError();
        }
        return campaign;
    }
}
