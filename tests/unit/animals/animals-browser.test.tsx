import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { qaAnnotate } from "../../utils/qa";
import { AnimalsTable } from "@/modules/animals/components/AnimalsTable";
import type { Animal } from "@/modules/animals/types/animales.types";
import type { AnimalState } from "@/modules/animals/types/animal-state.types";

// Las Server Actions llegan a Supabase y a next/headers: en estos tests se simulan.
vi.mock("@/modules/animals/actions/animal.actions", () => ({
    createAnimalAction: vi.fn(),
    updateAnimalAction: vi.fn(),
    deleteAnimalAction: vi.fn(),
}));

import {
    deleteAnimalAction,
    updateAnimalAction,
} from "@/modules/animals/actions/animal.actions";

const base: Animal = {
    idAnimal: 0, uuid: null, idRefugio: 1, refugioNombre: "Albergue Centro",
    idEspacio: 1, espacioNombre: "Patio", idEstado: 1, estadoNombre: "En observación",
    nombre: null, especie: "Perro", raza: null, sexo: "M", edadEstimada: 12, peso: null,
    procedencia: "Calle", rasgosFisicos: "Pelo corto", estadoInicial: "Estable",
    fechaIngreso: "2026-03-01T00:00:00Z", activo: true, disponibleAdopcion: false,
    enCuarentena: false, esterilizado: false, deletedAt: null, color: null, tamano: null,
    microchip: null, temperamento: null, vacunado: false, desparasitado: false,
    lugarRescate: null, fechaRescate: null, situacionRescate: null,
    rescatistaNombre: null, rescatistaContacto: null, observaciones: null,
};

const firulais: Animal = {
    ...base, idAnimal: 1, nombre: "Firulais", raza: "Mestizo", tamano: "Mediano",
    disponibleAdopcion: true, vacunado: true, edadEstimada: 18,
    lugarRescate: "Avenida Juárez", fechaRescate: "2026-01-15",
    situacionRescate: "Abandonado", rescatistaNombre: "María López",
    rescatistaContacto: "555 123 4567", observaciones: "Responde a su nombre.",
};
const michi: Animal = {
    ...base, idAnimal: 2, nombre: "Michi", especie: "Gato", sexo: "H", tamano: "Pequeño",
    idEstado: 2, estadoNombre: "En tratamiento", enCuarentena: true,
    idRefugio: 2, refugioNombre: "Albergue Norte", espacioNombre: "Gatera",
};
const sinNombre: Animal = { ...base, idAnimal: 3, esterilizado: true };

const animales = [firulais, michi, sinNombre];

const estados: AnimalState[] = [
    { idEstado: 1, nombreEstado: "En observación", descripcion: null },
    { idEstado: 2, nombreEstado: "En tratamiento", descripcion: null },
];

const refugios = [
    { id: 1, nombre: "Albergue Centro" },
    { id: 2, nombre: "Albergue Norte" },
];

function renderTable(props: Partial<React.ComponentProps<typeof AnimalsTable>> = {}) {
    return render(
        <AnimalsTable
            animales={animales}
            estados={estados}
            refugios={[]}
            canEdit
            canDelete
            {...props}
        />,
    );
}

const cardNames = () =>
    screen.queryAllByRole("button", { name: /^Ver detalle de/ }).map((b) => b.getAttribute("aria-label"));

beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("confirm", vi.fn(() => true));
});

