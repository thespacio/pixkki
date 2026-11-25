import { notFound } from "next/navigation";
import { PublicShell } from "@/components/layouts/PublicShell";
import { createPublicCatalogService } from "@/modules/adoptions/factories/create-public-catalog-service";
import { PublicAnimalDetailView } from "@/modules/adoptions/components/public-animal-detail-view";
import { isAdoptionDomainError } from "@/modules/adoptions/errors";
import type { PublicAnimalDetailDTO } from "@/modules/adoptions/dtos/public-catalog.dto";

type Props = { params: { idAnimal: string } };

export default async function PublicAnimalPage({ params }: Props) {
    const idAnimal = Number(params.idAnimal);
    if (!Number.isInteger(idAnimal) || idAnimal <= 0) notFound();

    let animal: PublicAnimalDetailDTO;
    try {
        const service = await createPublicCatalogService();
        animal = await service.getAnimal(idAnimal);
    } catch (error) {
        if (isAdoptionDomainError(error) && error.statusCode === 404) notFound();
        throw error;
    }

    return (
        <PublicShell>
            <PublicAnimalDetailView animal={animal} />
        </PublicShell>
    );
}
