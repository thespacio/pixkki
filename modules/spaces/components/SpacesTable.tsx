'use client';

import { useState, useTransition } from 'react';
import { deleteSpaceAction } from '@/modules/spaces/actions';
import { Pencil, Trash2 } from 'lucide-react';
import { Space } from '@/modules/spaces/types/types';
import EditSpaceModal from "@/modules/spaces/components/EditSpaceModal";


interface Props {
    shelterId: number;
    spaces: Space[];
}

export default function SpacesTable({ shelterId, spaces }: Props) {
    const [isPending, startTransition] = useTransition();
    const [editingSpace, setEditingSpace] = useState<Space | null>(null);

    const handleDelete = (id: number) => {
        startTransition(async () => {
            const res = await deleteSpaceAction(id);

            if (!res.success) {
                console.error('Error al eliminar espacio:', res.error);
            }
        });
    };

    const handleEdit = (space: Space) => {
        setEditingSpace(space);
    };

    return (
        <>
            <div className="bg-card border border-border rounded-2xl shadow-sm mt-6 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-muted">
                    <tr className="text-left">
                        <th className="px-5 py-4 text-sm font-semibold">Espacio</th>
                        <th className="px-5 py-4 text-sm font-semibold">Tipo</th>
                        <th className="px-5 py-4 text-sm font-semibold">Capacidad</th>
                        <th className="px-5 py-4 text-sm font-semibold">Ocupación</th>
                        <th className="px-5 py-4 text-sm font-semibold">Disponibles</th>
                        <th className="px-5 py-4 text-sm font-semibold text-center">Acciones</th>
                    </tr>
                    </thead>

                    <tbody>
                    {(spaces == undefined || spaces.length === 0)? (
                        <tr>
                            <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                No hay espacios registrados.
                            </td>
                        </tr>
                    ) : (
                        spaces.map((space) => (
                            <tr key={space.id} className="border-t border-border">
                                <td className="px-5 py-4">{space.name}</td>
                                <td className="px-5 py-4">{space.type}</td>
                                <td className="px-5 py-4">{space.capacity}</td>
                                <td className="px-5 py-4">{space.capacity}</td>
                                <td className="px-5 py-4 font-medium">
                                    {space.capacity - space.capacity}
                                </td>
                                <td className="px-5 py-4">
                                    <div className="flex justify-center gap-3">
                                        <button
                                            onClick={() => handleEdit(space)}
                                            className="text-blue-600 hover:text-blue-800 cursor-pointer"
                                            disabled={isPending}
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(space.id)}
                                            className="text-red-600 hover:text-red-800 cursor-pointer"
                                            disabled={isPending}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {editingSpace && (
                <EditSpaceModal
                    shelterId={shelterId}
                    space={editingSpace}
                    open={!!editingSpace}
                    onClose={() => setEditingSpace(null)}
                />
            )}
        </>
    );
}