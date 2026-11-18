"use client";

// ---------------------------------------------------------------------------
// Composición cliente de la ficha clínica en página (RF2.1 / RF2.4 / RF3.x).
//
// La página es un Server Component: aquí se agrupan los paneles que mutan el
// expediente y, tras cada cambio, se refresca el Server Component para que la
// línea de tiempo se reconstruya con los datos persistidos.
// ---------------------------------------------------------------------------

import { useRouter } from "next/navigation";
import { AnimalCheckupPanel } from "./AnimalCheckupPanel";
import { AnimalClinicalRecord } from "./AnimalClinicalRecord";
import { AnimalQuarantinePanel } from "./AnimalQuarantinePanel";
import { AnimalSanitaryEventPanel } from "./AnimalSanitaryEventPanel";
import { AnimalTransferPanel } from "./AnimalTransferPanel";
import { AnimalTemperamentPanel } from "./AnimalTemperamentPanel";
import { AnimalRehabilitationPanel } from "./AnimalRehabilitationPanel";
import type { ClinicalRecord } from "../services/clinical-record.service";

type Props = {
    idAnimal: number;
    /** Veterinario/admin: puede registrar chequeos y altas médicas. */
    canOperate: boolean;
    /** Evaluador/veterinario/admin: puede registrar temperamento y rehabilitación. */
    canEvaluate: boolean;
    initialRecord: ClinicalRecord;
};

function PanelCard({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="bg-card border border-border rounded-2xl p-6 shadow-sm [&>section]:mt-0 [&>section>h4]:hidden">
            <header className="mb-4 pb-3 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">{title}</h2>
                {description ? (
                    <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                ) : null}
            </header>
            {children}
        </section>
    );
}

export function AnimalClinicalPagePanels({
    idAnimal,
    canOperate,
    canEvaluate,
    initialRecord,
}: Props) {
    const router = useRouter();
    const refresh = () => router.refresh();

    return (
        <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-foreground mb-4 pb-3 border-b border-border">
                    Resumen clínico y línea de tiempo
                </h2>
                <AnimalClinicalRecord
                    idAnimal={idAnimal}
                    initialRecord={initialRecord}
                    variant="page"
                />
            </div>

            <PanelCard
                title="Cuarentena"
                description="Estado de aislamiento y alta médica del paciente."
            >
                <AnimalQuarantinePanel
                    idAnimal={idAnimal}
                    canRelease={canOperate}
                    onChanged={refresh}
                />
            </PanelCard>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <PanelCard
                    title="Chequeos médicos"
                    description="Registro de constantes vitales y síntomas observados."
                >
                    <AnimalCheckupPanel
                        idAnimal={idAnimal}
                        canRegister={canOperate}
                        onSaved={refresh}
                    />
                </PanelCard>

                <PanelCard
                    title="Vacunación y desparasitación"
                    description="Eventos sanitarios con descuento de inventario."
                >
                    <AnimalSanitaryEventPanel
                        idAnimal={idAnimal}
                        canRegister={canOperate}
                        onSaved={refresh}
                    />
                </PanelCard>

                <PanelCard
                    title="Traslados y ubicación"
                    description="Cambio de espacio con validación de capacidad y cuarentena."
                >
                    <AnimalTransferPanel
                        idAnimal={idAnimal}
                        canTransfer
                        canRelease={canOperate}
                        onSaved={refresh}
                    />
                </PanelCard>

                <PanelCard
                    title="Temperamento y compatibilidad"
                    description="Evaluaciones conductuales y aptitud de convivencia."
                >
                    <AnimalTemperamentPanel
                        idAnimal={idAnimal}
                        canRegister={canEvaluate}
                        onSaved={refresh}
                    />
                </PanelCard>

                <PanelCard
                    title="Rehabilitación"
                    description="Bitácora de procesos físicos, emocionales y conductuales."
                >
                    <AnimalRehabilitationPanel
                        idAnimal={idAnimal}
                        canRegister={canEvaluate}
                        onSaved={refresh}
                    />
                </PanelCard>
            </div>
        </div>
    );
}
