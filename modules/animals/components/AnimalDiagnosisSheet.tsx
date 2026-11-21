"use client";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { AnimalDiagnosisForm } from "./AnimalDiagnosisForm";
import type { AnimalDiagnosis } from "../repositories/animal-diagnosis.repository";

type Props = {
    idAnimal: number;
    open: boolean;
    onClose: () => void;
    onSaved: (diagnostico: AnimalDiagnosis) => void;
};

/**
 * RF1.3: el diagnóstico se registra desde un botón + sheet en la ficha rápida.
 * El historial completo y el formulario permanente viven en la ficha clínica.
 */
export function AnimalDiagnosisSheet({
    idAnimal,
    open,
    onClose,
    onSaved,
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
                className="w-full overflow-y-auto sm:max-w-md"
            >
                <SheetHeader>
                    <SheetTitle>Registrar diagnóstico</SheetTitle>
                    <SheetDescription>
                        Estado general y observaciones clínicas. El diagnóstico no
                        libera la cuarentena.
                    </SheetDescription>
                </SheetHeader>
                <div className="px-4 pb-6">
                    <AnimalDiagnosisForm
                        idAnimal={idAnimal}
                        onCancel={onClose}
                        onSaved={(diagnostico) => {
                            onSaved(diagnostico);
                            onClose();
                        }}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}
