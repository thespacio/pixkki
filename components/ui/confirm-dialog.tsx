"use client";

import { Button } from "./button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./dialog";

/**
 * Confirmación de una acción destructiva o irreversible.
 *
 * Es controlado: el consumidor decide cuándo abrirlo y qué ejecutar. El estado
 * `pending` se recibe por prop para no mezclar lógica de negocio con el
 * primitivo; el texto debe explicar la consecuencia real de la acción.
 */
type ConfirmDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
    cancelLabel?: string;
    pending?: boolean;
    variant?: "default" | "destructive";
    /** Mensaje en español para mostrar dentro del diálogo si la acción falla. */
    error?: string;
};

function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel,
    onConfirm,
    cancelLabel = "Cancelar",
    pending = false,
    variant = "destructive",
    error,
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent data-slot="confirm-dialog">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                {error ? (
                    <p
                        role="alert"
                        className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                    >
                        {error}
                    </p>
                ) : null}
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={pending}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        type="button"
                        variant={variant}
                        onClick={onConfirm}
                        disabled={pending}
                        aria-busy={pending}
                    >
                        {pending ? "Procesando..." : confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export { ConfirmDialog };
export type { ConfirmDialogProps };
