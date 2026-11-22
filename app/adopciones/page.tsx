import { getCurrentUser } from "@/modules/auth";
import { isSuperadmin } from "@/modules/auth/authorization";
import { resolveVisibleNavIds } from "@/modules/navigation";
import { AppShell } from "@/components/layouts/AppShell";
import { PublicShell } from "@/components/layouts/PublicShell";
import { getShelterDetailsByIdAction } from "@/modules/shelters/actions";
import { ADOPTION_PERMISSIONS } from "@/modules/adoptions/access";
import { PublicCatalogView } from "@/modules/adoptions/components/public-catalog-view";
import { InternalAdoptionsSummary } from "@/modules/adoptions/components/internal-adoptions-summary";

type Props = {
    searchParams: Record<string, string | string[] | undefined>;
};

export default async function AdopcionesPage({ searchParams }: Props) {
    const resolvedSearchParams = searchParams;

    let user: Awaited<ReturnType<typeof getCurrentUser>> | null = null;
    try {
        user = await getCurrentUser();
    } catch {
        user = null;
    }

    if (!user) {
        return (
            <PublicShell>
                <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Animales en adopción</h1>
                        <p className="text-muted-foreground">
                            Conoce animales disponibles, revisa su perfil y postúlate cuando encuentres a tu compañero ideal.
                        </p>
                    </div>
                    <PublicCatalogView searchParams={resolvedSearchParams} />
                </div>
            </PublicShell>
        );
    }

    let shelterName = "Pixkki";
    if (user.shelterId !== null) {
        const shelter = await getShelterDetailsByIdAction(user.shelterId);
        if (shelter.success) shelterName = shelter.data.nombre_albergue;
    }

    const visibleNavIds = resolveVisibleNavIds({
        permissions: user.permissions,
        isSuperadmin: isSuperadmin(user),
        hasShelter: user.shelterId !== null,
    });

    const canView = user.permissions.includes(ADOPTION_PERMISSIONS.view);

    return (
        <AppShell
            shelterName={shelterName}
            user={{ fullName: user.fullName, email: user.email, role: user.role }}
            visibleNavIds={visibleNavIds}
        >
            <div className="px-4 py-6 sm:px-6 lg:px-8">
                {canView ? (
                    <InternalAdoptionsSummary />
                ) : (
                    <div className="rounded-2xl border border-border bg-card p-6">
                        <h1 className="text-xl font-semibold text-foreground">Adopciones</h1>
                        <p className="mt-2 text-sm text-muted-foreground">No tienes permiso para ver la gestión interna de adopciones.</p>
                    </div>
                )}
            </div>
        </AppShell>
    );
}