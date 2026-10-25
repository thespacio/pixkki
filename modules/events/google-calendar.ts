// Cliente mínimo de Google Calendar API v3 (solo lectura). Solo servidor: la clave nunca llega al navegador.
import { classifyEvent } from "./categories";
import { CalendarError, type CalendarEvent } from "./types";

const API_BASE = "https://www.googleapis.com/calendar/v3/calendars";
const TIMEOUT_MS = 10_000;

type GoogleEventDate = { date?: string; dateTime?: string };
type GoogleEvent = {
    id?: string;
    status?: string;
    summary?: string;
    description?: string;
    location?: string;
    htmlLink?: string;
    start?: GoogleEventDate;
    end?: GoogleEventDate;
};

export type CalendarConfig = {
    apiKey: string;
    calendarId: string;
    /** Segundos que Next puede reutilizar la respuesta (el calendario no cambia cada segundo). */
    revalidateSeconds?: number;
};

/** La descripción de Google puede traer HTML: se deja como texto plano. */
export function htmlToText(value: string): string {
    return value
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/(p|div|li)>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

export function mapGoogleEvent(item: GoogleEvent): CalendarEvent | null {
    if (item.status === "cancelled" || !item.id) return null;

    const allDay = Boolean(item.start?.date);
    const start = item.start?.date ?? item.start?.dateTime;
    const end = item.end?.date ?? item.end?.dateTime ?? start;
    if (!start || !end) return null;

    const title = item.summary?.trim() || "Evento sin título";
    const description = item.description ? htmlToText(item.description) || null : null;
    // Solo se enlazan URLs https (el enlace lo arma Google, pero no se confía a ciegas).
    const link = item.htmlLink?.startsWith("https://") ? item.htmlLink : null;

    return {
        id: item.id,
        title,
        description,
        location: item.location?.trim() || null,
        category: classifyEvent(title, description),
        allDay,
        start,
        end,
        link,
    };
}

function errorForStatus(status: number): CalendarError {
    switch (status) {
        case 400:
            return new CalendarError("invalid_key", "La clave de Google Calendar no es válida. Revisa GOOGLE_CALENDAR_API_KEY.");
        case 403:
            return new CalendarError(
                "forbidden",
                "Google rechazó la consulta: activa la Google Calendar API en tu proyecto, " +
                    "revisa las restricciones de la clave y que el calendario sea público.",
            );
        case 404:
            return new CalendarError("not_found", "No se encontró el calendario. Revisa GOOGLE_CALENDAR_ID y que sea público.");
        default:
            return new CalendarError("unavailable", "No se pudo consultar Google Calendar. Intenta de nuevo en unos minutos.");
    }
}

export async function fetchCalendarEvents(
    config: Partial<CalendarConfig>,
    range: { from: Date; to: Date },
    fetchImpl: typeof fetch = fetch,
): Promise<CalendarEvent[]> {
    const apiKey = config.apiKey?.trim();
    const calendarId = config.calendarId?.trim();
    if (!apiKey || !calendarId) {
        throw new CalendarError("not_configured", "Google Calendar no está configurado.");
    }

    const params = new URLSearchParams({
        timeMin: range.from.toISOString(),
        timeMax: range.to.toISOString(),
        singleEvents: "true", // expande los eventos recurrentes en ocurrencias
        orderBy: "startTime",
        maxResults: "500",
        fields: "items(id,status,summary,description,location,htmlLink,start,end)",
    });

    let response: Response;
    try {
        response = await fetchImpl(`${API_BASE}/${encodeURIComponent(calendarId)}/events?${params}`, {
            // La clave va en un header y no en la URL, para que no quede en registros.
            headers: { "x-goog-api-key": apiKey },
            signal: AbortSignal.timeout(TIMEOUT_MS),
            next: { revalidate: config.revalidateSeconds ?? 300 },
        } as RequestInit);
    } catch {
        throw new CalendarError("unavailable", "No se pudo conectar con Google Calendar. Intenta de nuevo en unos minutos.");
    }

    if (!response.ok) throw errorForStatus(response.status);

    let body: { items?: GoogleEvent[] };
    try {
        body = await response.json();
    } catch {
        throw new CalendarError("unavailable", "Google Calendar respondió algo inesperado.");
    }

    return (body.items ?? []).flatMap((item) => {
        const event = mapGoogleEvent(item);
        return event ? [event] : [];
    });
}
