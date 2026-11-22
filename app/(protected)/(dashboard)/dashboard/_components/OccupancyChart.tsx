"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OccupancyPoint } from "../_data/mock";

type Props = {
    data: OccupancyPoint[];
};

function OccupancyTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: Array<{ value?: number }>;
    label?: string;
}) {
    if (!active || !payload?.length) return null;

    return (
        <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-sm">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-mono text-sm font-semibold text-foreground">
                {payload[0].value}% ocupación
            </p>
        </div>
    );
}

export function OccupancyChart({ data }: Props) {
    return (
        <Card className="border-border/80">
            <CardHeader className="space-y-1 pb-2">
                <CardTitle className="text-base">Ocupación semanal</CardTitle>
                <p className="text-xs text-muted-foreground">
                    Porcentaje de capacidad usado en las últimas 8 semanas
                </p>
            </CardHeader>
            <CardContent>
                <div className="h-36 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barSize={14}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis
                                dataKey="week"
                                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                                axisLine={false}
                                tickLine={false}
                                domain={[50, 100]}
                                width={40}
                            />
                            <Tooltip content={<OccupancyTooltip />} cursor={{ fill: "var(--muted)" }} />
                            <Bar dataKey="rate" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
