import type { LucideIcon } from "lucide-react";
import { Boxes, Heart, PawPrint, Package } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";
import type { DashboardSummaryDTO } from "@/modules/reports/dtos/summary.dto";

const formatoEntero = new Intl.NumberFormat("es-MX");

type Kpi = {
    label: string;
    value: number;
    detail: string;
    icon: LucideIcon;
    iconClassName: string;
};

type Props = {
    resumen: DashboardSummaryDTO;
};

export function DashboardKpis({ resumen }: Props) {
    const kpis: Kpi[] = [
        {
            label: "Animales activos",
            value: resumen.poblacion_activa,
            detail: "Población activa del refugio",
            icon: PawPrint,
            iconClassName: "bg-primary/10 text-primary",
        },
        {
            label: "Plazas disponibles",
            value: resumen.capacidad_total,
            detail: "Capacidad de espacios disponibles",
            icon: Boxes,
            iconClassName: "bg-chart-2/20 text-chart-2",
        },
        {
            label: "Adopciones del periodo",
            value: resumen.adopciones_periodo,
            detail: "Registros con fecha en el periodo",
            icon: Heart,
            iconClassName: "bg-chart-4/15 text-chart-4",
        },
        {
            label: "Donaciones registradas",
            value: resumen.donaciones_periodo,
            detail: "Registros en especie; sin montos",
            icon: Package,
            iconClassName: "bg-chart-5/15 text-chart-5",
        },
    ];

    return (
        <section
            aria-label="Indicadores principales del periodo"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
            {kpis.map((kpi) => {
                const Icon = kpi.icon;

                return (
                    <Card key={kpi.label} className="border-border/80">
                        <CardContent className="flex flex-col gap-4 p-5">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    {kpi.label}
                                </p>
                                <div
                                    className={cn(
                                        "flex size-9 shrink-0 items-center justify-center rounded-xl",
                                        kpi.iconClassName,
                                    )}
                                >
                                    <Icon className="size-4" aria-hidden="true" />
                                </div>
                            </div>
                            <div>
                                <p className="font-mono text-3xl font-semibold tracking-tight text-foreground">
                                    {formatoEntero.format(kpi.value)}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {kpi.detail}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </section>
    );
}
