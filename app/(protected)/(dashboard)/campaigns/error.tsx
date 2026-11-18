"use client";

import { ErrorState } from "@/components/ui/error-state";

type CampaignsErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function CampaignsError({ reset }: CampaignsErrorProps) {
    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
            <ErrorState
                title="No pudimos cargar las campañas"
                description="Las campañas no están disponibles ahora mismo. Vuelve a intentarlo."
                reset={reset}
            />
        </div>
    );
}
