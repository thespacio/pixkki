"use client";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { AnimalCheckupForm } from "./AnimalCheckupForm";
import type { AnimalCheckup } from "../repositories/animal-checkup.repository";

type Props = {
    idAnimal: number;
    open: boolean;
    onClose: () => void;
    onSaved: (chequeo: AnimalCheckup) => void;
};

/**
 * RF2.1/US09: el chequeo se registra desde un botón y un sheet, no desde un
 * formulario permanente dentro de la ficha.
 */
export function AnimalCheckupSheet({ idAnimal, open, onClose, onSaved }: Props) {
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
                    <SheetTitle>Registrar chequeo médico</SheetTitle>
                    <SheetDescription>
                        Constantes vitales y síntomas observados. La fecha y hora se
                        registran automáticamente.
                    </SheetDescription>
                </SheetHeader>
                <div className="px-4 pb-6">
                    <AnimalCheckupForm
                        idAnimal={idAnimal}
                        onCancel={onClose}
                        onSaved={(chequeo) => {
                            onSaved(chequeo);
                            onClose();
                        }}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}
