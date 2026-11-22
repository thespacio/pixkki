"use client";

import { Badge } from "@/components/ui/badge";
import type { AnimalSurgeryHistoryItem } from "../repositories/animal-surgery.repository";

function formatFecha(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

type Props = {
    cirugias: AnimalSurgeryHistoryItem[];
};

export function AnimalSurgeryHistoryList({ cirugias }: Props) {
    if (cirugias.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Sin cirugías registradas.
            </p>
        );
    }

    return (
        <ul className="space-y-3">
            {cirugias.map((cirugia) => (
                <li
                    key={cirugia.idCirugia}
                    className="rounded-xl border border-border bg-card p-4"
                >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                {cirugia.tipoCirugia}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {formatFecha(cirugia.fechaCirugia)}
                            </p>
                        </div>
                        <Badge
                            variant={cirugia.exitosa ? "secondary" : "outline"}
                            className={
                                cirugia.exitosa
                                    ? "border-green-200 bg-green-100 text-green-700"
                                    : "border-amber-200 bg-amber-50 text-amber-800"
                            }
                        >
                            {cirugia.exitosa ? "Exitosa" : "No exitosa"}
                        </Badge>
                    </div>

                    {cirugia.notasPostoperatorias ? (
                        <p className="mt-2 whitespace-pre-line text-xs text-muted-foreground">
                            {cirugia.notasPostoperatorias}
                        </p>
                    ) : null}

                    <div className="mt-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Insumos consumidos
                        </p>
                        {cirugia.insumos.length === 0 ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                                Sin insumos registrados.
                            </p>
                        ) : (
                            <ul className="mt-1 space-y-1">
                                {cirugia.insumos.map((insumo) => (
                                    <li
                                        key={`${cirugia.idCirugia}-${insumo.idLoteInventario}`}
                                        className="flex items-center justify-between text-xs text-foreground"
                                    >
                                        <span>{insumo.nombreInsumo || `Lote #${insumo.idLoteInventario}`}</span>
                                        <span className="text-muted-foreground">
                                            Cantidad: {insumo.cantidad}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </li>
            ))}
        </ul>
    );
}
