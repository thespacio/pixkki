import { notFound } from "next/navigation";
import { PublicShell } from "@/components/layouts/PublicShell";
import { createPublicCatalogService } from "@/modules/adoptions/factories/create-public-catalog-service";
import { SolicitudPublicaForm } from "@/modules/adoptions/components/solicitud-publica-form";
import { isAdoptionDomainError } from "@/modules/adoptions/errors";

type Props = { params: { idAnimal: string } };

export default async function SolicitudPage({ params }: Props) {
    const idAnimal = Number(params.idAnimal);
    if (!Number.isInteger(idAnimal) || idAnimal <= 0) notFound();

    let animal: Record<string, unknown>;
    try {
        const service = await createPublicCatalogService();
        animal = await service.getAnimal(idAnimal) as Record<string, unknown>;
    } catch (error) {
        if (isAdoptionDomainError(error) && error.statusCode === 404) notFound();
        throw error;
    }

    return (
        <PublicShell>
            <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
                <div>
                    <p className="text-sm text-muted-foreground">Postulación de adopción</p>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Solicitar adopción de {String(animal.nombre ?? "")}</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Completa el formulario. El refugio revisará tu solicitud y te contactará. No se requiere crear cuenta.
                    </p>
                </div>
                <SolicitudPublicaForm idAnimal={idAnimal} animalNombre={String(animal.nombre ?? "")} refugioNombre={String((animal.refugio as Record<string, unknown> | undefined)?.nombre ?? "Refugio")} />
            </div>
        </PublicShell>
    );
}