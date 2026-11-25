import Link from "next/link";
import { getCurrentUser } from "@/modules/auth";
import { createApplicationService } from "../factories/create-application-service";
import { ADOPTION_PERMISSIONS } from "../access";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STATUS_COUNTS = ["Recibida", "En entrevista", "En evaluación", "Aprobada"] as const;

type Props = {
    user?: Awaited<ReturnType<typeof getCurrentUser>> | null;
};

export async function InternalAdoptionsSummary({ user: userProp }: Props = {}) {
    const user = userProp ?? await getCurrentUser();
    if (!user || !user.permissions.includes(ADOPTION_PERMISSIONS.view)) return null;

    const service = await createApplicationService();

    const results = await Promise.allSettled(
        STATUS_COUNTS.map(async (estado) => {
            const res = await service.list({ estado, page: 1, pageSize: 1 }, user);
            return Number(res.total ?? 0);
        }),
    );

    const counts = STATUS_COUNTS.map((estado, index) => {
        const result = results[index];
        return result?.status === "fulfilled"
            ? { estado, total: result.value }
            : { estado, total: null };
    });
    const hayContadoresIndisponibles = counts.some((count) => count.total === null);

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

            {hayContadoresIndisponibles && (
                <p role="status" className="text-xs text-muted-foreground">
                    Algunos contadores no pudieron cargarse. Se muestran como «—»; el resto de la vista sigue disponible.
                </p>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {counts.map(({ estado, total }) => (
                    <Card key={estado}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{estado}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p
                                className="text-3xl font-semibold text-foreground"
                                aria-label={`${estado}: ${total === null ? "no disponible" : `${total} solicitudes`}`}
                            >
                                {total ?? "—"}
                            </p>
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
