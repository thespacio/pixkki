'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Loader2 } from 'lucide-react';
import { getAnimalsBySpaceAction } from '@/modules/animals/actions/animal.actions';
import type { Animal } from '@/modules/animals/types/animales.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

type Props = {
    spaceId: number;
    spaceName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function SpaceAnimalsSheet({ spaceId, spaceName, open, onOpenChange }: Props) {
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [prevOpen, setPrevOpen] = useState(false);

    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open) {
            setLoading(true);
            setError(null);
            setAnimals([]);
        }
    }

    useEffect(() => {
        if (!open) return;
        let active = true;

        void getAnimalsBySpaceAction(spaceId).then((result) => {
            if (!active) return;
            if (result.success) {
                setAnimals(result.data);
            } else {
                setError(result.error);
                setAnimals([]);
            }
            setLoading(false);
        });

        return () => {
            active = false;
        };
    }, [open, spaceId]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="sm:max-w-2xl overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Animales en {spaceName}</SheetTitle>
                    <SheetDescription>
                        Consulta los animales actualmente asignados a este espacio.
                    </SheetDescription>
                </SheetHeader>

                <div className="px-4 pb-4">
                    {loading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
                            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                            Cargando animales...
                        </div>
                    ) : error ? (
                        <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {error}
                        </p>
                    ) : animals.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-8">No hay animales asignados a este espacio.</p>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr className="text-left">
                                        <th className="px-4 py-3 font-medium">Nombre</th>
                                        <th className="px-4 py-3 font-medium">Especie</th>
                                        <th className="px-4 py-3 font-medium">Estado</th>
                                        <th className="px-4 py-3 font-medium">Situación</th>
                                        <th className="px-4 py-3 font-medium">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {animals.map((animal) => (
                                        <tr key={animal.idAnimal} className="border-t border-border">
                                            <td className="px-4 py-3 font-medium text-foreground">
                                                {animal.nombre || 'Sin nombre'}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{animal.especie}</td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {animal.estadoNombre || 'Sin estado'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {animal.enCuarentena && (
                                                        <Badge variant="destructive">En cuarentena</Badge>
                                                    )}
                                                    {animal.disponibleAdopcion && (
                                                        <Badge variant="secondary">En adopción</Badge>
                                                    )}
                                                    {!animal.enCuarentena && !animal.disponibleAdopcion && (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Button asChild variant="ghost" size="sm">
                                                    <Link href={`/animales/${animal.idAnimal}/ficha-clinica`}>
                                                        <ExternalLink size={14} aria-hidden="true" />
                                                        Ver expediente
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}