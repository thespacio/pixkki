// app/(protected)/(dashboard)/events/page.tsx

import { CalendarOff, ShieldAlert } from "lucide-react";
import { getCurrentUser } from "@/modules/auth";
import { EventsWorkspace } from "@/modules/events/components/EventsWorkspace";
import { getCalendarEvents } from "@/modules/events/service";

export default async function EventsPage() {
  const user = await getCurrentUser();

  if (!user.permissions.includes("events.view")) {
    return (
      <div className="p-8 max-w-6xl mx-auto text-center py-24 text-muted-foreground">
        <ShieldAlert size={40} className="mx-auto mb-3 opacity-40" aria-hidden="true" />
        <p className="font-medium text-foreground">No tienes permiso para ver los eventos</p>
        <p className="text-sm mt-1">Pide acceso a un administrador si lo necesitas.</p>
      </div>
    );
  }

  const result = await getCalendarEvents();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Eventos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Campañas, bazares, colectas y más actividades programadas del albergue.
        </p>
      </header>

      {result.ok ? (
        <EventsWorkspace events={result.events} />
      ) : (
        <div className="max-w-2xl mx-auto py-16 text-center">
          <CalendarOff size={40} className="mx-auto mb-3 text-muted-foreground opacity-50" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-foreground">
            {result.kind === "not_configured" ? "Falta conectar Google Calendar" : "No se pudo cargar el calendario"}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            {result.kind === "not_configured" ? (
              <>
                Agrega <code>GOOGLE_CALENDAR_API_KEY</code> y <code>GOOGLE_CALENDAR_ID</code> al archivo{" "}
                <code>.env</code> y reinicia el servidor.
              </>
            ) : (
              result.message
            )}
          </p>
        </div>
      )}
    </div>
  );
}
