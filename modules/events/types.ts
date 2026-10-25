export const EVENT_CATEGORIES = [
    "adopcion",
    "reencuentro",
    "bazar",
    "caminata",
    "vacunacion",
    "taller",
    "voluntariado",
    "colecta",
    "otro",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

/**
 * Evento ya normalizado. Las fechas viajan como texto para poder pasar del servidor al cliente:
 * - día completo: "YYYY-MM-DD" (`end` es exclusivo, como en Google Calendar);
 * - con hora: ISO 8601 con zona horaria.
 */
export type CalendarEvent = {
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    category: EventCategory;
    allDay: boolean;
    start: string;
    end: string;
    link: string | null;
};

export type CalendarErrorKind =
    | "not_configured"
    | "invalid_key"
    | "forbidden"
    | "not_found"
    | "unavailable";

export class CalendarError extends Error {
    constructor(
        readonly kind: CalendarErrorKind,
        message: string,
    ) {
        super(message);
        this.name = "CalendarError";
    }
}
