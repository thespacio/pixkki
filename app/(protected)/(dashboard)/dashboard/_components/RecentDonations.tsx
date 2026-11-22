import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecentDonation } from "../_data/mock";

type Props = {
    donations: RecentDonation[];
};

export function RecentDonations({ donations }: Props) {
    return (
        <Card className="border-border/80">
            <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
                <CardTitle className="text-base">Donaciones recientes</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary" disabled>
                    Ver todas
                </Button>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {donations.map((donation) => (
                        <li
                            key={`${donation.name}-${donation.date}-${donation.amount}`}
                            className="flex items-center justify-between gap-3"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-foreground">
                                    {donation.name}
                                </p>
                                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="rounded-md bg-chart-5/10 px-1.5 py-0.5 font-medium text-chart-5">
                                        {donation.type}
                                    </span>
                                    <span>{donation.date}</span>
                                </div>
                            </div>
                            <p className="shrink-0 font-mono text-sm font-semibold text-foreground">
                                ${donation.amount.toLocaleString()}
                            </p>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
