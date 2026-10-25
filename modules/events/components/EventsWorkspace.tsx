"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, ExternalLink, MapPin } from "lucide-react";
import { CATEGORY_INFO } from "../categories";
import { buildMonthGrid, dayKey, formatEventWhen, groupEventsByDay } from "../dates";
import { EVENT_CATEGORIES, type CalendarEvent, type EventCategory } from "../types";
import { UpcomingEvents } from "./UpcomingEvents";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MAX_CHIPS_PER_DAY = 2;

export function EventsWorkspace({ events }: { events: CalendarEvent[] }) {
    // La fecha de "hoy" se toma en el navegador (zona horaria de quien mira); antes de montar no se
    // dibuja el calendario para no desajustar el HTML del servidor con el del cliente.
    const [now, setNow] = useState<Date | null>(null);
    const [cursor, setCursor] = useState({ year: 0, month: 0 });
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [hidden, setHidden] = useState<Set<EventCategory>>(new Set());

    useEffect(() => {
        const today = new Date();
        setNow(today);
        setCursor({ year: today.getFullYear(), month: today.getMonth() });
        setSelectedDay(dayKey(today));
    }, []);

    const visible = useMemo(() => events.filter((e) => !hidden.has(e.category)), [events, hidden]);
    const byDay = useMemo(() => groupEventsByDay(visible), [visible]);
    const counts = useMemo(() => {
        const result = new Map<EventCategory, number>();
        for (const e of events) result.set(e.category, (result.get(e.category) ?? 0) + 1);
        return result;
    }, [events]);

    if (!now) {
        return <div className="h-[32rem] animate-pulse rounded-xl border bg-muted/40" aria-busy="true" />;
    }

    const weeks = buildMonthGrid(cursor.year, cursor.month);
    const monthLabel = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" }).format(
        new Date(cursor.year, cursor.month, 1),
    );
    const todayKey = dayKey(now);
    const selectedEvents = selectedDay ? (byDay.get(selectedDay) ?? []) : [];

    const goToMonth = (delta: number) => {
        const next = new Date(cursor.year, cursor.month + delta, 1);
        setCursor({ year: next.getFullYear(), month: next.getMonth() });
    };
    const goToToday = () => {
        setCursor({ year: now.getFullYear(), month: now.getMonth() });
        setSelectedDay(todayKey);
    };
    // Al elegir un evento de "Próximos" el calendario salta a su mes y selecciona su día.
    const selectEvent = (event: CalendarEvent) => {
        const start = event.allDay ? new Date(`${event.start}T00:00:00`) : new Date(event.start);
        const today = start.getTime() < now.getTime() ? now : start;
        setCursor({ year: today.getFullYear(), month: today.getMonth() });
        setSelectedDay(dayKey(today));
    };
    const toggleCategory = (category: EventCategory) =>
        setHidden((current) => {
            const next = new Set(current);
            if (next.has(category)) next.delete(category);
            else next.add(category);
            return next;
        });

    return (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            {/* Calendario */}
            <div className="space-y-4 lg:order-1">
                <section aria-label="Calendario de eventos" className="rounded-xl border bg-card p-4">
                    <div className="mb-3 flex items-center gap-2">
                        <h2 className="text-lg font-semibold capitalize text-foreground">{monthLabel}</h2>
                        <div className="ml-auto flex items-center gap-1">
                            <button
                                type="button"
                                onClick={goToToday}
                                className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
                            >
                                Hoy
                            </button>
                            <button
                                type="button"
                                onClick={() => goToMonth(-1)}
                                aria-label="Mes anterior"
                                className="rounded-md border p-1.5 hover:bg-muted"
                            >
                                <ChevronLeft size={18} aria-hidden="true" />
                            </button>
                            <button
                                type="button"
                                onClick={() => goToMonth(1)}
                                aria-label="Mes siguiente"
                                className="rounded-md border p-1.5 hover:bg-muted"
                            >
                                <ChevronRight size={18} aria-hidden="true" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 border-l border-t text-xs">
                        {WEEKDAYS.map((day) => (
                            <div key={day} className="border-b border-r bg-muted/40 py-1.5 text-center font-medium text-muted-foreground">
                                {day}
                            </div>
                        ))}
                        {weeks.flat().map((date) => {
                            const key = dayKey(date);
                            const dayEvents = byDay.get(key) ?? [];
                            const inMonth = date.getMonth() === cursor.month;
                            const isSelected = key === selectedDay;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setSelectedDay(key)}
                                    aria-pressed={isSelected}
                                    aria-label={`${date.getDate()} de ${new Intl.DateTimeFormat("es-MX", { month: "long" }).format(date)}, ${dayEvents.length} eventos`}
                                    className={`flex min-h-20 flex-col gap-0.5 border-b border-r p-1 text-left align-top transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${
                                        inMonth ? "" : "bg-muted/20 text-muted-foreground"
                                    } ${isSelected ? "bg-primary/5 ring-2 ring-inset ring-primary" : ""}`}
                                >
                                    <span
                                        className={`flex size-6 items-center justify-center rounded-full text-xs ${
                                            key === todayKey ? "bg-primary font-semibold text-primary-foreground" : ""
                                        }`}
                                    >
                                        {date.getDate()}
                                    </span>
                                    {dayEvents.slice(0, MAX_CHIPS_PER_DAY).map((event) => (
                                        <span
                                            key={event.id}
                                            className={`truncate rounded px-1 py-0.5 text-[11px] leading-tight ${CATEGORY_INFO[event.category].chip}`}
                                        >
                                            {event.title}
                                        </span>
                                    ))}
                                    {dayEvents.length > MAX_CHIPS_PER_DAY && (
                                        <span className="px-1 text-[11px] text-muted-foreground">
                                            +{dayEvents.length - MAX_CHIPS_PER_DAY} más
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Detalle del día */}
                <section aria-live="polite" className="rounded-xl border bg-card p-4">
                    <h3 className="text-sm font-semibold text-foreground">
                        {selectedDay
                            ? new Intl.DateTimeFormat("es-MX", { dateStyle: "full" }).format(
                                  new Date(`${selectedDay}T00:00:00`),
                              )
                            : "Selecciona un día"}
                    </h3>
                    {selectedEvents.length === 0 ? (
                        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarDays size={16} aria-hidden="true" />
                            Sin eventos este día.
                        </p>
                    ) : (
                        <ul className="mt-3 space-y-3">
                            {selectedEvents.map((event) => {
                                const info = CATEGORY_INFO[event.category];
                                return (
                                    <li key={event.id} className="rounded-lg border p-3">
                                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${info.chip}`}>
                                            {info.label}
                                        </span>
                                        <p className="mt-1.5 font-medium text-foreground">{event.title}</p>
                                        <p className="text-sm capitalize text-muted-foreground">{formatEventWhen(event)}</p>
                                        {event.location && (
                                            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                                                <MapPin size={14} aria-hidden="true" />
                                                {event.location}
                                            </p>
                                        )}
                                        {event.description && (
                                            <p className="mt-2 whitespace-pre-line text-sm text-foreground/80">{event.description}</p>
                                        )}
                                        {event.link && (
                                            <a
                                                href={event.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                            >
                                                Ver en Google Calendar
                                                <ExternalLink size={13} aria-hidden="true" />
                                            </a>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>
            </div>

            {/* Columna lateral: próximos eventos arriba, categorías debajo */}
            <aside className="space-y-4 lg:order-2">
                <UpcomingEvents events={visible} now={now} onSelect={selectEvent} />

                <section aria-labelledby="categories-title" className="rounded-xl border bg-card p-4">
                    <h2 id="categories-title" className="text-sm font-semibold text-foreground">
                        Tipos de evento
                    </h2>
                    <ul className="mt-3 space-y-1">
                        {EVENT_CATEGORIES.filter((c) => c !== "otro" || counts.has("otro")).map((category) => {
                            const info = CATEGORY_INFO[category];
                            return (
                                <li key={category}>
                                    <label className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm hover:bg-muted/50">
                                        <input
                                            type="checkbox"
                                            checked={!hidden.has(category)}
                                            onChange={() => toggleCategory(category)}
                                            className="size-4"
                                        />
                                        <span className={`size-2.5 rounded-full ${info.dot}`} aria-hidden="true" />
                                        <span className="flex-1">{info.label}</span>
                                        <span className="text-xs text-muted-foreground">{counts.get(category) ?? 0}</span>
                                    </label>
                                </li>
                            );
                        })}
                    </ul>
                </section>
            </aside>
        </div>
    );
}
