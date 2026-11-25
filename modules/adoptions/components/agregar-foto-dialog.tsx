"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { AnimalGallery } from "@/modules/animals/components/AnimalGallery";

type Props = {
    idAnimal: number;
    nombre: string;
    canEdit: boolean;
};

/**
 * Acción «Añadir foto» para perfiles sin fotografía. Reutiliza la galería del
 * expediente (misma tabla `fotografia`) en lugar de duplicar la subida. Tras
 * cerrar, refresca la ruta para recalcular el estado `sin-foto`.
 */
export function AgregarFotoDialog({ idAnimal, nombre, canEdit }: Props) {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    if (!canEdit) return null;

    function changeOpen(next: boolean) {
        setOpen(next);
        if (!next) router.refresh();
    }

    return (
        <Dialog open={open} onOpenChange={changeOpen}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline">
                    <ImagePlus aria-hidden="true" />
                    Añadir foto
                </Button>
            </DialogTrigger>
            <DialogContent
                className="inset-x-0 bottom-0 top-auto flex h-[90dvh] max-h-[90dvh] max-w-none translate-x-0 translate-y-0 flex-col gap-3 overflow-hidden rounded-t-2xl p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:right-auto sm:bottom-auto sm:left-[50%] sm:top-[50%] sm:h-auto sm:max-h-[85dvh] sm:max-w-2xl sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:p-6"
            >
                <DialogHeader className="pr-8">
                    <DialogTitle>Fotografías de {nombre}</DialogTitle>
                    <DialogDescription>
                        Añade al menos una foto para que el perfil pueda publicarse.
                        La galería admite hasta 5 imágenes JPG, PNG o WEBP.
                    </DialogDescription>
                </DialogHeader>

                <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                    <AnimalGallery idAnimal={idAnimal} canEdit={canEdit} />
                </div>

                <div className="flex shrink-0 justify-end gap-2 border-t border-border pt-3">
                    <Button type="button" onClick={() => changeOpen(false)}>
                        Listo
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
