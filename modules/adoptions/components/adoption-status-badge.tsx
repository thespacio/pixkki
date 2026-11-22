import { Badge } from "@/components/ui/badge";

const STATUS_STYLES: Record<string, string> = {
    Recibida: "bg-sky-100 text-sky-800 border-sky-200",
    "En entrevista": "bg-amber-100 text-amber-800 border-amber-200",
    "En evaluación": "bg-violet-100 text-violet-800 border-violet-200",
    Aprobada: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Rechazada: "bg-rose-100 text-rose-800 border-rose-200",
    Cancelada: "bg-zinc-100 text-zinc-700 border-zinc-200",
    Completada: "bg-green-100 text-green-800 border-green-200",
};

export function AdoptionStatusBadge({ status }: { status: string }) {
    const cls = STATUS_STYLES[status] ?? "bg-secondary text-secondary-foreground border-border";
    return (
        <Badge variant="outline" className={cls}>
            {status}
        </Badge>
    );
}