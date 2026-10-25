import type { CalendarEvent } from "./types";

/** "YYYY-MM-DD" en hora local. */
export function dayKey(date: Date): string {
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${m}-${d}`;
}

function parseDayKey(key: string): Date {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
}

/** Inicio y fin del evento como fechas locales. En día completo `end` es exclusivo. */
function bounds(event: CalendarEvent): { start: Date; end: Date } {
    if (event.allDay) {
        return { start: parseDayKey(event.start), end: parseDayKey(event.end) };
    }
    return { start: new Date(event.start), end: new Date(event.end) };
}

/** Días (locales) que toca el evento; uno de varios días aparece en cada uno. */
export function eventDayKeys(event: CalendarEvent): string[] {
    const { start, end } = bounds(event);
    // Fin exclusivo: un evento que termina a medianoche exacta no ocupa el día siguiente.
    const limit = end.getTime() > start.getTime() ? end.getTime() : start.getTime() + 1;

    const keys: string[] = [];
    const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    while (cursor.getTime() < limit && keys.length < 62) {
        keys.push(dayKey(cursor));
        cursor.setDate(cursor.getDate() + 1);
    }
    return keys;
}

export function groupEventsByDay(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
        for (const key of eventDayKeys(event)) {
            map.set(key, [...(map.get(key) ?? []), event]);
        }
    }
    return map;
}

/** Semanas (lunes a domingo) que cubren el mes; siempre completas, con días de meses vecinos. */
export function buildMonthGrid(year: number, month: number): Date[][] {
    const offset = (new Date(year, month, 1).getDay() + 6) % 7; // lunes = 0
    const totalDays = Math.ceil((offset + new Date(year, month + 1, 0).getDate()) / 7) * 7;

    const weeks: Date[][] = [];
    for (let i = 0; i < totalDays; i += 7) {
        weeks.push(Array.from({ length: 7 }, (_, d) => new Date(year, month, 1 - offset + i + d)));
    }
    return weeks;
}

/** Próximos eventos: los que aún no terminan, del más cercano al más lejano. */
export function upcomingEvents(events: CalendarEvent[], now: Date, limit: number): CalendarEvent[] {
    return events
        .filter((event) => bounds(event).end.getTime() > now.getTime())
        .sort((a, b) => bounds(a).start.getTime() - bounds(b).start.getTime())
        .slice(0, limit);
}

export function isHappeningNow(event: CalendarEvent, now: Date): boolean {
    const { start, end } = bounds(event);
    return start.getTime() <= now.getTime() && now.getTime() < end.getTime();
}

export function formatEventWhen(event: CalendarEvent): string {
    const { start, end } = bounds(event);
    const date = new Intl.DateTimeFormat("es-MX", { weekday: "short", day: "numeric", month: "short" });
    const time = new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit" });

    if (event.allDay) {
        const lastDay = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 1);
        return lastDay.getTime() > start.getTime()
            ? `${date.format(start)} – ${date.format(lastDay)}`
            : `${date.format(start)} · Todo el día`;
    }
    return dayKey(start) === dayKey(end)
        ? `${date.format(start)} · ${time.format(start)} – ${time.format(end)}`
        : `${date.format(start)} ${time.format(start)} – ${date.format(end)} ${time.format(end)}`;
}
