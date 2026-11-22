import Link from "next/link";
import { getCurrentUser } from "@/modules/auth";
import { ADOPTION_PERMISSIONS } from "@/modules/adoptions/access";
import { getAnimalAccess } from "@/modules/animals/access";
import { createAnimalService } from "@/modules/animals/factories/create-animal-service";
import { createProfileService } from "@/modules/adoptions/factories/create-profile-service";
import { PerfilEditor } from "@/modules/adoptions/components/perfil-editor";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PawPrint } from "lucide-react";

export default async function PerfilesAdopcionPage() {
    const user = await getCurrentUser();
    if (!user.permissions.includes(ADOPTION_PERMISSIONS.view)) {
        return <div className="p-6"><p className="text-sm text-muted-foreground">No tienes permiso para ver perfiles de adopción.</p></div>;
    }

    const animalService = await createAnimalService();
    const profileService = await createProfileService();
    const access = getAnimalAccess(user);
    const animales = await animalService.listVisible(access);

    const profiles = await Promise.allSettled(
        animales.slice(0, 50).map(async (animal) => {
            const a = animal as { idAnimal: number; nombre?: string | null; especie?: string; raza?: string | null };
            try {
                const profile = await profileService.get(a.idAnimal, user) as Record<string, unknown>;
                return { animal: a, profile, error: null as string | null };
            } catch (error: unknown) {
                const msg = error && typeof error === "object" && "message" in error ? String((error as { message?: unknown }).message) : "No se pudo cargar el perfil.";
                return { animal: a, profile: null as Record<string, unknown> | null, error: msg };
            }
        }),
    );

    const rows = profiles.map((r) => r.status === "fulfilled" ? r.value : null).filter(Boolean) as Array<{ animal: { idAnimal: number; nombre?: string | null; especie?: string; raza?: string | null }; profile: Record<string, unknown> | null; error: string | null }>;
    const failed = profiles.filter((r) => r.status === "rejected").length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm text-muted-foreground"><Link href="/adopciones" className="hover:underline">Adopciones</Link> / Perfiles</p>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Perfiles de adopción</h1>
                    <p className="text-sm text-muted-foreground">Publica o guarda borradores de perfiles. G-01: composición temporal por animal.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/adopciones/solicitudes" className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-medium hover:bg-secondary">Solicitudes</Link>
                    <Link href="/adopciones/perfiles" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">Perfiles</Link>
                </div>
            </div>

            {failed > 0 && <p className="text-sm text-amber-700">Algunos perfiles no pudieron cargarse ({failed}).</p>}

            {rows.length === 0 ? (
                <EmptyState
                    icon={PawPrint}
                    title="No hay perfiles para mostrar"
                    description="No se encontraron animales disponibles para gestionar perfiles."
                    action={<Link href="/adopciones/solicitudes" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">Ver solicitudes</Link>}
                />
            ) : (
                <div className="space-y-3">
                    {rows.map(({ animal, profile, error }) => (
                        <Card key={animal.idAnimal}>
                            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-semibold text-foreground">{animal.nombre ?? `Animal #${animal.idAnimal}`}</p>
                                        {profile?.publicado ? <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200" variant="outline">Publicado</Badge> : <Badge variant="outline">Borrador</Badge>}
                                        {profile?.puede_publicarse === false && <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">No publicable</Badge>}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{animal.especie ?? "Animal"} {animal.raza ? `· ${animal.raza}` : ""}</p>
                                    {error && <p className="text-xs text-rose-600">{error}</p>}
                                    {!error && Array.isArray(profile?.bloqueos) && profile.bloqueos.length > 0 && (
                                        <p className="text-xs text-amber-700">Bloqueos: {(profile.bloqueos as string[]).join(", ")}</p>
                                    )}
                                </div>
                                {user.permissions.includes(ADOPTION_PERMISSIONS.publish) && (
                                    <PerfilEditor
                                        idAnimal={animal.idAnimal}
                                        nombre={animal.nombre ?? `Animal #${animal.idAnimal}`}
                                        descripcion={(profile?.descripcion_publica as string | null | undefined) ?? null}
                                        publicado={Boolean(profile?.publicado)}
                                        puedePublicarse={Boolean(profile?.puede_publicarse)}
                                        bloqueos={Array.isArray(profile?.bloqueos) ? profile.bloqueos as string[] : []}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}