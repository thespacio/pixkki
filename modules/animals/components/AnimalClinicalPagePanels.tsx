"use client";

// ---------------------------------------------------------------------------
// Composición cliente de la ficha clínica en página (RF2.1 / RF2.4 / RF3.x).
//
// La página se organiza en dos pestañas:
// - Clínico: resumen con últimos eventos, cuarentena, chequeos, eventos
//   sanitarios, diagnóstico de ingreso y traslados.
// - Socialización: temperamento/compatibilidad y rehabilitación.
//
// Los registros se abren desde botones + sheets. Así la ficha muestra primero
// el estado del paciente y no una sucesión de formularios permanentes.
// ---------------------------------------------------------------------------

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    HeartHandshake,
    History,
    ShieldPlus,
    Stethoscope,
    Syringe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimalCheckupPanel } from "./AnimalCheckupPanel";
import { AnimalCheckupSheet } from "./AnimalCheckupSheet";
import { AnimalClinicalHistorySheet } from "./AnimalClinicalHistorySheet";
import { AnimalClinicalRecord } from "./AnimalClinicalRecord";
import { AnimalDiagnosisPanel } from "./AnimalDiagnosisPanel";
import { AnimalQuarantineBottomSheet } from "./AnimalQuarantineBottomSheet";
import { AnimalQuarantinePanel } from "./AnimalQuarantinePanel";
import { AnimalRehabilitationPanel } from "./AnimalRehabilitationPanel";
import { AnimalSanitaryEventPanel } from "./AnimalSanitaryEventPanel";
import { AnimalSanitaryEventSheet } from "./AnimalSanitaryEventSheet";
import { AnimalTemperamentPanel } from "./AnimalTemperamentPanel";
import { AnimalTransferPanel } from "./AnimalTransferPanel";
import type { ClinicalRecord } from "../services/clinical-record.service";

type Props = {
    idAnimal: number;
    /** Veterinario/admin: puede registrar chequeos, diagnósticos y altas médicas. */
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
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm [&>section>h4]:hidden">
            <header className="mb-4 border-b border-border pb-3">
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
    const [refreshKey, setRefreshKey] = useState(0);
    const [checkupOpen, setCheckupOpen] = useState(false);
    const [sanitaryOpen, setSanitaryOpen] = useState(false);
    const [releaseOpen, setReleaseOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);

    function refresh() {
        setRefreshKey((value) => value + 1);
        router.refresh();
    }

    return (
        <div className="space-y-6">
            <Tabs defaultValue="clinico">
                <TabsList>
                    <TabsTrigger value="clinico">
                        <Stethoscope size={15} aria-hidden="true" />
                        Clínico
                    </TabsTrigger>
                    <TabsTrigger value="socializacion">
                        <HeartHandshake size={15} aria-hidden="true" />
                        Socialización
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="clinico" className="space-y-6">
                    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                        <header className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
                            <div>
                                <h2 className="text-sm font-semibold text-foreground">
                                    Resumen clínico
                                </h2>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Estado actual y últimos eventos del expediente.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {canOperate && (
                                    <Button
                                        size="sm"
                                        onClick={() => setCheckupOpen(true)}
                                    >
                                        <Stethoscope aria-hidden="true" />
                                        Registrar chequeo
                                    </Button>
                                )}
                                {canOperate && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setSanitaryOpen(true)}
                                    >
                                        <Syringe aria-hidden="true" />
                                        Evento sanitario
                                    </Button>
                                )}
                                {canOperate && initialRecord.animal.enCuarentena && (
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => setReleaseOpen(true)}
                                    >
                                        <ShieldPlus aria-hidden="true" />
                                        Alta médica
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setHistoryOpen(true)}
                                >
                                    <History aria-hidden="true" />
                                    Historial completo
                                </Button>
                            </div>
                        </header>

                        <AnimalClinicalRecord
                            idAnimal={idAnimal}
                            initialRecord={initialRecord}
                            refreshKey={refreshKey}
                            variant="page"
                            maxEvents={5}
                            onViewAll={() => setHistoryOpen(true)}
                        />

                        <div className="mt-6 border-t border-border pt-4">
                            <AnimalQuarantinePanel
                                idAnimal={idAnimal}
                                canRelease={canOperate}
                                refreshKey={refreshKey}
                                onChanged={refresh}
                                showReleaseButton={false}
                            />
                        </div>
                    </section>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <PanelCard
                            title="Chequeos médicos"
                            description="Constantes vitales y síntomas observados."
                        >
                            <AnimalCheckupPanel
                                idAnimal={idAnimal}
                                canRegister={canOperate}
                                limit={5}
                                refreshKey={refreshKey}
                                onRequestCreate={() => setCheckupOpen(true)}
                                onViewAll={() => setHistoryOpen(true)}
                            />
                        </PanelCard>

                        <PanelCard
                            title="Vacunación y desparasitación"
                            description="Eventos sanitarios con descuento de inventario."
                        >
                            <AnimalSanitaryEventPanel
                                idAnimal={idAnimal}
                                canRegister={canOperate}
                                limit={5}
                                refreshKey={refreshKey}
                                onRequestCreate={() => setSanitaryOpen(true)}
                                onViewAll={() => setHistoryOpen(true)}
                            />
                        </PanelCard>

                        <PanelCard
                            title="Diagnóstico de ingreso"
                            description="Estado general de salud y observaciones veterinarias."
                        >
                            <AnimalDiagnosisPanel
                                idAnimal={idAnimal}
                                canDiagnose={canOperate}
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
                    </div>
                </TabsContent>

                <TabsContent value="socializacion">
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
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
                </TabsContent>
            </Tabs>

            <AnimalCheckupSheet
                idAnimal={idAnimal}
                open={checkupOpen}
                onClose={() => setCheckupOpen(false)}
                onSaved={refresh}
            />
            <AnimalSanitaryEventSheet
                idAnimal={idAnimal}
                open={sanitaryOpen}
                onClose={() => setSanitaryOpen(false)}
                onSaved={refresh}
            />
            <AnimalClinicalHistorySheet
                idAnimal={idAnimal}
                initialRecord={initialRecord}
                refreshKey={refreshKey}
                open={historyOpen}
                onClose={() => setHistoryOpen(false)}
            />
            <AnimalQuarantineBottomSheet
                idAnimal={idAnimal}
                open={releaseOpen}
                onClose={() => setReleaseOpen(false)}
                onReleased={refresh}
            />
        </div>
    );
}
