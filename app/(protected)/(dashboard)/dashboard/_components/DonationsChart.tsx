"use client";

import { TrendingUp } from "lucide-react";
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DonationPoint } from "../_data/mock";

type Props = {
    data: DonationPoint[];
};

function DonationTooltip({
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
        <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="font-mono text-sm font-semibold text-foreground">
                ${(payload[0].value ?? 0).toLocaleString()}
            </p>
        </div>
    );
}

export function DonationsChart({ data }: Props) {
    const total = data.reduce((sum, point) => sum + point.amount, 0);

    return (
        <Card className="border-border/80">
            <CardHeader className="space-y-1">
                <CardTitle className="text-base">Ingresos por donaciones</CardTitle>
                <p className="text-xs text-muted-foreground">Tendencia de los últimos 12 meses</p>
                <p className="pt-2 font-mono text-2xl font-semibold tracking-tight text-foreground">
                    ${total.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 text-xs text-primary">
                    <TrendingUp className="size-3.5" aria-hidden="true" />
                    <span className="font-medium">+31% vs. año anterior</span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-36 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis
                                dataKey="month"
                                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis hide width={40} />
                            <Tooltip content={<DonationTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="amount"
                                stroke="var(--chart-1)"
                                strokeWidth={2.5}
                                dot={false}
                                activeDot={{ r: 4, fill: "var(--chart-1)" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
