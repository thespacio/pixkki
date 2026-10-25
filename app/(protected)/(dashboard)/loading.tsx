// Se muestra al instante mientras carga cualquier sección del panel (animales,
// albergues, espacios...). Sin este archivo, al hacer clic en el menú la pantalla
// anterior se queda congelada hasta que el servidor termina de responder.
export default function DashboardLoading() {
    return (
        <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            className="p-8 max-w-7xl mx-auto animate-pulse"
        >
            <span className="sr-only">Cargando...</span>

            <div className="mb-8 space-y-2">
                <div className="h-7 w-48 rounded-lg bg-secondary" />
                <div className="h-4 w-64 rounded-lg bg-secondary" />
            </div>

            <div className="mb-6 h-11 w-full rounded-xl bg-secondary" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-2xl border border-border bg-card overflow-hidden"
                    >
                        <div className="h-36 bg-secondary" />
                        <div className="p-4 space-y-2">
                            <div className="h-4 w-2/3 rounded bg-secondary" />
                            <div className="h-3 w-1/2 rounded bg-secondary" />
                            <div className="h-3 w-1/3 rounded bg-secondary" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
