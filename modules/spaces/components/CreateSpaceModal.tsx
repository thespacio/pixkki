'use client';

import { useState } from 'react';
import { createSpaceAction } from '@/modules/spaces/actions';
import {CreateSpaceInput} from "@/modules/spaces/types/types";
import SpaceForm from "@/modules/spaces/components/SpacesForm";

interface Props {
    shelterId: number;
}

export default function CreateSpaceModal({ shelterId }: Props) {
    const [open, setOpen] = useState(false);

    const handleCreate = async (values: CreateSpaceInput) => {
        const res = await createSpaceAction({ ...values});
        if (res.success) {
            setOpen(false);
        }
        return res;
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded"
            >
                Crear espacio
            </button>

            {open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-card p-6 rounded-2xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Crear espacio</h2>
                        <SpaceForm onSubmit={handleCreate} submitLabel="Crear" />
                        <button
                            onClick={() => setOpen(false)}
                            className="mt-4 text-sm text-muted-foreground"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}