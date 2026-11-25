// app/shelters/[id]/edit/page.tsx
import { notFound } from 'next/navigation';
import {getShelterDetailsByIdAction} from "@/modules/shelters/actions";
import {EditShelterForm} from "@/modules/shelters/ShelterForm/EditShelterForm";

interface EditShelterPageProps {
    params: {
        id: string;
    };
}

interface EditShelterPageProps {
    params: {
        id: string;
    };
}

export default async function EditShelterPage({ params }: EditShelterPageProps) {
    const id = parseInt(params.id);

    if (isNaN(id)) {
        notFound();
    }

    const result = await getShelterDetailsByIdAction(id);

    if (!result.success) {
        notFound();
    }

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">Editar Refugio</h1>
            <EditShelterForm shelter={result.data} id={id} />
        </div>
    );
}