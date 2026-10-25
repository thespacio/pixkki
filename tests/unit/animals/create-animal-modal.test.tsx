import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { qaAnnotate } from "../../utils/qa";
import { CreateAnimalModal } from "@/modules/animals/components/CreateAnimalModal";
import type { AnimalState } from "@/modules/animals/types/animal-state.types";
import type { Space } from "@/modules/spaces/types/types";

vi.mock("@/modules/animals/actions/animal.actions", () => ({
    createAnimalAction: vi.fn(),
    updateAnimalAction: vi.fn(),
    deleteAnimalAction: vi.fn(),
}));

import { createAnimalAction } from "@/modules/animals/actions/animal.actions";

const estados: AnimalState[] = [
    { idEstado: 1, nombreEstado: "En observación", descripcion: null },
    { idEstado: 2, nombreEstado: "En tratamiento", descripcion: null },
];

const espacio = (id: number, shelterId: number, name: string): Space => ({
    id, shelterId, name, description: null, capacity: 5, type: "Patio", available: true,
});

const espacios: Space[] = [
    espacio(10, 1, "Patio Centro"),
    espacio(11, 1, "Gatera Centro"),
    espacio(20, 2, "Patio Norte"),
];

const refugios = [
    { id: 1, nombre: "Albergue Centro" },
    { id: 2, nombre: "Albergue Norte" },
];

const fakeAnimal = (nombre: string | null) => ({ nombre, especie: "Perro" });

async function openModal(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("button", { name: /Registrar animal/ }));
    return screen.getByRole("dialog", { name: "Registrar animal" });
}