describe("vista de animales: tarjetas y filtros", () => {
    it("muestra una tarjeta por animal con sus datos principales", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U30",
            categoria: "Funcional",
            criterio: "La vista lista a todos los animales como tarjetas, mostrando nombre, raza, sexo, tamaño, edad y etiquetas.",
            prioridad: "Alta",
        });

        renderTable();

        // Orden por defecto "más recientes": con la misma fecha de ingreso, el id más alto primero.
        expect(cardNames()).toEqual([
            "Ver detalle de Perro sin nombre",
            "Ver detalle de Michi",
            "Ver detalle de Firulais",
        ]);

        const card = screen.getByRole("button", { name: "Ver detalle de Firulais" });
        expect(within(card).getByText("Mestizo · Macho · Mediano")).toBeInTheDocument();
        expect(within(card).getByText("1 año 6 meses")).toBeInTheDocument();
        expect(within(card).getByText("En adopción")).toBeInTheDocument();
        expect(within(card).getByText("Vacunado")).toBeInTheDocument();
        expect(screen.getByRole("status")).toHaveTextContent("Mostrando 3 de 3");
    });

    it("la búsqueda de texto filtra las tarjetas", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U31",
            categoria: "Funcional",
            criterio: "Escribir en el buscador deja solo los animales que coinciden (sin distinguir mayúsculas ni acentos).",
            prioridad: "Alta",
        });

        const user = userEvent.setup();
        renderTable();

        await user.type(screen.getByLabelText("Buscar animales"), "JUAREZ");
        expect(cardNames()).toEqual(["Ver detalle de Firulais"]);
        expect(screen.getByRole("status")).toHaveTextContent("Mostrando 1 de 3");
    });

    it("filtra por especie, estado y por los interruptores", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U32",
            categoria: "Funcional",
            criterio: "Los selectores de especie y estado y los botones de adopción/cuarentena clasifican los animales.",
            prioridad: "Alta",
        });

        const user = userEvent.setup();
        renderTable();

        await user.selectOptions(screen.getByLabelText("Especie"), "Gato");
        expect(cardNames()).toEqual(["Ver detalle de Michi"]);

        await user.selectOptions(screen.getByLabelText("Especie"), "");
        await user.selectOptions(screen.getByLabelText("Estado"), "1");
        expect(cardNames()).toHaveLength(2);
        expect(cardNames()).not.toContain("Ver detalle de Michi");

        await user.selectOptions(screen.getByLabelText("Estado"), "");
        const cuarentena = screen.getByRole("button", { name: "En cuarentena" });
        expect(cuarentena).toHaveAttribute("aria-pressed", "false");
        await user.click(cuarentena);
        expect(cuarentena).toHaveAttribute("aria-pressed", "true");
        expect(cardNames()).toEqual(["Ver detalle de Michi"]);
    });

    it("'Limpiar filtros' restaura la lista completa y avisa cuando no hay coincidencias", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U33",
            categoria: "Funcional",
            criterio: "Si ningún animal coincide se muestra un mensaje claro, y 'Limpiar filtros (n)' devuelve todos los animales.",
            prioridad: "Media",
        });

        const user = userEvent.setup();
        renderTable();

        await user.type(screen.getByLabelText("Buscar animales"), "zzzz");
        await user.selectOptions(screen.getByLabelText("Especie"), "Gato");

        expect(screen.getByText("Ningún animal coincide con los filtros")).toBeInTheDocument();
        const limpiar = screen.getByRole("button", { name: /Limpiar filtros \(2\)/ });

        await user.click(limpiar);
        expect(cardNames()).toHaveLength(3);
        expect(screen.queryByRole("button", { name: /Limpiar filtros/ })).not.toBeInTheDocument();
        expect(screen.getByLabelText("Buscar animales")).toHaveValue("");
    });

    it("muestra un mensaje de lista vacía cuando aún no hay animales", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U34",
            categoria: "Funcional",
            criterio: "Sin animales registrados se invita a registrar el primero.",
            prioridad: "Baja",
        });

        renderTable({ animales: [] });
        expect(screen.getByText("No hay animales registrados")).toBeInTheDocument();
    });

    it("el filtro y la etiqueta de albergue solo aparecen para el superadmin", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U35",
            categoria: "Funcional",
            criterio: "Con la lista de albergues (superadmin) se puede filtrar por albergue y cada tarjeta indica el suyo; sin ella, no.",
            prioridad: "Alta",
        });

        const user = userEvent.setup();

        const sin = renderTable({ refugios: [] });
        expect(screen.queryByLabelText("Albergue")).not.toBeInTheDocument();
        expect(screen.queryByText("Albergue Norte")).not.toBeInTheDocument();
        sin.unmount();

        renderTable({ refugios });
        const card = screen.getByRole("button", { name: "Ver detalle de Michi" });
        expect(within(card).getByText("Albergue Norte")).toBeInTheDocument();

        await user.selectOptions(screen.getByLabelText("Albergue"), "2");
        expect(cardNames()).toEqual(["Ver detalle de Michi"]);
    });
});

