"use client";

import {
    PolarAngleAxis,
    RadialBar,
    RadialBarChart,
    ResponsiveContainer,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
    porcentaje: number | null;
    capacidadTotal: number;
};

const formatoEntero = new Intl.NumberFormat("es-MX");

/** RF7.2/RF7.5: el porcentaje llega calculado; aquí solo se visualiza. */
export function OccupancyChart({ porcentaje, capacidadTotal }: Props) {
    const noCalculable = porcentaje === null;
    const dato = [{ nombre: "Ocupación", valor: porcentaje ?? 0 }];

    return (
        <Card className="border-border/80">
            <CardHeader>
                <CardTitle className="text-base">Ocupación del refugio</CardTitle>
                <CardDescription className="text-xs">
                    {formatoEntero.format(capacidadTotal)} plazas en espacios disponibles
                </CardDescription>
            </CardHeader>
            <CardContent>
                {noCalculable ? (
                    <div className="flex h-56 flex-col items-center justify-center gap-2 text-center">
                        <p className="text-2xl font-semibold text-foreground">No calculable</p>
                        <p className="max-w-xs text-xs text-muted-foreground">
                            No hay espacios disponibles para calcular la ocupación.
                        </p>
                    </div>
                ) : (
                    <div
                        className="relative h-56 w-full"
                        role="img"
                        aria-label={`Ocupación del refugio: ${porcentaje} por ciento`}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart
                                data={dato}
                                innerRadius="72%"
                                outerRadius="100%"
                                startAngle={90}
                                endAngle={-270}
                                barSize={18}
                            >
                                <PolarAngleAxis
                                    type="number"
                                    domain={[0, 100]}
                                    tick={false}
                                    axisLine={false}
                                />
                                <RadialBar
                                    dataKey="valor"
                                    background
                                    cornerRadius={9}
                                    fill="var(--chart-1)"
                                />
                            </RadialBarChart>
                        </ResponsiveContainer>
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                            <span className="font-mono text-3xl font-semibold text-foreground">
                                {porcentaje}%
                            </span>
                            <span className="text-xs text-muted-foreground">ocupado</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
