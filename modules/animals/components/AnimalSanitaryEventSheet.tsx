"use client";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { AnimalSanitaryEventForm } from "./AnimalSanitaryEventForm";
import type { AnimalSanitaryEvent } from "../repositories/animal-sanitary-event.repository";

type Props = {
    idAnimal: number;
    open: boolean;
    onClose: () => void;
    onSaved: (evento: AnimalSanitaryEvent) => void;
};

/**
 * RF2.2/RF2.3/US10: vacunación y desparasitación se registran desde un botón y
 * un sheet. El lote elegido descuenta una unidad del inventario.
 */
export function AnimalSanitaryEventSheet({
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
                    <SheetTitle>Registrar evento sanitario</SheetTitle>
                    <SheetDescription>
                        Vacunación o desparasitación con descuento de inventario.
                    </SheetDescription>
                </SheetHeader>
                <div className="px-4 pb-6">
                    <AnimalSanitaryEventForm
                        idAnimal={idAnimal}
                        onCancel={onClose}
                        onSaved={(evento) => {
                            onSaved(evento);
                            onClose();
                        }}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}