describe("vista de animales: detalle", () => {
    it("al hacer clic en una tarjeta muestra la ficha completa y Escape la cierra", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U36",
            categoria: "Funcional",
            criterio: "Al dar clic en un animal se abre su ficha con identificación, rescate, salud y albergue; con Escape se cierra.",
            prioridad: "Alta",
        });

        const user = userEvent.setup();
        renderTable();

        await user.click(screen.getByRole("button", { name: "Ver detalle de Firulais" }));

        const dialog = screen.getByRole("dialog", { name: "Firulais" });
        expect(within(dialog).getByText("Avenida Juárez")).toBeInTheDocument();
        expect(within(dialog).getByText("María López")).toBeInTheDocument();
        expect(within(dialog).getByText("555 123 4567")).toBeInTheDocument();
        expect(within(dialog).getByText("Abandonado")).toBeInTheDocument();
        expect(within(dialog).getByText(/15 de enero de 2026/)).toBeInTheDocument();
        expect(within(dialog).getByText("Responde a su nombre.")).toBeInTheDocument();
        expect(within(dialog).getByText("Albergue Centro")).toBeInTheDocument();
        expect(within(dialog).getByText("Patio")).toBeInTheDocument();
        for (const titulo of ["Identificación", "Rescate", "Salud y comportamiento", "Albergue"]) {
            expect(within(dialog).getByRole("heading", { name: titulo })).toBeInTheDocument();
        }

        await user.keyboard("{Escape}");
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("los datos que faltan se muestran con un guion y no rompen la ficha", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U37",
            categoria: "Funcional",
            criterio: "Un animal sin datos opcionales (raza, color, microchip, rescate...) igual se muestra, con '—' en lo que falta.",
            prioridad: "Media",
        });

        const user = userEvent.setup();
        renderTable();

        await user.click(screen.getByRole("button", { name: "Ver detalle de Perro sin nombre" }));
        const dialog = screen.getByRole("dialog", { name: "Perro sin nombre" });
        expect(within(dialog).getAllByText("—").length).toBeGreaterThan(5);
    });

    it("sin permisos de edición o baja no se muestran las acciones", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U38",
            categoria: "Seguridad",
            criterio: "Un usuario sin permiso de editar o eliminar no ve los botones 'Marcar disponible' ni 'Dar de baja'.",
            prioridad: "Alta",
        });

        const user = userEvent.setup();
        renderTable({ canEdit: false, canDelete: false });

        await user.click(screen.getByRole("button", { name: "Ver detalle de Firulais" }));
        expect(screen.queryByRole("button", { name: /Marcar/ })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Dar de baja" })).not.toBeInTheDocument();
    });

    it("cambiar la disponibilidad llama a la acción y muestra el error si falla", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U39",
            categoria: "Funcional",
            criterio: "'Marcar como no disponible' envía el cambio al servidor y, si este responde con error, se le muestra al usuario.",
            prioridad: "Alta",
        });

        vi.mocked(updateAnimalAction).mockResolvedValueOnce({
            success: false,
            error: "No tienes permiso para editar animales",
        });

        const user = userEvent.setup();
        renderTable();

        await user.click(screen.getByRole("button", { name: "Ver detalle de Firulais" }));
        await user.click(screen.getByRole("button", { name: "Marcar como no disponible" }));

        expect(updateAnimalAction).toHaveBeenCalledWith({ id: 1, disponibleAdopcion: false });
        expect(await screen.findByRole("alert")).toHaveTextContent("No tienes permiso para editar animales");
    });

    it("dar de baja pide confirmación, llama a la acción y cierra la ficha", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U40",
            categoria: "Funcional",
            criterio: "'Dar de baja' pide confirmar y, si el servidor lo acepta, la ficha se cierra.",
            prioridad: "Alta",
        });

        vi.mocked(deleteAnimalAction).mockResolvedValueOnce({ success: true, data: undefined });

        const user = userEvent.setup();
        renderTable();

        await user.click(screen.getByRole("button", { name: "Ver detalle de Michi" }));
        await user.click(screen.getByRole("button", { name: "Dar de baja" }));

        expect(confirm).toHaveBeenCalled();
        expect(deleteAnimalAction).toHaveBeenCalledWith(2);
        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    });

    it("si se cancela la confirmación no se da de baja al animal", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U41",
            categoria: "Funcional",
            criterio: "Cancelar el aviso de confirmación no elimina nada.",
            prioridad: "Media",
        });

        vi.stubGlobal("confirm", vi.fn(() => false));

        const user = userEvent.setup();
        renderTable();

        await user.click(screen.getByRole("button", { name: "Ver detalle de Michi" }));
        await user.click(screen.getByRole("button", { name: "Dar de baja" }));

        expect(deleteAnimalAction).not.toHaveBeenCalled();
        expect(screen.getByRole("dialog", { name: "Michi" })).toBeInTheDocument();
    });
});
