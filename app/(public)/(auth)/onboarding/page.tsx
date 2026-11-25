import { redirect } from "next/navigation";

import { getCurrentUser } from "@/modules/auth";
import { createSpaceService } from "@/modules/spaces/factories/factories";
import OnboardingWizard from "./OnboardingWizard";

/**
 * Onboarding inicial del administrador del refugio (US30).
 *
 * Se muestra una sola vez, cuando `primer_inicio_sesion` está activo. El
 * objetivo mínimo es registrar al menos un espacio; al finalizar se marca el
 * onboarding como completado y el usuario pasa al panel.
 */
export default async function OnboardingPage() {
    let user;
    try {
        user = await getCurrentUser();
    } catch (error) {
        const statusCode =
            error instanceof Error && "statusCode" in error && typeof error.statusCode === "number"
                ? error.statusCode
                : undefined;
        if (statusCode === 401 || statusCode === 403) redirect("/login");
        throw error;
    }

    // El superadmin (sin refugio) y quienes ya completaron el wizard no
    // tienen nada que hacer aquí.
    if (user.shelterId === null || !user.requiresOnboarding) {
        redirect("/dashboard");
    }

    const service = await createSpaceService();
    const spaces = await service.getSpacesByShelter(user.shelterId);

    return (
        <OnboardingWizard
            initialSpaces={spaces.map((space) => ({
                id: space.id,
                name: space.name,
                type: space.type,
                capacity: space.capacity,
            }))}
        />
    );
}
