"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { X, PencilLine } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { deleteAnimalAction } from "../actions/animal.actions";
import type { Animal } from "@/modules/animals/types/animales.types";
import type { SpaceWithOptionalOccupancy } from "@/modules/spaces/ports/space-occupancy.port";
import { AnimalDiagnosisSheet } from "./AnimalDiagnosisSheet";
import { AnimalEditSheet } from "./AnimalEditSheet";
import { AnimalGallery } from "./AnimalGallery";
import { AnimalQuickActions } from "./AnimalQuickActions";
import { AnimalQuickDetails } from "./AnimalQuickDetails";
import { AnimalQuickSummary } from "./AnimalQuickSummary";
import { AnimalQuarantineBottomSheet } from "./AnimalQuarantineBottomSheet";

type Props = {
    animal: Animal;
    canEdit: boolean;
    canDelete: boolean;
    canDiagnose: boolean;
    onClose: () => void;
    /** Espacios con ocupación calculada donde puede reubicarse el animal. */
    espacios?: SpaceWithOptionalOccupancy[];
};

/**
 * Ficha rápida del animal (nivel 2, overlay).
 *
 * Muestra el estado del paciente y permite una acción clínica puntual sin
 * abandonar el listado. El historial y los formularios permanentes viven en
 * `/animales/[id]/ficha-clinica` (nivel 3), accesibles desde el CTA principal.
 */
export function AnimalDetailPanel({
    animal,
    canEdit,
    canDelete,
    canDiagnose,
    onClose,
    espacios = [],
}: Props) {
    const [pending, startTransition] = useTransition();
    const [feedback, setFeedback] = useState<{
        type: "ok" | "error";
        msg: string;
    } | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    // Espejo local de la cuarentena: al registrar el alta, la ficha abierta se
    // actualiza al instante. El listado toma el valor nuevo al recargarse
    // (la action revalida la ruta en el servidor).
    const [enCuarentena, setEnCuarentena] = useState(animal.enCuarentena);
    const [releaseOpen, setReleaseOpen] = useState(false);
    const [diagnosisOpen, setDiagnosisOpen] = useState(false);
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const closeRef = useRef<HTMLButtonElement>(null);
    const onCloseRef = useRef(onClose);

    // Espejo local del expediente: se aplica solo mientras la lista no entregue
    // un `animal` nuevo. Así el panel se refresca al instante tras guardar y
    // vuelve a la fuente del servidor en la siguiente revalidación.
    const [saved, setSaved] = useState<{ base: Animal; value: Animal } | null>(
        null,
    );
    const animalActual = saved?.base === animal ? saved.value : animal;

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        closeRef.current?.focus();
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") onCloseRef.current();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    function refresh() {
        setRefreshKey((value) => value + 1);
    }

    function darDeBaja() {
        if (!confirm(`¿Dar de baja a ${animalActual.nombre ?? animalActual.especie}?`)) return;
        setFeedback(null);
        startTransition(async () => {
            const result = await deleteAnimalAction(animalActual.idAnimal);
            if (result.success) onClose();
            else setFeedback({ type: "error", msg: result.error });
        });
    }

    return (
        <div
            className="fixed inset-0 bg-black/40 z-50 flex justify-end"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="animal-detail-title"
                className="bg-background w-full max-w-md h-full overflow-y-auto shadow-xl px-6 pb-6 pt-6"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-2 flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-foreground">Ficha rápida</h3>
                    <div className="flex items-center gap-2">
                        {canEdit && (
                            <button
                                type="button"
                                onClick={() => setEditOpen(true)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-secondary"
                            >
                                <PencilLine size={13} aria-hidden="true" />
                                Editar datos
                            </button>
                        )}
                        <button
                            ref={closeRef}
                            onClick={onClose}
                            className="rounded text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            aria-label="Cerrar"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {feedback && (
                    <div
                        role={feedback.type === "error" ? "alert" : "status"}
                        className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                            feedback.type === "ok"
                                ? "border-green-200 bg-green-50 text-green-700"
                                : "border-red-200 bg-red-50 text-red-700"
                        }`}
                    >
                        {feedback.msg}
                    </div>
                )}

                <AnimalQuickSummary
                    animal={animalActual}
                    enCuarentena={enCuarentena}
                    canRelease={canDiagnose}
                    canDiagnose={canDiagnose}
                    refreshKey={refreshKey}
                    onRequestRelease={() => setReleaseOpen(true)}
                    onRequestDiagnosis={() => setDiagnosisOpen(true)}
                    onOpenGallery={() => setGalleryOpen(true)}
                />

                {editOpen && (
                    <AnimalEditSheet
                        animal={animalActual}
                        enCuarentena={enCuarentena}
                        espacios={espacios}
                        open={editOpen}
                        onClose={() => setEditOpen(false)}
                        onSaved={(updated) =>
                            setSaved({ base: animal, value: updated })
                        }
                    />
                )}

                <AnimalQuickDetails
                    animal={animalActual}
                    enCuarentena={enCuarentena}
                />

                <AnimalQuickActions
                    idAnimal={animalActual.idAnimal}
                    disponibleAdopcion={animalActual.disponibleAdopcion}
                    enCuarentena={enCuarentena}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    pending={pending}
                    onDelete={darDeBaja}
                />

                <AnimalQuarantineBottomSheet
                    idAnimal={animal.idAnimal}
                    open={releaseOpen}
                    onClose={() => setReleaseOpen(false)}
                    onReleased={() => {
                        setEnCuarentena(false);
                        setReleaseOpen(false);
                        refresh();
                    }}
                />

                <AnimalDiagnosisSheet
                    idAnimal={animal.idAnimal}
                    open={diagnosisOpen}
                    onClose={() => setDiagnosisOpen(false)}
                    onSaved={refresh}
                />

                <Sheet
                    open={galleryOpen}
                    onOpenChange={(next) => {
                        if (!next) setGalleryOpen(false);
                    }}
                >
                    <SheetContent
                        side="right"
                        className="w-full overflow-y-auto sm:max-w-lg"
                    >
                        <SheetHeader>
                            <SheetTitle>Galería del expediente</SheetTitle>
                            <SheetDescription>
                                Hasta 5 fotos. Puedes agregar, eliminar y elegir la portada.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="px-4 pb-6">
                            <AnimalGallery
                                idAnimal={animal.idAnimal}
                                canEdit={canEdit}
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}
