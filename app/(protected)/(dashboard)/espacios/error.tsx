'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function EspaciosError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="rounded-2xl border border-destructive/30 bg-card px-6 py-12 text-center">
                <h2 className="text-lg font-semibold text-foreground">No se pudieron cargar los espacios</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Ocurrió un error al consultar la información. Intenta nuevamente.
                </p>
                <div className="mt-4 flex justify-center">
                    <Button type="button" onClick={reset}>
                        Reintentar
                    </Button>
                </div>
            </div>
        </div>
    );
}