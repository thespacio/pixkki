import { Cat, Dog, MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";
import type { IntakeStatus, RecentIntake } from "../_data/mock";

const statusConfig: Record<IntakeStatus, { label: string; className: string }> = {
    available: { label: "Disponible", className: "bg-primary/10 text-primary border-primary/20" },
    medical: { label: "En atención médica", className: "bg-chart-4/15 text-chart-4 border-chart-4/20" },
    pending: { label: "Pendiente", className: "bg-chart-5/15 text-chart-5 border-chart-5/20" },
    adopted: { label: "Adoptado", className: "bg-muted text-muted-foreground border-border" },
};

type Props = {
    intakes: RecentIntake[];
};

export function RecentIntakes({ intakes }: Props) {
    return (
        <Card className="border-border/80">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                    <CardTitle className="text-base">Ingresos recientes</CardTitle>
                    <p className="text-xs text-muted-foreground">
                        Últimos animales admitidos en el refugio
                    </p>
                </div>
                <Button variant="ghost" size="sm" className="text-primary" disabled>
                    Ver todos
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-sm">
                        <thead>
                            <tr className="border-y border-border text-left">
                                <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Animal
                                </th>
                                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Raza
                                </th>
                                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Edad
                                </th>
                                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Estado
                                </th>
                                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Ingreso
                                </th>
                                <th className="px-4 py-3">
                                    <span className="sr-only">Acciones</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {intakes.map((animal) => {
                                const status = statusConfig[animal.status];
                                const SpeciesIcon = animal.species === "dog" ? Dog : Cat;

                                return (
                                    <tr
                                        key={animal.id}
                                        className="border-b border-border last:border-0 transition-colors hover:bg-muted/30"
                                    >
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={cn(
                                                        "flex size-8 items-center justify-center rounded-xl",
                                                        animal.species === "dog"
                                                            ? "bg-primary/10 text-primary"
                                                            : "bg-chart-4/15 text-chart-4"
                                                    )}
                                                >
                                                    <SpeciesIcon className="size-4" aria-hidden="true" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">{animal.name}</p>
                                                    <p className="font-mono text-xs text-muted-foreground">
                                                        {animal.id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-muted-foreground">{animal.breed}</td>
                                        <td className="px-4 py-3.5 font-mono text-foreground">{animal.age}</td>
                                        <td className="px-4 py-3.5">
                                            <Badge variant="outline" className={status.className}>
                                                {status.label}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3.5 text-muted-foreground">{animal.intakeDate}</td>
                                        <td className="px-4 py-3.5 text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8 text-muted-foreground"
                                                aria-label={`Acciones para ${animal.name}`}
                                                disabled
                                            >
                                                <MoreHorizontal className="size-4" aria-hidden="true" />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
