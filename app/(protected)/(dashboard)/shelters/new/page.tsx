// app/(dashboard)/shelters/new/page.tsx
// Página para crear un nuevo albergue

import { Metadata } from 'next';
import {ShelterForm} from "@/modules/shelters/ShelterForm";


export const metadata: Metadata = {
    title: 'Nuevo Albergue - Sistema de Gestión',
    description: 'Registrar un nuevo albergue en el sistema',
};

export default function NewShelterPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Nuevo Albergue</h1>
                <p className="text-muted-foreground mt-1">
                    Completa los siguientes datos para registrar un nuevo albergue
                </p>
            </div>

            <ShelterForm />
        </div>
    );
}