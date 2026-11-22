'use client';

import { useTransition } from 'react';
import { updateSpaceAction } from '@/modules/spaces/actions';
import type { Space, UpdateSpaceInput } from '@/modules/spaces/types/types';
import SpaceForm from '@/modules/spaces/components/SpacesForm';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

interface Props {
    space: Space;
    open: boolean;
    onClose: () => void;
}

export default function EditSpaceModal({ space, open, onClose }: Props) {
    const [isPending, startTransition] = useTransition();

    const handleUpdate = async (values: UpdateSpaceInput) => {
        let result: { success: boolean; error?: string } = { success: false, error: 'Error inesperado' };
        await new Promise<void>((resolve) => {
            startTransition(async () => {
                result = await updateSpaceAction(space.id, values);
                resolve();
            });
        });
        if (result.success) onClose();
        return result;
    };

    return (
        <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
            <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Editar espacio</SheetTitle>
                    <SheetDescription>
                        Actualiza los datos del espacio {space.name}.
                    </SheetDescription>
                </SheetHeader>
                <div className="px-4 pb-4">
                    <SpaceForm
                        key={space.id}
                        defaultValues={{
                            name: space.name,
                            description: space.description ?? '',
                            type: space.type as UpdateSpaceInput['type'],
                            capacity: space.capacity,
                            available: space.available,
                        }}
                        onSubmit={handleUpdate}
                        submitLabel="Guardar cambios"
                        isPending={isPending}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}