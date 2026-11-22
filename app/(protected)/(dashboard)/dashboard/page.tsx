import { PageHeader } from "@/components/ui/page-header";
import {
    adoptionData,
    donationData,
    occupancyData,
    recentDonations,
    recentIntakes,
} from "./_data/mock";
import { AdoptionsChart } from "./_components/AdoptionsChart";
import { DashboardKpis } from "./_components/DashboardKpis";
import { DonationsChart } from "./_components/DonationsChart";
import { OccupancyChart } from "./_components/OccupancyChart";
import { RecentDonations } from "./_components/RecentDonations";
import { RecentIntakes } from "./_components/RecentIntakes";

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Panel"
                description="Resumen operativo del refugio. Los indicadores mostrados son datos de demostración mientras se integran las fuentes reales."
            />

            <DashboardKpis />

            <section
                aria-label="Tendencias"
                className="grid gap-4 xl:grid-cols-3"
            >
                <div className="xl:col-span-2">
                    <AdoptionsChart data={adoptionData} />
                </div>
                <DonationsChart data={donationData} />
            </section>

            <section
                aria-label="Actividad reciente"
                className="grid gap-4 xl:grid-cols-3"
            >
                <div className="xl:col-span-2">
                    <RecentIntakes intakes={recentIntakes} />
                </div>
                <div className="flex flex-col gap-4">
                    <OccupancyChart data={occupancyData} />
                    <RecentDonations donations={recentDonations} />
                </div>
            </section>
        </div>
    );
}
