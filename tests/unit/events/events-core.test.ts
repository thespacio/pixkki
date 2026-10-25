import { describe, it, expect, vi } from "vitest";
import { qaAnnotate } from "../../utils/qa";
import { classifyEvent } from "@/modules/events/categories";
import { fetchCalendarEvents, htmlToText, mapGoogleEvent } from "@/modules/events/google-calendar";
import { buildMonthGrid, dayKey, eventDayKeys, groupEventsByDay, upcomingEvents } from "@/modules/events/dates";
import { CalendarError, type CalendarEvent } from "@/modules/events/types";

const ev = (over: Partial<CalendarEvent>): CalendarEvent => ({
    id: "1", title: "Evento", description: null, location: null, category: "otro",
    allDay: true, start: "2026-11-10", end: "2026-11-11", link: null, ...over,
});

const range = { from: new Date(2026, 9, 1), to: new Date(2027, 10, 1) };
const response = (status: number, body: unknown = {}) =>
    ({ ok: status >= 200 && status < 300, status, json: async () => body }) as Response;

describe("categorías", () => {
    it("clasifica los 8 tipos de evento, con o sin acentos y mayúsculas", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U200", categoria: "Unitaria", prioridad: "Alta",
            criterio: "Cada tipo de evento del albergue se reconoce por su título.",
        });

        expect(classifyEvent("Campaña de ADOPCIÓN en el parque")).toBe("adopcion");
        expect(classifyEvent("Reencuentro de mascotas adoptadas")).toBe("reencuentro");
        expect(classifyEvent("Bazar con causa")).toBe("bazar");
        expect(classifyEvent("Caminata con causa")).toBe("caminata");
        expect(classifyEvent("Carrera 5K")).toBe("caminata");
        expect(classifyEvent("Jornada de vacunación")).toBe("vacunacion");
        expect(classifyEvent("Esterilización gratuita")).toBe("vacunacion");
        expect(classifyEvent("Taller de entrenamiento canino")).toBe("taller");
        expect(classifyEvent("Día de voluntariado")).toBe("voluntariado");
        expect(classifyEvent("Colecta de donativos")).toBe("colecta");
    });

    it("usa la descripción si el título no alcanza y cae en 'otro' si nada coincide", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U201", categoria: "Unitaria", prioridad: "Media",
            criterio: "El título manda; la descripción es respaldo; sin pistas queda como 'otro'.",
        });

        expect(classifyEvent("Sábado especial", "Habrá un bazar de ropa")).toBe("bazar");
        expect(classifyEvent("Bazar", "Colecta de croquetas")).toBe("bazar");
        expect(classifyEvent("Reunión de junta", "Revisión de cuentas")).toBe("otro");
    });
});

describe("cliente de Google Calendar", () => {
    it("sin clave o sin calendario no sale a internet", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U202", categoria: "Seguridad", prioridad: "Alta",
            criterio: "Si falta la configuración se avisa sin hacer ninguna petición.",
        });

        const fetchMock = vi.fn();
        await expect(fetchCalendarEvents({ apiKey: "", calendarId: "x" }, range, fetchMock)).rejects.toMatchObject({ kind: "not_configured" });
        await expect(fetchCalendarEvents({ apiKey: "k" }, range, fetchMock)).rejects.toBeInstanceOf(CalendarError);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("manda la clave en un header (no en la URL) y pide eventos expandidos", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U203", categoria: "Seguridad", prioridad: "Alta",
            criterio: "La clave no aparece en la URL; los eventos recurrentes se expanden y se ordenan por inicio.",
        });

        const fetchMock = vi.fn().mockResolvedValue(response(200, { items: [] }));
        await fetchCalendarEvents({ apiKey: "SECRETA", calendarId: "cal@group.calendar.google.com" }, range, fetchMock);

        const [url, init] = fetchMock.mock.calls[0];
        expect(String(url)).not.toContain("SECRETA");
        expect(String(url)).toContain(encodeURIComponent("cal@group.calendar.google.com"));
        expect(String(url)).toContain("singleEvents=true");
        expect(String(url)).toContain("orderBy=startTime");
        expect(init.headers["x-goog-api-key"]).toBe("SECRETA");
    });

    it("traduce cada fallo de Google a un mensaje útil", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U204", categoria: "Funcional", prioridad: "Alta",
            criterio: "Clave inválida, calendario privado/API apagada, calendario inexistente y caída de Google se distinguen.",
        });

        const kindFor = async (status: number) => {
            const fetchMock = vi.fn().mockResolvedValue(response(status));
            return fetchCalendarEvents({ apiKey: "k", calendarId: "c" }, range, fetchMock).catch((e) => e.kind);
        };
        expect(await kindFor(400)).toBe("invalid_key");
        expect(await kindFor(403)).toBe("forbidden");
        expect(await kindFor(404)).toBe("not_found");
        expect(await kindFor(500)).toBe("unavailable");

        const network = vi.fn().mockRejectedValue(new Error("boom"));
        await expect(fetchCalendarEvents({ apiKey: "k", calendarId: "c" }, range, network)).rejects.toMatchObject({ kind: "unavailable" });
    });

    it("convierte eventos de día completo y con hora, y descarta cancelados o sin fecha", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U205", categoria: "Funcional", prioridad: "Alta",
            criterio: "Se leen ambos formatos de fecha de Google; los eventos cancelados no se muestran.",
        });

        const items = [
            { id: "a", summary: "Bazar con causa", start: { date: "2026-11-10" }, end: { date: "2026-11-11" } },
            { id: "b", summary: "Taller de cuidado", start: { dateTime: "2026-11-12T10:00:00-06:00" }, end: { dateTime: "2026-11-12T12:00:00-06:00" }, location: " Parque ", htmlLink: "https://www.google.com/calendar/event?eid=1" },
            { id: "c", summary: "Cancelado", status: "cancelled", start: { date: "2026-11-13" }, end: { date: "2026-11-14" } },
            { id: "d", summary: "Sin fecha" },
            { summary: "Sin id", start: { date: "2026-11-13" } },
        ];
        const events = await fetchCalendarEvents({ apiKey: "k", calendarId: "c" }, range, vi.fn().mockResolvedValue(response(200, { items })));

        expect(events.map((e) => e.id)).toEqual(["a", "b"]);
        expect(events[0]).toMatchObject({ allDay: true, category: "bazar" });
        expect(events[1]).toMatchObject({ allDay: false, category: "taller", location: "Parque" });
    });

    it("limpia HTML de la descripción y no enlaza URLs que no sean https", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U206", categoria: "Seguridad", prioridad: "Alta",
            criterio: "La descripción se muestra como texto plano y un enlace javascript: o http: se ignora.",
        });

        expect(htmlToText("Hola<br>mundo <b>fuerte</b> &amp; <script>x</script>")).toBe("Hola\nmundo fuerte & x");

        const mapped = mapGoogleEvent({
            id: "x", summary: "E", start: { date: "2026-11-10" }, end: { date: "2026-11-11" },
            htmlLink: "javascript:alert(1)", description: "<p>Texto</p>",
        });
        expect(mapped?.link).toBeNull();
        expect(mapped?.description).toBe("Texto");
        expect(mapGoogleEvent({ id: "y", start: { date: "2026-11-10" }, end: { date: "2026-11-11" } })?.title).toBe("Evento sin título");
    });
});

