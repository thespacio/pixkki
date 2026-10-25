import { describe, it, expect, vi, beforeEach } from "vitest";
import { qaAnnotate } from "../../utils/qa";
import { AnimalService } from "@/modules/animals/services/animal.service";
import type { AnimalRepository } from "@/modules/animals/repositories/animal.repository";
import type { AnimalAccess } from "@/modules/animals/access";
import { getAnimalAccess, isSuperadmin } from "@/modules/animals/access";
import {
    AnimalMicrochipDuplicateError,
    AnimalNotFoundError,
    AnimalShelterNotFoundError,
    AnimalSpaceMismatchError,
    AnimalStateNotFoundError,
    type Animal,
} from "@/modules/animals/types/animales.types";
import type { CreateAnimalInput } from "@/modules/animals/validators/animal.validators";

const dtoBase: CreateAnimalInput = {
    especie: "Perro",
    procedencia: "Calle",
    rasgosFisicos: "Pelo corto",
    estadoInicial: "Estable",
    idEstado: 1,
    idEspacio: 10,
    enCuarentena: false,
    esterilizado: false,
    disponibleAdopcion: false,
    activo: true,
    vacunado: false,
    desparasitado: false,
};

const animalDe = (idAnimal: number, idRefugio: number, extra: Partial<Animal> = {}) =>
    ({ idAnimal, idRefugio, microchip: null, ...extra }) as Animal;

function fakeRepo() {
    return {
        findAll: vi.fn().mockResolvedValue([]),
        findAllByRefugio: vi.fn().mockResolvedValue([]),
        findById: vi.fn(),
        create: vi.fn().mockImplementation(async (_dto, idRefugio) => animalDe(99, idRefugio)),
        update: vi.fn().mockImplementation(async (id) => animalDe(id, 1)),
        softDelete: vi.fn().mockResolvedValue(undefined),
        espacioExistsInRefugio: vi.fn().mockResolvedValue(true),
        estadoExists: vi.fn().mockResolvedValue(true),
        refugioExists: vi.fn().mockResolvedValue(true),
        microchipInUse: vi.fn().mockResolvedValue(false),
    };
}

let repo: ReturnType<typeof fakeRepo>;
let service: AnimalService;

const admin: AnimalAccess = { shelterId: 1, allShelters: false };
const superadmin: AnimalAccess = { shelterId: 1, allShelters: true };

beforeEach(() => {
    repo = fakeRepo();
    service = new AnimalService(repo as unknown as AnimalRepository);
});

describe("alcance de usuario sobre animales", () => {
    it("reconoce al superadmin sin importar mayúsculas ni guiones", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U60",
            categoria: "Seguridad",
            criterio: "El rol 'Superadmin' (como lo guarda la base) se reconoce como superadmin; los demás roles, no.",
            prioridad: "Alta",
            notas: "El tipo UserRole declara 'superadmin' en minúsculas pero la base devuelve 'Superadmin'.",
        });

        expect(isSuperadmin({ role: "Superadmin" as never })).toBe(true);
        expect(isSuperadmin({ role: "superadmin" })).toBe(true);
        expect(isSuperadmin({ role: "super_admin" as never })).toBe(true);
        expect(isSuperadmin({ role: "Administrador" as never })).toBe(false);
        expect(isSuperadmin({ role: "veterinario" })).toBe(false);

        expect(getAnimalAccess({ role: "Superadmin" as never, shelterId: 4 })).toEqual({
            shelterId: 4,
            allShelters: true,
        });
        expect(getAnimalAccess({ role: "admin", shelterId: 4 })).toEqual({
            shelterId: 4,
            allShelters: false,
        });
    });
});

describe("listado de animales según el rol", () => {
    it("el superadmin ve todos los albergues y el resto solo el suyo", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U61",
            categoria: "Seguridad",
            criterio: "Un usuario normal solo recibe los animales de su albergue; el superadmin recibe los de todos.",
            prioridad: "Alta",
        });

        await service.listVisible(admin);
        expect(repo.findAllByRefugio).toHaveBeenCalledWith(1);
        expect(repo.findAll).not.toHaveBeenCalled();

        await service.listVisible(superadmin);
        expect(repo.findAll).toHaveBeenCalledTimes(1);
    });
});

