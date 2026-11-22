"use client";

import { ErrorState } from "@/components/ui/error-state";

type CampaignsErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function CampaignsError({ reset }: CampaignsErrorProps) {
    return (
        <div className="mx-auto max-w-5xl">
            <ErrorState
                title="No pudimos cargar las campañas"
                description="Las campañas no están disponibles ahora mismo. Vuelve a intentarlo."
                reset={reset}
            />
        </div>
    );
}
