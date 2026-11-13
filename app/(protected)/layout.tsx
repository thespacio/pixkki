import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/modules/auth";
import DashboardLayout from "@/modules/dashboard/components/DashboardLayout";
import { getShelterDetailsByIdAction } from "@/modules/shelters/actions";

/**
 * Layout del área protegida. Además de montar el shell del panel, aplica los
 * gates de acceso del Requerimiento 00 en este orden:
 *
 *   1. contraseña temporal sin cambiar  → /change-password
 *   2. Términos y Condiciones sin aceptar → /accept-terms
 *   3. onboarding pendiente              → /onboarding
 *
 * El superadmin (`shelterId === null`) opera a nivel global: no tiene refugio
 * propio ni pasa por el onboarding de espacios.
 */
export default async function Layout({
    children,
}: {
    children: ReactNode;
}) {
    const user = await getCurrentUser();

    if (user.requiresPasswordChange) {
        redirect("/change-password");
    }

    if (!user.termsAccepted) {
        redirect("/accept-terms");
    }

    if (user.requiresOnboarding && user.shelterId !== null) {
        redirect("/onboarding");
    }

    if (user.shelterId === null) {
        return (
            <DashboardLayout user={user} albergue="Pixkki">
                {children}
            </DashboardLayout>
        );
    }

    const albergue = await getShelterDetailsByIdAction(user.shelterId);

    return (
        <DashboardLayout
            user={user}
            albergue={albergue.success ? albergue.data.nombre_albergue : "Pixkki"}
        >
            {children}
        </DashboardLayout>
    );
}
