"use client";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { AnimalClinicalRecord } from "./AnimalClinicalRecord";
import type { ClinicalRecord } from "../services/clinical-record.service";

type Props = {
    idAnimal: number;
    initialRecord: ClinicalRecord;
    refreshKey: number;
    open: boolean;
    onClose: () => void;
};

/**
 * Historial completo en un sheet: el resumen muestra solo los últimos eventos
 * para no convertir la ficha en una lista interminable.
 */
export function AnimalClinicalHistorySheet({
    idAnimal,
    initialRecord,
    refreshKey,
    open,
    onClose,
}: Props) {
    return (
        <Sheet
            open={open}
            onOpenChange={(next) => {
                if (!next) onClose();
            }}
        >
            <SheetContent
                side="right"
                className="w-full overflow-y-auto sm:max-w-lg"
            >
                <SheetHeader>
                    <SheetTitle>Historial clínico completo</SheetTitle>
                    <SheetDescription>
                        Todos los eventos del expediente, del más reciente al más
                        antiguo.
                    </SheetDescription>
                </SheetHeader>
                <div className="px-4 pb-6">
                    <AnimalClinicalRecord
                        idAnimal={idAnimal}
                        initialRecord={initialRecord}
                        refreshKey={refreshKey}
                        variant="page"
                        showStats={false}
                        showAlerts={false}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}
