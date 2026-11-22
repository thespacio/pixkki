import Link from "next/link";
import { getCurrentUser } from "@/modules/auth";
import { createApplicationService } from "../factories/create-application-service";
import { ADOPTION_PERMISSIONS } from "../access";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STATUS_COUNTS = ["Recibida", "En entrevista", "En evaluación", "Aprobada"] as const;

export async function InternalAdoptionsSummary() {
    const user = await getCurrentUser();
    const canView = user.permissions.includes(ADOPTION_PERMISSIONS.view);
    if (!canView) return null;

    const service = await createApplicationService();

    const results = await Promise.allSettled(
        STATUS_COUNTS.map(async (estado) => {
            const res = await service.list({ estado, page: 1, pageSize: 1 }, user);
            return { estado, total: Number((res as { total?: number }).total ?? 0) };
        }),
    );

    const counts = results.map((r, i) =>
        r.status === "fulfilled" ? r.value : { estado: STATUS_COUNTS[i], total: 0 },
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Adopciones</h1>
                <p className="text-sm text-muted-foreground">Gestiona solicitudes, evaluaciones y perfiles de adopción.</p>
            </div>

            <div className="flex flex-wrap gap-2">
                <Link href="/adopciones/solicitudes" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">Solicitudes</Link>
                <Link href="/adopciones/perfiles" className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-medium hover:bg-secondary">Perfiles</Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {counts.map(({ estado, total }) => (
                    <Card key={estado}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{estado}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-semibold text-foreground">{total}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Accesos rápidos</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                    <Button asChild variant="outline"><Link href="/adopciones/solicitudes">Ver bandeja de solicitudes</Link></Button>
                    <Button asChild variant="outline"><Link href="/adopciones/perfiles">Gestionar perfiles</Link></Button>
                </CardContent>
            </Card>
        </div>
    );
}