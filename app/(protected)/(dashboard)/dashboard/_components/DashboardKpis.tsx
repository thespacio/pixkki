import type { LucideIcon } from "lucide-react";
import { BarChart2, DollarSign, Heart, PawPrint, TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";

type Kpi = {
    label: string;
    value: string;
    detail: string;
    trend: string;
    trendUp: boolean;
    icon: LucideIcon;
    iconClassName: string;
};

const kpis: Kpi[] = [
    {
        label: "Animales refugiados",
        value: "147",
        detail: "84 perros · 63 gatos",
        trend: "+4",
        trendUp: true,
        icon: PawPrint,
        iconClassName: "bg-primary/10 text-primary",
    },
    {
        label: "Adopciones mensuales",
        value: "41",
        detail: "Diciembre 2024",
        trend: "+12%",
        trendUp: true,
        icon: Heart,
        iconClassName: "bg-chart-4/15 text-chart-4",
    },
    {
        label: "Donaciones recibidas",
        value: "$11,200",
        detail: "Todos los canales",
        trend: "+23%",
        trendUp: true,
        icon: DollarSign,
        iconClassName: "bg-chart-5/15 text-chart-5",
    },
    {
        label: "Ocupación del albergue",
        value: "78%",
        detail: "Capacidad: 188 animales",
        trend: "-3%",
        trendUp: false,
        icon: BarChart2,
        iconClassName: "bg-chart-2/20 text-chart-2",
    },
];

export function DashboardKpis() {
    return (
        <section
            aria-label="Indicadores principales"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
            {kpis.map((kpi) => {
                const Icon = kpi.icon;
                const TrendIcon = kpi.trendUp ? TrendingUp : TrendingDown;

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
                                        kpi.iconClassName
                                    )}
                                >
                                    <Icon className="size-4" aria-hidden="true" />
                                </div>
                            </div>
                            <div>
                                <p className="font-mono text-3xl font-semibold tracking-tight text-foreground">
                                    {kpi.value}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">{kpi.detail}</p>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs">
                                <TrendIcon
                                    className={cn(
                                        "size-3.5",
                                        kpi.trendUp ? "text-primary" : "text-destructive"
                                    )}
                                    aria-hidden="true"
                                />
                                <span
                                    className={cn(
                                        "font-semibold",
                                        kpi.trendUp ? "text-primary" : "text-destructive"
                                    )}
                                >
                                    {kpi.trend}
                                </span>
                                <span className="text-muted-foreground">vs. mes anterior</span>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </section>
    );
}