async function fillRequired(user: ReturnType<typeof userEvent.setup>, dialog: HTMLElement) {
    await user.selectOptions(within(dialog).getByLabelText("Estado *"), "1");
    await user.type(within(dialog).getByLabelText("Procedencia *"), "Calle");
    await user.type(within(dialog).getByLabelText("Rasgos físicos *"), "Pelo corto y orejas caídas");
    await user.type(within(dialog).getByLabelText("Estado inicial al ingreso *"), "Desnutrido pero estable");
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe("registro de animales: formulario", () => {
    it("no envía el formulario vacío y señala los campos obligatorios", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U50",
            categoria: "Funcional",
            criterio: "Registrar sin completar lo obligatorio no envía nada y muestra qué campos faltan.",
            prioridad: "Alta",
        });

        const user = userEvent.setup();
        render(<CreateAnimalModal estados={estados} espacios={espacios.slice(0, 2)} />);

        const dialog = await openModal(user);
        await user.click(within(dialog).getByRole("button", { name: "Registrar animal" }));

        expect(await within(dialog).findByText("Selecciona un estado")).toBeInTheDocument();
        expect(within(dialog).getByText("Selecciona un espacio")).toBeInTheDocument();
        expect(within(dialog).getAllByText("Mínimo 2 caracteres").length).toBeGreaterThanOrEqual(3);
        expect(createAnimalAction).not.toHaveBeenCalled();
    });

    it("un usuario normal no ve el selector de albergue", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U51",
            categoria: "Funcional",
            criterio: "Quien no es superadmin no elige albergue: el animal se asocia al suyo automáticamente.",
            prioridad: "Alta",
        });

        const user = userEvent.setup();
        render(<CreateAnimalModal estados={estados} espacios={espacios.slice(0, 2)} />);

        const dialog = await openModal(user);
        expect(within(dialog).queryByLabelText("Albergue *")).not.toBeInTheDocument();
        expect(within(dialog).getByText("El animal se asociará a tu albergue.")).toBeInTheDocument();
    });

    it("el superadmin debe elegir albergue y solo ve los espacios de ese albergue", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U52",
            categoria: "Funcional",
            criterio: "El espacio queda bloqueado hasta elegir albergue, solo ofrece los de ese albergue y se reinicia al cambiar de albergue.",
            prioridad: "Alta",
        });

        const user = userEvent.setup();
        render(<CreateAnimalModal estados={estados} espacios={espacios} refugios={refugios} />);

        const dialog = await openModal(user);
        const espacioSelect = within(dialog).getByLabelText("Espacio / Lugar *");
        expect(espacioSelect).toBeDisabled();
        expect(within(dialog).getByText("Primero elige un albergue")).toBeInTheDocument();

        await user.selectOptions(within(dialog).getByLabelText("Albergue *"), "1");
        expect(espacioSelect).toBeEnabled();
        expect(within(espacioSelect).getAllByRole("option").map((o) => o.textContent)).toEqual([
            "Seleccionar...", "Patio Centro", "Gatera Centro",
        ]);

        await user.selectOptions(espacioSelect, "10");
        expect(espacioSelect).toHaveValue("10");

        await user.selectOptions(within(dialog).getByLabelText("Albergue *"), "2");
        expect(within(espacioSelect).getAllByRole("option").map((o) => o.textContent)).toEqual([
            "Seleccionar...", "Patio Norte",
        ]);
        expect(espacioSelect).toHaveValue("");
    });

    it("el superadmin no puede registrar sin elegir albergue", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U53",
            categoria: "Funcional",
            criterio: "Si el superadmin deja el albergue sin elegir, el formulario lo exige.",
            prioridad: "Alta",
        });

        const user = userEvent.setup();
        render(<CreateAnimalModal estados={estados} espacios={espacios} refugios={refugios} />);

        const dialog = await openModal(user);
        await fillRequired(user, dialog);
        await user.click(within(dialog).getByRole("button", { name: "Registrar animal" }));

        expect(await within(dialog).findByText("Selecciona un albergue")).toBeInTheDocument();
        expect(createAnimalAction).not.toHaveBeenCalled();
    });

    it("envía la ficha completa con el albergue elegido y confirma el registro", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U54",
            categoria: "Funcional",
            criterio: "Con los datos válidos se registra el animal asociado al albergue elegido, con sus datos de rescate, y se confirma al usuario.",
            prioridad: "Alta",
        });

        vi.mocked(createAnimalAction).mockResolvedValueOnce({
            success: true,
            data: fakeAnimal("Firulais") as never,
        });

        const user = userEvent.setup();
        render(<CreateAnimalModal estados={estados} espacios={espacios} refugios={refugios} />);

        const dialog = await openModal(user);
        await user.selectOptions(within(dialog).getByLabelText("Albergue *"), "2");
        await user.selectOptions(within(dialog).getByLabelText("Espacio / Lugar *"), "20");
        await fillRequired(user, dialog);

        await user.type(within(dialog).getByLabelText("Nombre (opcional)"), "Firulais");
        await user.selectOptions(within(dialog).getByLabelText("Sexo"), "M");
        await user.type(within(dialog).getByLabelText("Edad estimada (meses)"), "18");
        await user.selectOptions(within(dialog).getByLabelText("Tamaño"), "Mediano");
        await user.type(within(dialog).getByLabelText("Color / pelaje"), "Café con blanco");
        await user.type(within(dialog).getByLabelText("Microchip"), "985112345678901");
        await user.selectOptions(within(dialog).getByLabelText("Situación del rescate"), "Abandonado");
        await user.type(within(dialog).getByLabelText("Lugar del rescate"), "Avenida Juárez");
        fireEvent.change(within(dialog).getByLabelText("Fecha del rescate"), { target: { value: "2026-01-15" } });
        await user.type(within(dialog).getByLabelText("Reportado por"), "María López");
        await user.type(within(dialog).getByLabelText("Contacto"), "555 123 4567");
        await user.selectOptions(within(dialog).getByLabelText("Temperamento"), "Dócil");
        await user.click(within(dialog).getByLabelText("Vacunado"));
        await user.click(within(dialog).getByLabelText("Disponible para adopción"));
        await user.type(within(dialog).getByLabelText("Notas adicionales"), "Responde a su nombre.");

        await user.click(within(dialog).getByRole("button", { name: "Registrar animal" }));

        await waitFor(() => expect(createAnimalAction).toHaveBeenCalledTimes(1));
        expect(createAnimalAction).toHaveBeenCalledWith(
            expect.objectContaining({
                idRefugio: 2,
                idEspacio: 20,
                idEstado: 1,
                especie: "Perro",
                nombre: "Firulais",
                sexo: "M",
                edadEstimada: 18,
                tamano: "Mediano",
                color: "Café con blanco",
                microchip: "985112345678901",
                situacionRescate: "Abandonado",
                lugarRescate: "Avenida Juárez",
                fechaRescate: "2026-01-15",
                rescatistaNombre: "María López",
                rescatistaContacto: "555 123 4567",
                temperamento: "Dócil",
                vacunado: true,
                desparasitado: false,
                disponibleAdopcion: true,
                observaciones: "Responde a su nombre.",
                procedencia: "Calle",
            }),
        );

        // Se cierra el formulario y aparece la confirmación.
        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
        expect(screen.getByRole("status")).toHaveTextContent("Firulais se registró correctamente");
    });

    it("si el servidor rechaza el registro, muestra el motivo y deja el formulario abierto", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U55",
            categoria: "Funcional",
            criterio: "Cuando el registro falla (por ejemplo microchip repetido) se explica el motivo y no se pierden los datos escritos.",
            prioridad: "Alta",
        });

        vi.mocked(createAnimalAction).mockResolvedValueOnce({
            success: false,
            error: "Ya existe un animal registrado con ese microchip",
        });

        const user = userEvent.setup();
        render(<CreateAnimalModal estados={estados} espacios={espacios.slice(0, 2)} />);

        const dialog = await openModal(user);
        await user.selectOptions(within(dialog).getByLabelText("Espacio / Lugar *"), "10");
        await fillRequired(user, dialog);
        await user.click(within(dialog).getByRole("button", { name: "Registrar animal" }));

        expect(await within(dialog).findByRole("alert")).toHaveTextContent(
            "Ya existe un animal registrado con ese microchip",
        );
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(within(dialog).getByLabelText("Procedencia *")).toHaveValue("Calle");
    });

    it("rechaza un microchip inválido y una fecha de rescate futura en el formulario", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U56",
            categoria: "Funcional",
            criterio: "Microchip mal formado o fecha de rescate futura se marcan como error antes de enviar.",
            prioridad: "Media",
        });

        const user = userEvent.setup();
        render(<CreateAnimalModal estados={estados} espacios={espacios.slice(0, 2)} />);

        const dialog = await openModal(user);
        await user.selectOptions(within(dialog).getByLabelText("Espacio / Lugar *"), "10");
        await fillRequired(user, dialog);
        await user.type(within(dialog).getByLabelText("Microchip"), "123");
        fireEvent.change(within(dialog).getByLabelText("Fecha del rescate"), { target: { value: "2999-01-01" } });
        await user.click(within(dialog).getByRole("button", { name: "Registrar animal" }));

        expect(await within(dialog).findByText("Debe tener entre 9 y 20 caracteres alfanuméricos")).toBeInTheDocument();
        expect(within(dialog).getByText("La fecha no puede ser futura")).toBeInTheDocument();
        expect(createAnimalAction).not.toHaveBeenCalled();
    });

    it("Escape cierra el formulario", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U57",
            categoria: "Funcional",
            criterio: "El formulario de registro se puede cerrar con la tecla Escape.",
            prioridad: "Baja",
        });

        const user = userEvent.setup();
        render(<CreateAnimalModal estados={estados} espacios={espacios.slice(0, 2)} />);

        await openModal(user);
        await user.keyboard("{Escape}");
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
});
