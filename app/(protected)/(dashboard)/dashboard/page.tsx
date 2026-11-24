import Link from "next/link";
import { PawPrint } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { createDashboardSummary } from "@/modules/dashboard/factories/create-dashboard-summary";
import type { DashboardSummaryDTO } from "@/modules/reports/dtos/summary.dto";

import { DashboardKpis } from "./_components/DashboardKpis";
import { OccupancyChart } from "./_components/OccupancyChart";
import { SummaryAlertsChart } from "./_components/SummaryAlertsChart";
import { SummaryLimitations } from "./_components/SummaryLimitations";

function formatearFecha(fecha: string): string {
    const [anio, mes, dia] = fecha.split("-").map(Number);
    return new Intl.DateTimeFormat("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(Date.UTC(anio, mes - 1, dia)));
}

function sinActividad(resumen: DashboardSummaryDTO): boolean {
    return (
        resumen.poblacion_activa === 0 &&
        resumen.capacidad_total === 0 &&
        resumen.adopciones_periodo === 0 &&
        resumen.donaciones_periodo === 0 &&
        resumen.alertas.cuarentena === 0 &&
        resumen.alertas.sobrecupo === false &&
        resumen.stock_bajo === 0 &&
        resumen.lotes_vencidos === 0
    );
}

export default async function DashboardPage() {
    const { getResumen } = await createDashboardSummary();
    const resumen = await getResumen();
    const { desde, hasta } = resumen.periodo;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Panel"
                description={`Resumen operativo del ${formatearFecha(desde)} al ${formatearFecha(hasta)}. Hora de México.`}
            />

            {sinActividad(resumen) ? (
                <EmptyState
                    icon={PawPrint}
                    title="Aún no hay actividad registrada"
                    description="No hay animales activos, espacios disponibles ni registros en el periodo seleccionado."
                    action={
                        <Button asChild>
                            <Link href="/animales">Ir a animales</Link>
                        </Button>
                    }
                />
            ) : (
                <>
                    <DashboardKpis resumen={resumen} />

                    <SummaryLimitations limitaciones={resumen.limitaciones} />

                    <section
                        aria-label="Ocupación y alertas del periodo"
                        className="grid gap-4 lg:grid-cols-2"
                    >
                        <OccupancyChart
                            porcentaje={resumen.porcentaje_ocupacion}
                            capacidadTotal={resumen.capacidad_total}
                        />
                        <SummaryAlertsChart resumen={resumen} />
                    </section>
                </>
            )}
        </div>
    );
}
