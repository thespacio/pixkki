"use client";

// ---------------------------------------------------------------------------
// Composición cliente de la ficha clínica en página (RF2.1 / RF2.4).
//
// La página es un Server Component: aquí se agrupan los paneles que mutan el
// expediente y, tras cada cambio, se refresca el Server Component para que la
// línea de tiempo se reconstruya con los datos persistidos.
// ---------------------------------------------------------------------------

import { useRouter } from "next/navigation";
import { AnimalCheckupPanel } from "./AnimalCheckupPanel";
import { AnimalClinicalRecord } from "./AnimalClinicalRecord";
import { AnimalQuarantinePanel } from "./AnimalQuarantinePanel";
import { AnimalSanitaryEventPanel } from "./AnimalSanitaryEventPanel";
import type { ClinicalRecord } from "../services/clinical-record.service";

type Props = {
    idAnimal: number;
    /** Veterinario/admin: puede registrar chequeos y altas médicas. */
    canOperate: boolean;
    initialRecord: ClinicalRecord;
};

export function AnimalClinicalPagePanels({
    idAnimal,
    canOperate,
    initialRecord,
}: Props) {
    const router = useRouter();
    const refresh = () => router.refresh();

    return (
        <div className="space-y-6">
            <AnimalQuarantinePanel
                idAnimal={idAnimal}
                canRelease={canOperate}
                onChanged={refresh}
            />
            <AnimalCheckupPanel
                idAnimal={idAnimal}
                canRegister={canOperate}
                onSaved={refresh}
            />
            <AnimalSanitaryEventPanel
                idAnimal={idAnimal}
                canRegister={canOperate}
                onSaved={refresh}
            />
            <AnimalClinicalRecord
                idAnimal={idAnimal}
                initialRecord={initialRecord}
                variant="page"
            />
        </div>
    );
}
