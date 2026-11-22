'use client';

import { useState, useTransition } from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { deleteSpaceAction } from '@/modules/spaces/actions';
import type { SpaceWithOccupancy } from '@/modules/spaces/types/types';
import EditSpaceModal from '@/modules/spaces/components/EditSpaceModal';
import SpaceAnimalsSheet from '@/modules/spaces/components/SpaceAnimalsSheet';

const TYPE_LABELS: Record<string, string> = {
    canil: 'Canil',
    gatera: 'Gatera',
    cuarentena: 'Cuarentena',
    rehabilitacion: 'Rehabilitación',
    otro: 'Otro',
};

function typeLabel(type: string): string {
    return TYPE_LABELS[type] ?? type;
}

interface Props {
    space: SpaceWithOccupancy;
    canManage: boolean;
}

export default function SpaceCard({ space, canManage }: Props) {
    const [editing, setEditing] = useState(false);
    const [animalsOpen, setAnimalsOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [blockedOpen, setBlockedOpen] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [isPending, startTransition] = useTransition();

    const ocupacionPct = space.capacity > 0 ? Math.min(100, (space.ocupacion / space.capacity) * 100) : 0;
    const sinCupo = space.capacidadLibre === 0;
    const noDisponible = !space.available;
    const hasAnimals = space.ocupacion > 0;

    const handleDelete = () => {
        setError(undefined);
        startTransition(async () => {
            const result = await deleteSpaceAction(space.id);
            if (!result.success) {
                setError(result.error);
                return;
            }
            setDeleteOpen(false);
        });
    };

    const openDeleteFlow = () => {
        setError(undefined);
        if (hasAnimals) {
            setBlockedOpen(true);
        } else {
            setDeleteOpen(true);
        }
    };

    return (
        <>
            <article className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{space.name}</h3>
                        <p className="text-sm text-muted-foreground">{typeLabel(space.type)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {space.type === 'cuarentena' && <Badge variant="outline">Cuarentena</Badge>}
                        {noDisponible && <Badge variant="secondary">No disponible</Badge>}
                        {sinCupo && !noDisponible && <Badge variant="outline">Sin cupo</Badge>}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Ocupación</span>
                        <span className="font-medium text-foreground">
                            {space.ocupacion}/{space.capacity}
                        </span>
                    </div>
                    <div
                        className="h-2 w-full rounded-full bg-muted overflow-hidden"
                        role="progressbar"
                        aria-label={`Ocupación de ${space.name}`}
                        aria-valuemin={0}
                        aria-valuemax={space.capacity}
                        aria-valuenow={space.ocupacion}
                    >
                        <div
                            className={`h-full rounded-full transition-all ${sinCupo ? 'bg-amber-500' : 'bg-primary'}`}
                            style={{ width: `${ocupacionPct}%` }}
                        />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {noDisponible
                            ? 'Espacio no disponible'
                            : sinCupo
                              ? 'Sin cupo'
                              : `${space.capacidadLibre} ${space.capacidadLibre === 1 ? 'plaza libre' : 'plazas libres'}`}
                    </p>
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                    <Button variant="ghost" size="sm" onClick={() => setAnimalsOpen(true)}>
                        <Eye size={14} aria-hidden="true" />
                        Ver animales
                    </Button>
                    {canManage && (
                        <>
                            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                                <Pencil size={14} aria-hidden="true" />
                                Editar
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={openDeleteFlow}
                            >
                                <Trash2 size={14} aria-hidden="true" />
                                Eliminar
                            </Button>
                        </>
                    )}
                </div>
            </article>

            <SpaceAnimalsSheet
                spaceId={space.id}
                spaceName={space.name}
                open={animalsOpen}
                onOpenChange={setAnimalsOpen}
            />

            {canManage && (
                <>
                    <EditSpaceModal space={space} open={editing} onClose={() => setEditing(false)} />

                    <Dialog open={blockedOpen} onOpenChange={setBlockedOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>No se puede eliminar el espacio</DialogTitle>
                                <DialogDescription>
                                    &quot;{space.name}&quot; tiene {space.ocupacion}{' '}
                                    {space.ocupacion === 1 ? 'animal asignado' : 'animales asignados'}. Debes
                                    moverlos a otro espacio antes de poder eliminarlo.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setBlockedOpen(false)}>
                                    Cerrar
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setBlockedOpen(false);
                                        setAnimalsOpen(true);
                                    }}
                                >
                                    Ver animales
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <ConfirmDialog
                        open={deleteOpen}
                        onOpenChange={(open) => {
                            if (!isPending) {
                                setDeleteOpen(open);
                                if (!open) setError(undefined);
                            }
                        }}
                        title="Eliminar espacio"
                        description={`Vas a eliminar "${space.name}". Esta acción no se puede deshacer.`}
                        confirmLabel="Eliminar"
                        onConfirm={handleDelete}
                        pending={isPending}
                        error={error}
                    />
                </>
            )}
        </>
    );
}