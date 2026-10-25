import { describe, it, expect, vi, beforeEach } from "vitest";
import { qaAnnotate } from "../../utils/qa";
import { CampaignService } from "@/modules/campaigns/services/campaign.service";
import type { CampaignAccess } from "@/modules/campaigns/access";
import { getCampaignAccess } from "@/modules/campaigns/access";
import {
    CampaignAnimalsError,
    CampaignNotFoundError,
    CampaignPublishError,
    CampaignShelterNotFoundError,
    NoAdoptableAnimalsError,
    type AdoptableAnimal,
    type Campaign,
} from "@/modules/campaigns/types";
import type { CreateCampaignInput } from "@/modules/campaigns/validators";

const adoptable = (idAnimal: number, shelterId = 1, extra: Partial<AdoptableAnimal> = {}): AdoptableAnimal => ({
    idAnimal, shelterId, shelterName: `Albergue ${shelterId}`, nombre: `A${idAnimal}`, especie: "Perro",
    raza: null, sexo: "M", edadEstimada: 12, tamano: null, color: null, temperamento: null,
    vacunado: false, esterilizado: false, desparasitado: false, rasgosFisicos: null, ...extra,
});

const campaign = (id: number, shelterId: number, animalIds: number[], status: Campaign["status"] = "borrador"): Campaign => ({
    id, shelterId, shelterName: `Albergue ${shelterId}`, title: "Título", content: "Contenido de prueba largo",
    hashtags: [], callToAction: null, status, generatedByAi: true, aiModel: "m",
    createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z", publishedAt: null,
    animals: animalIds.map((idAnimal) => ({ idAnimal, nombre: `A${idAnimal}`, especie: "Perro", raza: null, sexo: "M", edadEstimada: 12 })),
});

function setup() {
    const repository = {
        findAll: vi.fn().mockResolvedValue([]),
        findAllByShelter: vi.fn().mockResolvedValue([]),
        findById: vi.fn(),
        shelterExists: vi.fn().mockResolvedValue(true),
        create: vi.fn().mockImplementation(async (d) => campaign(50, d.shelterId, d.animalIds)),
        updateText: vi.fn().mockImplementation(async (id) => campaign(id, 1, [1])),
        setStatus: vi.fn().mockImplementation(async (id, status) => campaign(id, 1, [1], status)),
        delete: vi.fn().mockResolvedValue(undefined),
    };
    const animals = {
        listAdoptable: vi.fn().mockImplementation(async ({ shelterId }: { shelterId?: number }) =>
            [adoptable(1, 1), adoptable(2, 1), adoptable(10, 2)].filter((a) => shelterId === undefined || a.shelterId === shelterId),
        ),
    };
    const suggester = {
        suggest: vi.fn().mockResolvedValue({
            suggestions: [{ title: "T", content: "C".repeat(20), hashtags: [], callToAction: null, animalIds: [1] }],
            model: "gemini-test",
        }),
    };
    const service = new CampaignService({
        repository: repository as never,
        animals,
        suggester,
    });
    return { service, repository, animals, suggester };
}

const admin: CampaignAccess = { shelterId: 1, allShelters: false, userId: 5 };
const superadmin: CampaignAccess = { shelterId: 1, allShelters: true, userId: 9 };

const crear = (over: Partial<CreateCampaignInput> = {}): CreateCampaignInput => ({
    title: "Conoce a A1",
    content: "Un texto de campaña suficientemente largo.",
    animalIds: [1],
    ...over,
});

let ctxSvc: ReturnType<typeof setup>;
beforeEach(() => {
    ctxSvc = setup();
});

describe("alcance sobre campañas", () => {
    it("el superadmin se reconoce aunque el rol venga como 'Superadmin'", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U130",
            categoria: "Seguridad",
            criterio: "El alcance del usuario se calcula bien con el rol tal como lo guarda la base ('Superadmin').",
            prioridad: "Alta",
        });

        expect(getCampaignAccess({ id: 9, role: "Superadmin" as never, shelterId: 3 })).toEqual({
            userId: 9, shelterId: 3, allShelters: true,
        });
        expect(getCampaignAccess({ id: 5, role: "Administrador" as never, shelterId: 3 }).allShelters).toBe(false);
    });

    it("lista todas las campañas al superadmin y solo las de su albergue al resto", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U131",
            categoria: "Seguridad",
            criterio: "Un administrador solo recibe las campañas de su albergue; el superadmin recibe las de todos.",
            prioridad: "Alta",
        });

        const { service, repository, animals } = ctxSvc;

        await service.list(admin);
        expect(repository.findAllByShelter).toHaveBeenCalledWith(1);
        expect(repository.findAll).not.toHaveBeenCalled();

        await service.list(superadmin);
        expect(repository.findAll).toHaveBeenCalledTimes(1);

        await service.listAdoptable(admin);
        expect(animals.listAdoptable).toHaveBeenLastCalledWith({ shelterId: 1 });
        await service.listAdoptable(superadmin);
        expect(animals.listAdoptable).toHaveBeenLastCalledWith({});
    });
});