describe("registro de animales: asociación a un albergue", () => {
    it("un usuario normal siempre registra en su albergue, aunque envíe otro id", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U62",
            categoria: "Seguridad",
            criterio: "Un administrador de albergue no puede asociar un animal a otro albergue manipulando el id enviado.",
            prioridad: "Alta",
        });

        await service.create({ ...dtoBase, idRefugio: 7 }, admin);

        expect(repo.create).toHaveBeenCalledWith(expect.anything(), 1);
        expect(repo.espacioExistsInRefugio).toHaveBeenCalledWith(10, 1);
        expect(repo.refugioExists).not.toHaveBeenCalled();
    });

    it("el superadmin puede asociar el animal al albergue que elija", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U63",
            categoria: "Funcional",
            criterio: "El superadmin registra el animal en el albergue elegido y el espacio se valida contra ESE albergue.",
            prioridad: "Alta",
        });

        const animal = await service.create({ ...dtoBase, idRefugio: 7 }, superadmin);

        expect(repo.refugioExists).toHaveBeenCalledWith(7);
        expect(repo.espacioExistsInRefugio).toHaveBeenCalledWith(10, 7);
        expect(repo.create).toHaveBeenCalledWith(expect.anything(), 7);
        expect(animal.idRefugio).toBe(7);
    });

    it("sin elegir albergue, el superadmin usa el suyo", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U64",
            categoria: "Funcional",
            criterio: "Si el superadmin no indica albergue, el animal se asocia al albergue del propio usuario.",
            prioridad: "Media",
        });

        await service.create(dtoBase, superadmin);
        expect(repo.create).toHaveBeenCalledWith(expect.anything(), 1);
    });

    it("rechaza un albergue que no existe", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U65",
            categoria: "Funcional",
            criterio: "No se puede registrar un animal en un albergue inexistente.",
            prioridad: "Media",
        });

        repo.refugioExists.mockResolvedValue(false);
        await expect(service.create({ ...dtoBase, idRefugio: 999 }, superadmin)).rejects.toBeInstanceOf(
            AnimalShelterNotFoundError,
        );
        expect(repo.create).not.toHaveBeenCalled();
    });

    it("rechaza un espacio que no pertenece al albergue destino", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U66",
            categoria: "Funcional",
            criterio: "El espacio elegido debe pertenecer al albergue donde se registra el animal.",
            prioridad: "Alta",
        });

        repo.espacioExistsInRefugio.mockResolvedValue(false);
        await expect(service.create(dtoBase, admin)).rejects.toBeInstanceOf(AnimalSpaceMismatchError);
        expect(repo.create).not.toHaveBeenCalled();
    });

    it("rechaza un estado inexistente", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U67",
            categoria: "Funcional",
            criterio: "El estado del animal debe existir en el catálogo.",
            prioridad: "Media",
        });

        repo.estadoExists.mockResolvedValue(false);
        await expect(service.create(dtoBase, admin)).rejects.toBeInstanceOf(AnimalStateNotFoundError);
    });

    it("rechaza un microchip que ya pertenece a otro animal", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U68",
            categoria: "Funcional",
            criterio: "Un microchip identifica a un solo animal: registrar uno repetido se rechaza.",
            prioridad: "Alta",
        });

        repo.microchipInUse.mockResolvedValue(true);
        await expect(
            service.create({ ...dtoBase, microchip: "985112345678901" }, admin),
        ).rejects.toBeInstanceOf(AnimalMicrochipDuplicateError);
        expect(repo.create).not.toHaveBeenCalled();

        // Sin microchip no se consulta la base por duplicados.
        repo.microchipInUse.mockClear();
        await service.create(dtoBase, admin);
        expect(repo.microchipInUse).not.toHaveBeenCalled();
    });
});

describe("edición y baja de animales: aislamiento entre albergues", () => {
    it("un usuario normal no puede editar ni dar de baja animales de otro albergue", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U69",
            categoria: "Seguridad",
            criterio: "Editar o dar de baja un animal de otro albergue responde 'no encontrado' (no revela que existe).",
            prioridad: "Alta",
        });

        repo.findById.mockResolvedValue(animalDe(5, 2));

        await expect(service.update({ id: 5, vacunado: true }, admin)).rejects.toBeInstanceOf(AnimalNotFoundError);
        await expect(service.delete(5, admin)).rejects.toBeInstanceOf(AnimalNotFoundError);
        await expect(service.getById(5, admin)).rejects.toBeInstanceOf(AnimalNotFoundError);
        expect(repo.update).not.toHaveBeenCalled();
        expect(repo.softDelete).not.toHaveBeenCalled();
    });

    it("el superadmin puede operar sobre animales de cualquier albergue", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U70",
            categoria: "Funcional",
            criterio: "El superadmin edita y da de baja animales de otros albergues; el espacio se valida contra el albergue del animal.",
            prioridad: "Alta",
        });

        repo.findById.mockResolvedValue(animalDe(5, 2));

        await service.update({ id: 5, idEspacio: 20 }, superadmin);
        expect(repo.espacioExistsInRefugio).toHaveBeenCalledWith(20, 2);
        expect(repo.update).toHaveBeenCalledTimes(1);

        await service.delete(5, superadmin);
        expect(repo.softDelete).toHaveBeenCalledWith(5);
    });

    it("al editar, el mismo microchip del propio animal no cuenta como duplicado", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U71",
            categoria: "Funcional",
            criterio: "Guardar un animal conservando su microchip no da error; cambiarlo por uno ajeno sí.",
            prioridad: "Media",
        });

        repo.findById.mockResolvedValue(animalDe(5, 1, { microchip: "985112345678901" }));

        await service.update({ id: 5, microchip: "985112345678901" }, admin);
        expect(repo.microchipInUse).not.toHaveBeenCalled();

        repo.microchipInUse.mockResolvedValue(true);
        await expect(service.update({ id: 5, microchip: "111222333444555" }, admin)).rejects.toBeInstanceOf(
            AnimalMicrochipDuplicateError,
        );
    });

    it("un animal inexistente responde 'no encontrado'", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U72",
            categoria: "Funcional",
            criterio: "Operar sobre un id que no existe responde 'no encontrado'.",
            prioridad: "Baja",
        });

        repo.findById.mockResolvedValue(null);
        await expect(service.update({ id: 404, vacunado: true }, superadmin)).rejects.toBeInstanceOf(AnimalNotFoundError);
        await expect(service.delete(404, superadmin)).rejects.toBeInstanceOf(AnimalNotFoundError);
    });
});
