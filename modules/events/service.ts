import { fetchCalendarEvents } from "./google-calendar";
import { CalendarError, type CalendarEvent } from "./types";

export type EventsResult =
    | { ok: true; events: CalendarEvent[] }
    | { ok: false; kind: CalendarError["kind"]; message: string };

/**
 * Eventos del calendario configurado en .env: desde el mes pasado hasta 12 meses adelante
 * (el calendario del navegador se mueve por meses sin volver a consultar a Google).
 * Nunca lanza: devuelve el motivo para que la página explique qué hacer.
 */
export async function getCalendarEvents(now: Date = new Date()): Promise<EventsResult> {
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 13, 1);

    try {
        const events = await fetchCalendarEvents(
            { apiKey: process.env.GOOGLE_CALENDAR_API_KEY, calendarId: process.env.GOOGLE_CALENDAR_ID },
            { from, to },
        );
        return { ok: true, events };
    } catch (error) {
        if (error instanceof CalendarError) return { ok: false, kind: error.kind, message: error.message };
        return { ok: false, kind: "unavailable", message: "No se pudieron cargar los eventos." };
    }
}