describe("generar sugerencias", () => {
    it("trabaja solo con animales disponibles para adopción del albergue", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U132",
            categoria: "Funcional",
            criterio: "La IA solo recibe animales en adopción del albergue del usuario, y devuelve el modelo y el albergue usados.",
            prioridad: "Alta",
        });

        const { service, suggester } = ctxSvc;
        const batch = await service.generate({ count: 3, tone: "cercano" }, admin);

        const sent = suggester.suggest.mock.calls[0][0];
        expect(sent.animals.map((a: AdoptableAnimal) => a.idAnimal)).toEqual([1, 2]);
        expect(sent).toMatchObject({ count: 3, tone: "cercano", shelterName: "Albergue 1" });
        expect(batch).toMatchObject({ model: "gemini-test", shelterId: 1, shelterName: "Albergue 1" });
        expect(batch.suggestions).toHaveLength(1);
    });

    it("sin animales en adopción explica qué hacer y no gasta una llamada a la IA", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U133",
            categoria: "Funcional",
            criterio: "Si no hay animales disponibles para adopción no se llama a la IA y se indica cómo habilitarlos.",
            prioridad: "Alta",
        });

        const { service, animals, suggester } = ctxSvc;
        animals.listAdoptable.mockResolvedValue([]);

        await expect(service.generate({ count: 3, tone: "cercano" }, admin)).rejects.toBeInstanceOf(NoAdoptableAnimalsError);
        expect(suggester.suggest).not.toHaveBeenCalled();
    });

    it("respeta los animales elegidos y rechaza los que no están en adopción", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U134",
            categoria: "Seguridad",
            criterio: "Si el usuario elige animales, la IA solo habla de ellos; elegir uno que no está en adopción o es de otro albergue se rechaza.",
            prioridad: "Alta",
        });

        const { service, suggester } = ctxSvc;

        await service.generate({ count: 2, tone: "formal", animalIds: [2] }, admin);
        expect(suggester.suggest.mock.calls[0][0].animals.map((a: AdoptableAnimal) => a.idAnimal)).toEqual([2]);

        suggester.suggest.mockClear();
        await expect(service.generate({ count: 2, tone: "formal", animalIds: [1, 10] }, admin)).rejects.toBeInstanceOf(
            CampaignAnimalsError,
        );
        expect(suggester.suggest).not.toHaveBeenCalled();
    });

    it("un administrador no puede generar para otro albergue; el superadmin sí", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U135",
            categoria: "Seguridad",
            criterio: "Manipular el id de albergue no sirve a un administrador; el superadmin elige albergue y se valida que exista.",
            prioridad: "Alta",
        });

        const { service, animals, repository } = ctxSvc;

        await service.generate({ count: 1, tone: "cercano", idRefugio: 2 }, admin);
        expect(animals.listAdoptable).toHaveBeenLastCalledWith({ shelterId: 1 });
        expect(repository.shelterExists).not.toHaveBeenCalled();

        const batch = await service.generate({ count: 1, tone: "cercano", idRefugio: 2 }, superadmin);
        expect(animals.listAdoptable).toHaveBeenLastCalledWith({ shelterId: 2 });
        expect(repository.shelterExists).toHaveBeenCalledWith(2);
        expect(batch.shelterId).toBe(2);

        repository.shelterExists.mockResolvedValue(false);
        await expect(service.generate({ count: 1, tone: "cercano", idRefugio: 99 }, superadmin)).rejects.toBeInstanceOf(
            CampaignShelterNotFoundError,
        );
    });
});

