import type { Metadata } from "next";
import Link from "next/link";
import { Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentUser } from "@/modules/auth";
import { getShelterDetailsByIdAction } from "@/modules/shelters/actions";
import { ShelterSettingsForm } from "@/modules/shelters/ShelterForm/ShelterSettingsForm";

export const metadata: Metadata = {
    title: "Datos del refugio",
    description: "Datos generales del refugio y su ubicación.",
};

/**
 * Datos del refugio propio (pestaña por defecto de Configuración, E-07).
 *
 * El superadministrador no tiene refugio asignado (`shelterId === null`), así
 * que ve un estado vacío con salida al listado global en lugar de un error.
 */
export default async function RefugioSettingsPage() {
    const user = await getCurrentUser();

    if (user.shelterId === null) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Datos del refugio"
                    description="Configuración del refugio al que perteneces."
                />
                <EmptyState
                    icon={Building2}
                    title="No tienes un refugio asignado"
                    description="Tu cuenta opera a nivel global. Administra los refugios de la plataforma desde el listado."
                    action={
                        <Button asChild>
                            <Link href="/refugios">Ir a Refugios</Link>
                        </Button>
                    }
                />
            </div>
        );
    }

    let shelter: Awaited<
        ReturnType<typeof getShelterDetailsByIdAction>
    >["data"];

    try {
        const result = await getShelterDetailsByIdAction(user.shelterId);
        shelter = result.data;
    } catch {
        return (
            <div className="space-y-6">
                <PageHeader title="Datos del refugio" />
                <EmptyState
                    icon={Building2}
                    title="No se pudieron cargar los datos del refugio"
                    description="Vuelve a intentarlo en unos segundos. Si el problema continúa, contacta al superadministrador."
                    action={
                        <Button asChild>
                            <Link href="/dashboard">Volver al panel</Link>
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl">
            <PageHeader
                title="Datos del refugio"
                description="Actualiza el nombre, la ubicación y los datos de contacto. Los cambios se aplican de inmediato."
            />
            <ShelterSettingsForm shelter={shelter} id={shelter.id} />
        </div>
    );
}
