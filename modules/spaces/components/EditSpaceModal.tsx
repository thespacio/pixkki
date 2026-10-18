'use client';

import { updateSpaceAction } from '@/modules/spaces/actions';
import {Space, UpdateSpaceInput} from "@/modules/spaces/types/types";
import SpaceForm from "@/modules/spaces/components/SpacesForm";


interface Props {
    shelterId: number;
    space: Space;
    open: boolean;
    onClose: () => void;
}

export default function EditSpaceModal({ shelterId, space, open, onClose }: Props) {
    if (!open) return null;

    const handleUpdate = async (values: UpdateSpaceInput) => {
        const res = await updateSpaceAction(space.id , values );
        if (res.success) {
            onClose();
        }
        return res;
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-2xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Editar espacio</h2>
                <SpaceForm
                    defaultValues={{
                        name: space.name,
                        type: space.type,
                        capacity: space.capacity,
                    }}
                    onSubmit={handleUpdate}
                    submitLabel="Guardar cambios"
                />
                <button
                    onClick={onClose}
                    className="mt-4 text-sm text-muted-foreground"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
}