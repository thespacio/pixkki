"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardSummaryDTO } from "@/modules/reports/dtos/summary.dto";

type Props = {
    resumen: DashboardSummaryDTO;
};

type TooltipPayload = {
    value?: number;
    payload?: { etiqueta?: string };
};

function AlertsTooltip({
    active,
    payload,
}: {
    active?: boolean;
    payload?: TooltipPayload[];
}) {
    if (!active || !payload?.length) return null;

    return (
        <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
            <p className="text-xs text-muted-foreground">{payload[0].payload?.etiqueta}</p>
            <p className="font-mono text-sm font-semibold text-foreground">
                {payload[0].value ?? 0} registros
            </p>
        </div>
    );
}

/** RF7.5: alertas reales del resumen; el sobrecupo se muestra como texto. */
export function SummaryAlertsChart({ resumen }: Props) {
    const datos = [
        { etiqueta: "Cuarentena", total: resumen.alertas.cuarentena },
        { etiqueta: "Stock bajo", total: resumen.stock_bajo },
        { etiqueta: "Lotes vencidos", total: resumen.lotes_vencidos },
    ];
    const colores = ["var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

    return (
        <Card className="border-border/80">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <CardTitle className="text-base">Alertas del refugio</CardTitle>
                    <CardDescription className="text-xs">
                        Situaciones que requieren seguimiento
                    </CardDescription>
                </div>
                <Badge
                    variant={resumen.alertas.sobrecupo ? "destructive" : "secondary"}
                    className="w-fit"
                >
                    Sobrecupo: {resumen.alertas.sobrecupo ? "sí" : "no"}
                </Badge>
            </CardHeader>
            <CardContent>
                <div className="h-64 w-full" role="img" aria-label="Gráfica de alertas del refugio">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={datos} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis
                                dataKey="etiqueta"
                                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                allowDecimals={false}
                                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                                axisLine={false}
                                tickLine={false}
                                width={40}
                            />
                            <Tooltip content={<AlertsTooltip />} />
                            <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                                {datos.map((dato, indice) => (
                                    <Cell key={dato.etiqueta} fill={colores[indice]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
