import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/modules/auth";
import { isSuperadmin } from "@/modules/auth/authorization";
import { resolveVisibleNavIds } from "@/modules/navigation";
import { AppShell } from "@/components/layouts/AppShell";
import { getShelterDetailsByIdAction } from "@/modules/shelters/actions";

/**
 * Layout del área protegida. Aplica los gates de acceso del Requerimiento 00 en
 * este orden:
 *
 *   1. contraseña temporal sin cambiar  → /change-password
 *   2. Términos y Condiciones sin aceptar → /accept-terms
 *   3. onboarding pendiente              → /onboarding
 *
 * Después monta el shell único (`AppShell`). La navegación se calcula aquí, en
 * el servidor, y viaja como ids: el cliente nunca decide qué puede ver.
 *
 * El superadmin (`shelterId === null`) opera a nivel global: no tiene refugio
 * propio ni pasa por el onboarding de espacios.
 */
export default async function Layout({
    children,
}: {
    children: ReactNode;
}) {
    let user;
    try {
        user = await getCurrentUser();
    } catch (error) {
        // Si la sesión ya no es válida (usuario/refugio inactivo, sesión expirada),
        // se envía a login en vez de romper el layout protegido.
        const statusCode =
            error instanceof Error && "statusCode" in error && typeof error.statusCode === "number"
                ? error.statusCode
                : undefined;
        if (statusCode === 401 || statusCode === 403) {
            redirect("/login");
        }
        throw error;
    }

    if (user.requiresPasswordChange) {
        redirect("/change-password");
    }

    if (!user.termsAccepted) {
        redirect("/accept-terms");
    }

    if (user.requiresOnboarding && user.shelterId !== null) {
        redirect("/onboarding");
    }

    let shelterName = "Pixkki";

    if (user.shelterId !== null) {
        const shelter = await getShelterDetailsByIdAction(user.shelterId);
        if (shelter.success) {
            shelterName = shelter.data.nombre_albergue;
        }
    }

    const visibleNavIds = resolveVisibleNavIds({
        permissions: user.permissions,
        isSuperadmin: isSuperadmin(user),
        hasShelter: user.shelterId !== null,
    });

    return (
        <AppShell
            shelterName={shelterName}
            user={{
                fullName: user.fullName,
                email: user.email,
                role: user.role,
            }}
            visibleNavIds={visibleNavIds}
        >
            {children}
        </AppShell>
    );
}
