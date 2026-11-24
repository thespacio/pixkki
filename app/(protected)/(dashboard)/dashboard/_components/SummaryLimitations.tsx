import { Info } from "lucide-react";

type Props = {
    limitaciones: string[];
};

/** Estado parcial (P7): nunca sustituye una métrica no calculable por cero. */
export function SummaryLimitations({ limitaciones }: Props) {
    if (limitaciones.length === 0) return null;

    return (
        <aside
            role="status"
            className="flex items-start gap-3 rounded-xl border border-border/80 bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
        >
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <div>
                <p className="font-medium text-foreground">Datos con limitaciones</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                    {limitaciones.map((limitacion) => (
                        <li key={limitacion}>{limitacion}</li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}