describe("fechas del calendario", () => {
    it("un evento de varios días aparece en cada día (fin exclusivo)", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U207", categoria: "Unitaria", prioridad: "Alta",
            criterio: "Del 10 al 13 (fin exclusivo 13 en Google) ocupa los días 10, 11 y 12.",
        });

        expect(eventDayKeys(ev({ start: "2026-11-10", end: "2026-11-13" }))).toEqual(["2026-11-10", "2026-11-11", "2026-11-12"]);
        expect(eventDayKeys(ev({ start: "2026-11-10", end: "2026-11-11" }))).toEqual(["2026-11-10"]);

        const grouped = groupEventsByDay([ev({ id: "a", start: "2026-11-10", end: "2026-11-12" }), ev({ id: "b", start: "2026-11-11", end: "2026-11-12" })]);
        expect(grouped.get("2026-11-11")?.map((e) => e.id)).toEqual(["a", "b"]);
    });

    it("un evento con hora que termina a medianoche no invade el día siguiente", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U208", categoria: "Unitaria", prioridad: "Media",
            criterio: "Solo cuenta los días realmente ocupados por un evento con hora.",
        });

        const start = new Date(2026, 10, 10, 20, 0).toISOString();
        const midnight = new Date(2026, 10, 11, 0, 0).toISOString();
        const nextDay = new Date(2026, 10, 11, 1, 0).toISOString();

        expect(eventDayKeys(ev({ allDay: false, start, end: midnight }))).toEqual(["2026-11-10"]);
        expect(eventDayKeys(ev({ allDay: false, start, end: nextDay }))).toEqual(["2026-11-10", "2026-11-11"]);
        expect(eventDayKeys(ev({ allDay: false, start, end: start }))).toEqual(["2026-11-10"]);
    });

    it("el mes se dibuja en semanas completas de lunes a domingo", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U209", categoria: "Unitaria", prioridad: "Media",
            criterio: "Noviembre 2026 empieza en domingo: la primera semana arranca el lunes 26 de octubre.",
        });

        const weeks = buildMonthGrid(2026, 10);
        expect(weeks.every((w) => w.length === 7)).toBe(true);
        expect(weeks.every((w) => w[0].getDay() === 1)).toBe(true);
        expect(dayKey(weeks[0][0])).toBe("2026-10-26");
        expect(dayKey(weeks[0][6])).toBe("2026-11-01");
        expect(weeks.flat().some((d) => dayKey(d) === "2026-11-30")).toBe(true);
    });

    it("próximos eventos: omite los pasados, ordena y respeta el límite", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U210", categoria: "Funcional", prioridad: "Alta",
            criterio: "El componente de próximos eventos muestra primero los más cercanos e incluye el que está en curso.",
        });

        const now = new Date(2026, 10, 10, 12, 0);
        const events = [
            ev({ id: "lejos", start: "2026-12-01", end: "2026-12-02" }),
            ev({ id: "pasado", start: "2026-11-01", end: "2026-11-02" }),
            ev({ id: "hoy", start: "2026-11-10", end: "2026-11-11" }),
            ev({ id: "pronto", start: "2026-11-15", end: "2026-11-16" }),
        ];

        expect(upcomingEvents(events, now, 10).map((e) => e.id)).toEqual(["hoy", "pronto", "lejos"]);
        expect(upcomingEvents(events, now, 2).map((e) => e.id)).toEqual(["hoy", "pronto"]);
    });
});
