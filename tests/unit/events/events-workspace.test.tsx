import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { qaAnnotate } from "../../utils/qa";
import { EventsWorkspace } from "@/modules/events/components/EventsWorkspace";
import type { CalendarEvent } from "@/modules/events/types";

const ev = (over: Partial<CalendarEvent>): CalendarEvent => ({
    id: "1", title: "Evento", description: null, location: null, category: "otro",
    allDay: true, start: "2026-11-10", end: "2026-11-11", link: null, ...over,
});

const events = [
    ev({ id: "b", title: "Bazar con causa", category: "bazar", start: "2026-11-20", end: "2026-11-21", location: "Plaza Central" }),
    ev({ id: "v", title: "Jornada de vacunación", category: "vacunacion", start: "2026-11-12", end: "2026-11-13" }),
    ev({ id: "p", title: "Evento pasado", category: "colecta", start: "2026-11-01", end: "2026-11-02" }),
];

beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 10, 9, 0));
});
afterEach(() => vi.useRealTimers());

describe("EventsWorkspace", () => {
    it("muestra el calendario del mes y los próximos eventos junto a él, en orden", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U220", categoria: "Funcional", prioridad: "Alta",
            criterio: "Se ve el mes actual y, en la columna lateral y arriba, los próximos eventos sin los que ya pasaron.",
        });

        render(<EventsWorkspace events={events} />);

        expect(await screen.findByRole("heading", { name: /^noviembre de 2026$/i })).toBeTruthy();

        const upcoming = screen.getByRole("region", { name: /próximos eventos/i });
        const titles = within(upcoming).getAllByRole("button").map((b) => b.textContent ?? "");
        expect(titles).toHaveLength(2);
        expect(titles[0]).toContain("Jornada de vacunación");
        expect(titles[1]).toContain("Bazar con causa");
        expect(within(upcoming).queryByText("Evento pasado")).toBeNull();
    });

    it("al elegir un día muestra el detalle de sus eventos", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U221", categoria: "Funcional", prioridad: "Media",
            criterio: "Tocar un día lista sus eventos con lugar; un día sin eventos lo dice.",
        });

        const user = userEvent.setup();
        render(<EventsWorkspace events={events} />);
        await screen.findByRole("heading", { name: /^noviembre de 2026$/i });

        await user.click(screen.getByRole("button", { name: /^20 de noviembre/ }));
        expect(screen.getAllByText("Plaza Central").length).toBe(2); // próximos + detalle del día

        await user.click(screen.getByRole("button", { name: /^25 de noviembre/ }));
        expect(screen.getByText(/sin eventos este día/i)).toBeTruthy();
    });

    it("el filtro por tipo oculta esos eventos del calendario y de próximos", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U222", categoria: "Funcional", prioridad: "Media",
            criterio: "Desmarcar un tipo de evento lo quita de ambas vistas.",
        });

        const user = userEvent.setup();
        render(<EventsWorkspace events={events} />);
        await screen.findByRole("heading", { name: /^noviembre de 2026$/i });

        await user.click(screen.getByRole("checkbox", { name: /bazar con causa/i }));

        const upcoming = screen.getByRole("region", { name: /próximos eventos/i });
        expect(within(upcoming).queryByText("Bazar con causa")).toBeNull();
        expect(within(upcoming).getByText("Jornada de vacunación")).toBeTruthy();
    });

    it("navega entre meses y vuelve a hoy", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U223", categoria: "Funcional", prioridad: "Baja",
            criterio: "Los botones de mes anterior/siguiente y 'Hoy' mueven el calendario.",
        });

        const user = userEvent.setup();
        render(<EventsWorkspace events={events} />);
        await screen.findByRole("heading", { name: /^noviembre de 2026$/i });

        await user.click(screen.getByRole("button", { name: /mes siguiente/i }));
        expect(screen.getByRole("heading", { name: /^diciembre de 2026$/i })).toBeTruthy();

        await user.click(screen.getByRole("button", { name: /mes anterior/i }));
        await user.click(screen.getByRole("button", { name: /mes anterior/i }));
        expect(screen.getByRole("heading", { name: /^octubre de 2026$/i })).toBeTruthy();

        await user.click(screen.getByRole("button", { name: "Hoy" }));
        expect(screen.getByRole("heading", { name: /^noviembre de 2026$/i })).toBeTruthy();
    });
});
