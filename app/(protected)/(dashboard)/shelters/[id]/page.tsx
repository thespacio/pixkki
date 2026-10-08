// app/shelters/[id]/page.tsx
import {notFound} from 'next/navigation';
import {getShelterDetailsByIdAction} from "@/modules/shelters/actions";
import {ShelterDetail} from "@/modules/shelters/ShelterDetail/ShelterDetail";

interface ShelterDetailPageProps {
    params: {
        id: string;
    };
}

export default async function ShelterDetailPage({ params }: ShelterDetailPageProps) {
    const id = parseInt(params.id);

    if (isNaN(id)) {
        notFound();
    }

    const result = await getShelterDetailsByIdAction(id);

    if (!result.success) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
                    <p className="text-muted-foreground mt-2">{result.message}</p>
                </div>
            </div>
        );
    }

    // Verificar permisos para mostrar botón de editar
    // Esto podría venir de la sesión del usuario
    const canEdit = true; // Implementar lógica de permisos

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <ShelterDetail shelter={result.data} canEdit={canEdit} />
        </div>
    );
}