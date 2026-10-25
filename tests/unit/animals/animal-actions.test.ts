import { describe, it, expect, vi, beforeEach } from "vitest";
import { qaAnnotate } from "../../utils/qa";

// Todo lo que toca servidor (sesión, base de datos, caché de Next) se simula.
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/modules/auth", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/modules/animals/factories/create-animal-service", () => ({
    createAnimalService: vi.fn(),
}));

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/modules/auth";
import { createAnimalService } from "@/modules/animals/factories/create-animal-service";
import {
    createAnimalAction,
    deleteAnimalAction,
    updateAnimalAction,
} from "@/modules/animals/actions/animal.actions";
import { AnimalMicrochipDuplicateError } from "@/modules/animals/types/animales.types";

const dtoValido = {
    especie: "Perro" as const,
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

const usuario = (role: string, permissions: string[], shelterId = 1) =>
    ({ id: 1, role, shelterId, permissions }) as never;

const TODOS = ["animals.view", "animals.create", "animals.edit", "animals.delete"];

const service = {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
};

beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createAnimalService).mockResolvedValue(service as never);
    service.create.mockResolvedValue({ idAnimal: 1 });
    service.update.mockResolvedValue({ idAnimal: 1 });
    service.delete.mockResolvedValue(undefined);
});

describe("acciones de animales: permisos", () => {
    it("rechaza registrar, editar y dar de baja sin el permiso correspondiente", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U80",
            categoria: "Seguridad",
            criterio: "Un usuario con solo permiso de ver no puede crear, editar ni eliminar animales (se valida en el servidor, no solo en la interfaz).",
            prioridad: "Alta",
        });

        vi.mocked(getCurrentUser).mockResolvedValue(usuario("veterinario", ["animals.view"]));

        const crear = await createAnimalAction(dtoValido);
        const editar = await updateAnimalAction({ id: 1, vacunado: true });
        const borrar = await deleteAnimalAction(1);

        for (const r of [crear, editar, borrar]) {
            expect(r.success).toBe(false);
            if (!r.success) expect(r.error).toMatch(/No tienes permiso/);
        }
        expect(service.create).not.toHaveBeenCalled();
        expect(service.update).not.toHaveBeenCalled();
        expect(service.delete).not.toHaveBeenCalled();
    });

    it("con permisos, registra y refresca la lista de /animals", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U81",
            categoria: "Funcional",
            criterio: "Con permiso, registrar un animal responde éxito y refresca la ruta /animals para que aparezca en la lista.",
            prioridad: "Alta",
            notas: "Regresión: la ruta a refrescar era '/animales' (inexistente) y la lista no se actualizaba.",
        });

        vi.mocked(getCurrentUser).mockResolvedValue(usuario("Administrador", TODOS));

        const result = await createAnimalAction(dtoValido);

        expect(result).toEqual({ success: true, data: { idAnimal: 1 } });
        expect(revalidatePath).toHaveBeenCalledWith("/animals");
    });
});

describe("acciones de animales: alcance por albergue", () => {
    it("pasa el alcance de superadmin cuando el rol es 'Superadmin'", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U82",
            categoria: "Seguridad",
            criterio: "El superadmin opera con alcance sobre todos los albergues; un administrador, solo sobre el suyo.",
            prioridad: "Alta",
        });

        vi.mocked(getCurrentUser).mockResolvedValue(usuario("Superadmin", TODOS, 1));
        await createAnimalAction({ ...dtoValido, idRefugio: 8 });
        expect(service.create).toHaveBeenLastCalledWith(
            expect.objectContaining({ idRefugio: 8 }),
            { shelterId: 1, allShelters: true },
        );

        vi.mocked(getCurrentUser).mockResolvedValue(usuario("Administrador", TODOS, 3));
        await createAnimalAction({ ...dtoValido, idRefugio: 8 });
        expect(service.create).toHaveBeenLastCalledWith(
            expect.anything(),
            { shelterId: 3, allShelters: false },
        );
    });
});

describe("acciones de animales: mensajes de error", () => {
    beforeEach(() => {
        vi.mocked(getCurrentUser).mockResolvedValue(usuario("Administrador", TODOS));
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    it("explica qué campo está mal cuando los datos son inválidos", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U83",
            categoria: "Funcional",
            criterio: "Datos inválidos no llegan a la base y el error indica el campo.",
            prioridad: "Alta",
        });

        const result = await createAnimalAction({ ...dtoValido, microchip: "123" });
        expect(result.success).toBe(false);
        if (!result.success) expect(result.error).toMatch(/microchip/i);
        expect(service.create).not.toHaveBeenCalled();
    });

    it("muestra al usuario los errores de negocio tal cual", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U84",
            categoria: "Funcional",
            criterio: "Un microchip duplicado llega al usuario con un mensaje claro, no como error genérico.",
            prioridad: "Alta",
        });

        service.create.mockRejectedValue(new AnimalMicrochipDuplicateError());
        const result = await createAnimalAction(dtoValido);
        expect(result).toEqual({
            success: false,
            error: "Ya existe un animal registrado con ese microchip",
        });
    });

    it("avisa que falta aplicar la migración si la base no tiene las columnas nuevas", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U85",
            categoria: "Funcional",
            criterio: "Si la base aún no tiene las columnas de la ficha de rescate, el error indica ejecutar la migración SQL.",
            prioridad: "Media",
        });

        service.create.mockRejectedValue({
            code: "PGRST204",
            message: "Could not find the 'color' column of 'animal' in the schema cache",
        });
        const result = await createAnimalAction(dtoValido);
        expect(result.success).toBe(false);
        if (!result.success) expect(result.error).toMatch(/20261024_animal_datos_rescate\.sql/);
    });

    it("traduce microchip duplicado de la base y no filtra detalles internos en errores desconocidos", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U86",
            categoria: "Seguridad",
            criterio: "Un error inesperado del servidor se muestra como mensaje genérico, sin exponer detalles internos de la base.",
            prioridad: "Alta",
        });

        service.create.mockRejectedValueOnce({ code: "23505", message: "duplicate key value violates unique constraint" });
        const duplicado = await createAnimalAction(dtoValido);
        expect(duplicado.success).toBe(false);
        if (!duplicado.success) expect(duplicado.error).toBe("Ya existe un animal con ese microchip");

        service.create.mockRejectedValueOnce(new Error("connection to 10.0.0.5:5432 refused (password=secreto)"));
        const inesperado = await createAnimalAction(dtoValido);
        expect(inesperado.success).toBe(false);
        if (!inesperado.success) {
            expect(inesperado.error).toBe("No se pudo completar la operación. Intenta de nuevo.");
            expect(inesperado.error).not.toMatch(/secreto|10\.0\.0\.5/);
        }
    });

    it("una actualización parcial solo envía los campos indicados", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U87",
            categoria: "Funcional",
            criterio: "Marcar disponible para adopción envía únicamente ese cambio, sin reiniciar cuarentena, esterilizado ni activo.",
            prioridad: "Alta",
            notas: "Regresión del bug de defaults de Zod 4 en actualizaciones parciales.",
        });

        await updateAnimalAction({ id: 3, disponibleAdopcion: true });

        expect(service.update).toHaveBeenCalledTimes(1);
        const [dto] = service.update.mock.calls[0];
        expect(dto).toEqual({ id: 3, disponibleAdopcion: true });
    });
});
