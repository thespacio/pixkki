"use client";

import { Cat, Dog } from "lucide-react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdoptionPoint } from "../_data/mock";

type Props = {
    data: AdoptionPoint[];
};

function AdoptionTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: Array<{ dataKey?: string; value?: number; color?: string }>;
    label?: string;
}) {
    if (!active || !payload?.length) return null;

    const labels: Record<string, string> = { dogs: "Perros", cats: "Gatos" };

    return (
        <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
            <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
            {payload.map((entry) => (
                <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
                    <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: entry.color }}
                        aria-hidden="true"
                    />
                    <span className="text-muted-foreground">{labels[entry.dataKey ?? ""] ?? entry.dataKey}:</span>
                    <span className="font-mono font-semibold text-foreground">{entry.value}</span>
                </div>
            ))}
        </div>
    );
}

export function AdoptionsChart({ data }: Props) {
    return (
        <Card className="border-border/80">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <CardTitle className="text-base">Adopciones del año</CardTitle>
                    <p className="text-xs text-muted-foreground">
                        Comparativa mensual de perros y gatos
                    </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                        <Dog className="size-3.5 text-chart-1" aria-hidden="true" />
                        Perros
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <Cat className="size-3.5 text-chart-2" aria-hidden="true" />
                        Gatos
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="adoptions-dogs" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="adoptions-cats" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.28} />
                                    <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis
                                dataKey="month"
                                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                                axisLine={false}
                                tickLine={false}
                                width={40}
                            />
                            <Tooltip content={<AdoptionTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="dogs"
                                stroke="var(--chart-1)"
                                strokeWidth={2}
                                fill="url(#adoptions-dogs)"
                                dot={false}
                                activeDot={{ r: 4, fill: "var(--chart-1)" }}
                            />
                            <Area
                                type="monotone"
                                dataKey="cats"
                                stroke="var(--chart-2)"
                                strokeWidth={2}
                                fill="url(#adoptions-cats)"
                                dot={false}
                                activeDot={{ r: 4, fill: "var(--chart-2)" }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
