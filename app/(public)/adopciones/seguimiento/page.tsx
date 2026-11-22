import { PublicShell } from "@/components/layouts/PublicShell";
import { SeguimientoForm } from "@/modules/adoptions/components/seguimiento-form";

export default function SeguimientoPage() {
    return (
        <PublicShell>
            <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6">
                <div>
                    <p className="text-sm text-muted-foreground">Seguimiento de solicitud</p>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Consulta tu solicitud</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Ingresa el folio que recibiste al enviar tu solicitud. Esta consulta muestra solo información mínima del estado.
                    </p>
                </div>
                <SeguimientoForm />
            </div>
        </PublicShell>
    );
}