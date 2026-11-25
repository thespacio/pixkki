"use client";

import { useId, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { AdoptionCriterion } from "../repositories/animal-adoption.repository";
import { setAnimalAdoptionAvailabilityAction } from "../actions/animal-poblacional.actions";

type Props = {
    idAnimal: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    criteriosOmitibles: AdoptionCriterion[];
    onSaved: () => void;
};

export function AdoptionExceptionDialog({
    idAnimal,
    open,
    onOpenChange,
    criteriosOmitibles,
    onSaved,
}: Props) {
    const uid = useId();
    const [motivo, setMotivo] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const criteriosIncumplidos = criteriosOmitibles.filter((c) => !c.cumple);
    const motivoValido = motivo.trim().length >= 20 && motivo.trim().length <= 1000;

    function close(nextOpen: boolean) {
        if (!nextOpen) {
            setError(null);
            setMotivo("");
        }
        onOpenChange(nextOpen);
    }

    async function confirmar() {
        setError(null);
        if (!motivoValido) {
            setError("El motivo debe tener entre 20 y 1000 caracteres.");
            return;
        }
        setSaving(true);
        const result = await setAnimalAdoptionAvailabilityAction(idAnimal, {
            disponible_adopcion: true,
            autorizar_excepcion: true,
            motivo_excepcion: motivo.trim(),
        });
        setSaving(false);

        if (!result.success) {
            setError(result.error);
            return;
        }

        close(false);
        onSaved();
    }

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle size={18} className="text-amber-600" aria-hidden="true" />
                        Autorizar excepción de aptitud
                    </DialogTitle>
                    <DialogDescription>
                        Esta acción habilitará la aptitud del paciente con criterios omitidos. La excepción quedará registrada en auditoría; después publica el perfil en Adopciones para que aparezca en el catálogo.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Criterios que se omitirán
                        </p>
                        {criteriosIncumplidos.length === 0 ? (
                            <p className="mt-2 text-sm text-muted-foreground">
                                No hay criterios omitibles incumplidos.
                            </p>
                        ) : (
                            <ul className="mt-2 space-y-2">
                                {criteriosIncumplidos.map((criterio) => (
                                    <li
                                        key={criterio.clave}
                                        className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
                                    >
                                        <p className="font-medium">{criterio.etiqueta}</p>
                                        <p className="text-xs text-amber-800">{criterio.detalle}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div>
                        <label htmlFor={`${uid}-motivo`} className="block text-xs font-medium text-foreground mb-1">
                            Motivo de la excepción *
                        </label>
                        <textarea
                            id={`${uid}-motivo`}
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            rows={4}
                            minLength={20}
                            maxLength={1000}
                            className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                            placeholder="Describe por qué se autoriza la excepción..."
                        />
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            {motivo.trim().length}/1000 caracteres (mínimo 20).
                        </p>
                    </div>

                    {error && (
                        <p role="alert" className="text-xs text-red-600">
                            {error}
                        </p>
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => close(false)} disabled={saving}>
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={() => void confirmar()}
                        disabled={saving || !motivoValido || criteriosIncumplidos.length === 0}
                    >
                        {saving ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : null}
                        Autorizar excepción y habilitar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
