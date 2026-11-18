import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldAlert } from "lucide-react";

import { getCurrentUser } from "@/modules/auth";
import { ANIMAL_PERMISSIONS, getAnimalAccess } from "@/modules/animals/access";
import { createClinicalRecordService } from "@/modules/animals/factories/create-clinical-record-service";
import type { ClinicalRecord } from "@/modules/animals/services/clinical-record.service";
import { AnimalClinicalPagePanels } from "@/modules/animals/components/AnimalClinicalPagePanels";
import {
    AnimalNotFoundError,
    puedeEjecutarOperacionClinica,
    puedeRegistrarSocializacion,
} from "@/modules/animals/types/animales.types";

type PageProps = { params: { id: string } };

export default async function AnimalClinicalRecordPage({ params }: PageProps) {
    const user = await getCurrentUser();

    if (!user.permissions.includes(ANIMAL_PERMISSIONS.view)) {
        return (
            <div className="p-8 max-w-4xl mx-auto text-center py-24 text-muted-foreground">
                <ShieldAlert size={40} className="mx-auto mb-3 opacity-40" aria-hidden="true" />
                <p className="font-medium text-foreground">No tienes permiso para ver la ficha clínica</p>
            </div>
        );
    }

    const idAnimal = Number(params.id);
    if (!Number.isInteger(idAnimal) || idAnimal <= 0) notFound();

    let ficha: ClinicalRecord;
    try {
        const service = await createClinicalRecordService();
        ficha = await service.getClinicalRecord(idAnimal, getAnimalAccess(user));
    } catch (error) {
        if (error instanceof AnimalNotFoundError) notFound();
        throw error;
    }

    const nombre = ficha.animal.nombre ?? `${ficha.animal.especie} sin nombre`;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-6 flex items-center gap-3">
                <Link
                    href="/animales"
                    className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition"
                >
                    <ArrowLeft size={16} aria-hidden="true" /> Volver a animales
                </Link>
            </div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Ficha clínica</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {nombre} · Expediente #{ficha.animal.idAnimal}
                </p>
            </div>
            <AnimalClinicalPagePanels
                idAnimal={idAnimal}
                canOperate={puedeEjecutarOperacionClinica(user.role)}
                canEvaluate={puedeRegistrarSocializacion(user.role)}
                initialRecord={ficha}
            />
        </div>
    );
}
