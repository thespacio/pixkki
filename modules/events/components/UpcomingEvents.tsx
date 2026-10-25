"use client";

import { CalendarClock, MapPin } from "lucide-react";
import { CATEGORY_INFO } from "../categories";
import { formatEventWhen, isHappeningNow, upcomingEvents } from "../dates";
import type { CalendarEvent } from "../types";

type Props = {
    events: CalendarEvent[];
    now: Date;
    limit?: number;
    onSelect: (event: CalendarEvent) => void;
};

export function UpcomingEvents({ events, now, limit = 5, onSelect }: Props) {
    const upcoming = upcomingEvents(events, now, limit);

    return (
        <section aria-labelledby="upcoming-title" className="rounded-xl border bg-card p-4">
            <h2 id="upcoming-title" className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <CalendarClock size={16} aria-hidden="true" />
                Próximos eventos
            </h2>

            {upcoming.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">No hay eventos próximos con los filtros actuales.</p>
            ) : (
                <ul className="mt-3 space-y-2">
                    {upcoming.map((event) => {
                        const info = CATEGORY_INFO[event.category];
                        return (
                            <li key={event.id}>
                                <button
                                    type="button"
                                    onClick={() => onSelect(event)}
                                    className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className={`size-2 rounded-full ${info.dot}`} aria-hidden="true" />
                                        {info.label}
                                        {isHappeningNow(event, now) && (
                                            <span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-800">
                                                En curso
                                            </span>
                                        )}
                                    </span>
                                    <span className="mt-1 block text-sm font-medium text-foreground">{event.title}</span>
                                    <span className="mt-0.5 block text-xs capitalize text-muted-foreground">
                                        {formatEventWhen(event)}
                                    </span>
                                    {event.location && (
                                        <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                            <MapPin size={12} aria-hidden="true" />
                                            <span className="truncate">{event.location}</span>
                                        </span>
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
