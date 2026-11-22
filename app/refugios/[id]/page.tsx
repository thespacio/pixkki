import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/modules/auth";
import { isSuperadmin } from "@/modules/auth/authorization";
import { resolveVisibleNavIds } from "@/modules/navigation";
import { AppShell } from "@/components/layouts/AppShell";
import { PublicShell } from "@/components/layouts/PublicShell";
import { getShelterDetailsByIdAction } from "@/modules/shelters/actions";
import { ShelterDetail } from "@/modules/shelters/ShelterDetail/ShelterDetail";
import { createPublicCatalogService } from "@/modules/adoptions/factories/create-public-catalog-service";
import { PublicCatalogView } from "@/modules/adoptions/components/public-catalog-view";
import { Card, CardContent } from "@/components/ui/card";
import { isAdoptionDomainError } from "@/modules/adoptions/errors";

type Props = { params: { id: string }; searchParams: Record<string, string | string[] | undefined> };

export default async function RefugioDetailPage({ params, searchParams }: Props) {
    const numericId = Number(params.id);
    const isNumeric = Number.isInteger(numericId) && numericId > 0;

    if (isNumeric) {
        let user: Awaited<ReturnType<typeof getCurrentUser>> | null = null;
        try { user = await getCurrentUser(); } catch { user = null; }
        if (!user || !isSuperadmin(user)) notFound();

        const result = await getShelterDetailsByIdAction(numericId);
        if (!result.success) notFound();

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

        return (
            <AppShell
                shelterName={shelterName}
                user={{ fullName: user.fullName, email: user.email, role: user.role }}
                visibleNavIds={visibleNavIds}
            >
                <div className="container mx-auto py-8 max-w-4xl">
                    <ShelterDetail shelter={result.data} canEdit={true} />
                </div>
            </AppShell>
        );
    }

    let refugio: Record<string, unknown>;
    try {
        const service = await createPublicCatalogService();
        const data = await service.getRefugio(params.id) as { refugio?: Record<string, unknown> };
        refugio = data.refugio ?? {};
    } catch (error) {
        if (isAdoptionDomainError(error) && error.statusCode === 404) notFound();
        throw error;
    }

    return (
        <PublicShell>
            <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                <div className="text-sm text-muted-foreground"><Link href="/refugios" className="hover:underline">Refugios</Link> / {String(refugio.nombre ?? "")}</div>
                <Card>
                    <CardContent className="space-y-2 p-6">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">{String(refugio.nombre ?? "")}</h1>
                        <p className="text-muted-foreground">{[refugio.ciudad, refugio.estado].filter(Boolean).map(String).join(", ")}</p>
                        {refugio.descripcion_publica ? <p className="text-sm text-foreground">{String(refugio.descripcion_publica)}</p> : null}
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {refugio.correo_contacto ? <span>{String(refugio.correo_contacto)}</span> : null}
                            {refugio.telefono ? <span>{String(refugio.telefono)}</span> : null}
                            <span>{String(refugio.adoptables ?? 0)} adoptable(s)</span>
                        </div>
                    </CardContent>
                </Card>
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">Animales disponibles</h2>
                    <PublicCatalogView searchParams={searchParams} basePath={`/refugios/${params.id}`} fixedRefugioSlug={params.id} showFilters={false} />
                </div>
            </div>
        </PublicShell>
    );
}