describe("guardar campañas", () => {
    it("guarda un borrador con los animales del albergue y registra quién lo creó", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U136",
            categoria: "Funcional",
            criterio: "La campaña se guarda como borrador asociada al albergue del usuario, con su autor y el modelo de IA si la generó la IA.",
            prioridad: "Alta",
        });

        const { service, repository } = ctxSvc;
        await service.create(crear({ hashtags: ["Adopta"], callToAction: "Escríbenos", generatedByAi: true, aiModel: "gemini-test" }), admin);

        expect(repository.create).toHaveBeenCalledWith({
            shelterId: 1,
            title: "Conoce a A1",
            content: "Un texto de campaña suficientemente largo.",
            hashtags: ["Adopta"],
            callToAction: "Escríbenos",
            animalIds: [1],
            generatedByAi: true,
            aiModel: "gemini-test",
            createdByUserId: 5,
        });
    });

    it("no guarda un modelo de IA si la campaña no la generó la IA", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U137",
            categoria: "Funcional",
            criterio: "Solo se registra el modelo de IA cuando la campaña fue generada por IA.",
            prioridad: "Baja",
        });

        const { service, repository } = ctxSvc;
        await service.create(crear({ generatedByAi: false, aiModel: "gemini-test" }), admin);
        expect(repository.create.mock.calls[0][0]).toMatchObject({ generatedByAi: false, aiModel: null, hashtags: [], callToAction: null });
    });

    it("rechaza animales que no están en adopción o son de otro albergue", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U138",
            categoria: "Seguridad",
            criterio: "No se confía en lo que envía el navegador: los animales de la campaña se verifican en el servidor.",
            prioridad: "Alta",
        });

        const { service, repository } = ctxSvc;
        await expect(service.create(crear({ animalIds: [1, 10] }), admin)).rejects.toBeInstanceOf(CampaignAnimalsError);
        await expect(service.create(crear({ animalIds: [777] }), admin)).rejects.toBeInstanceOf(CampaignAnimalsError);
        expect(repository.create).not.toHaveBeenCalled();
    });

    it("el albergue destino lo elige solo el superadmin", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U139",
            categoria: "Seguridad",
            criterio: "Un administrador no puede crear campañas en otro albergue; el superadmin sí, validando animales contra ese albergue.",
            prioridad: "Alta",
        });

        const { service, repository } = ctxSvc;

        await service.create(crear({ idRefugio: 2, animalIds: [1] }), admin);
        expect(repository.create.mock.calls[0][0].shelterId).toBe(1);

        await service.create(crear({ idRefugio: 2, animalIds: [10] }), superadmin);
        expect(repository.create.mock.calls[1][0].shelterId).toBe(2);

        // El animal 1 es del albergue 1: no sirve para una campaña del albergue 2.
        await expect(service.create(crear({ idRefugio: 2, animalIds: [1] }), superadmin)).rejects.toBeInstanceOf(
            CampaignAnimalsError,
        );
    });
});

describe("publicar, archivar, editar y eliminar", () => {
    it("no permite publicar si ningún animal sigue disponible", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U140",
            categoria: "Funcional",
            criterio: "Publicar exige que al menos un animal de la campaña siga disponible para adopción.",
            prioridad: "Alta",
        });

        const { service, repository } = ctxSvc;

        repository.findById.mockResolvedValue(campaign(1, 1, [777])); // ya no está en adopción
        await expect(service.setStatus(1, "publicada", admin)).rejects.toBeInstanceOf(CampaignPublishError);
        expect(repository.setStatus).not.toHaveBeenCalled();

        repository.findById.mockResolvedValue(campaign(2, 1, [777, 2])); // basta con uno
        await service.setStatus(2, "publicada", admin);
        expect(repository.setStatus).toHaveBeenCalledWith(2, "publicada");
    });

    it("archivar y despublicar no revisan los animales; repetir el mismo estado no hace nada", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U141",
            categoria: "Funcional",
            criterio: "Archivar o volver a borrador funciona siempre; pedir el estado que ya tiene no escribe en la base.",
            prioridad: "Media",
        });

        const { service, repository, animals } = ctxSvc;

        repository.findById.mockResolvedValue(campaign(1, 1, [777], "publicada"));
        await service.setStatus(1, "archivada", admin);
        await service.setStatus(1, "borrador", admin);
        expect(animals.listAdoptable).not.toHaveBeenCalled();
        expect(repository.setStatus).toHaveBeenCalledTimes(2);

        repository.setStatus.mockClear();
        const same = await service.setStatus(1, "publicada", admin);
        expect(same.status).toBe("publicada");
        expect(repository.setStatus).not.toHaveBeenCalled();
    });

    it("una campaña de otro albergue responde 'no existe' (no revela que existe)", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U142",
            categoria: "Seguridad",
            criterio: "Editar, publicar o eliminar una campaña ajena responde igual que si no existiera; el superadmin sí puede.",
            prioridad: "Alta",
        });

        const { service, repository } = ctxSvc;
        repository.findById.mockResolvedValue(campaign(5, 2, [10]));

        await expect(service.updateText({ id: 5, title: "Nuevo título" }, admin)).rejects.toBeInstanceOf(CampaignNotFoundError);
        await expect(service.setStatus(5, "archivada", admin)).rejects.toBeInstanceOf(CampaignNotFoundError);
        await expect(service.delete(5, admin)).rejects.toBeInstanceOf(CampaignNotFoundError);
        expect(repository.updateText).not.toHaveBeenCalled();
        expect(repository.delete).not.toHaveBeenCalled();

        await service.delete(5, superadmin);
        expect(repository.delete).toHaveBeenCalledWith(5);

        repository.findById.mockResolvedValue(null);
        await expect(service.delete(404, superadmin)).rejects.toBeInstanceOf(CampaignNotFoundError);
    });

    it("al editar solo se envían los campos indicados", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U143",
            categoria: "Funcional",
            criterio: "Editar el título no toca el texto ni los hashtags.",
            prioridad: "Media",
        });

        const { service, repository } = ctxSvc;
        repository.findById.mockResolvedValue(campaign(1, 1, [1]));

        await service.updateText({ id: 1, title: "Solo el título" }, admin);
        expect(repository.updateText).toHaveBeenCalledWith(1, {
            title: "Solo el título",
            content: undefined,
            hashtags: undefined,
            callToAction: undefined,
        });
    });
});
