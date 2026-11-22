'use client';

import { useState, useTransition } from 'react';
import { Plus } from 'lucide-react';
import { createSpaceAction } from '@/modules/spaces/actions';
import type { CreateSpaceInput } from '@/modules/spaces/types/types';
import SpaceForm from '@/modules/spaces/components/SpacesForm';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';

interface Props {
    onSuccess?: () => void;
}

export default function CreateSpaceModal({ onSuccess }: Props) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleCreate = async (values: CreateSpaceInput) => {
        let result: { success: boolean; error?: string } = { success: false, error: 'Error inesperado' };
        await new Promise<void>((resolve) => {
            startTransition(async () => {
                result = await createSpaceAction(values);
                resolve();
            });
        });
        if (result.success) {
            setOpen(false);
            onSuccess?.();
        }
        return result;
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button type="button">
                    <Plus size={16} aria-hidden="true" />
                    Crear espacio
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Nuevo espacio</SheetTitle>
                    <SheetDescription>
                        Registra un espacio físico del refugio. La ocupación se calculará automáticamente.
                    </SheetDescription>
                </SheetHeader>
                <div className="px-4 pb-4">
                    <SpaceForm
                        key={open ? 'open' : 'closed'}
                        onSubmit={handleCreate}
                        submitLabel="Crear espacio"
                        isPending={isPending}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}