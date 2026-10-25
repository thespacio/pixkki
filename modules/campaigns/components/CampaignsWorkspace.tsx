"use client";

import { useMemo, useState, useTransition } from "react";
import { Building2, Megaphone, Sparkles, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SuggestionPanel, type ShelterOption } from "@/modules/campaigns/components/SuggestionPanel";
import { EditCampaignModal } from "@/modules/campaigns/components/EditCampaignModal";
import {
    deleteCampaignAction,
    setCampaignStatusAction,
} from "@/modules/campaigns/actions/campaign.actions";
import {
    CAMPAIGN_STATUSES,
    type AdoptableAnimal,
    type Campaign,
    type CampaignStatus,
} from "@/modules/campaigns/types";
import { STATUS_LABELS, animalSummary, hashtagsToText } from "@/modules/campaigns/format";

type Props = {
    campaigns: Campaign[];
    adoptable: AdoptableAnimal[];
    /** Solo superadmin: albergues entre los que elegir. */
    shelters: ShelterOption[];
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    /** ¿Está configurada la clave de Gemini en el servidor? */
    aiConfigured: boolean;
};

type Feedback = { type: "ok" | "error"; msg: string };

const TAB_ORDER: CampaignStatus[] = ["borrador", "publicada", "archivada"];

const STATUS_STYLES: Record<CampaignStatus, string> = {
    borrador: "bg-amber-100 text-amber-800",
    publicada: "bg-green-100 text-green-700",
    archivada: "bg-secondary text-muted-foreground",
};

const EMPTY_MESSAGES: Record<CampaignStatus, string> = {
    borrador: "No tienes borradores. Genera sugerencias con IA para empezar.",
    publicada: "Todavía no hay campañas publicadas. Publica un borrador para que aparezca en la landing.",
    archivada: "No hay campañas archivadas.",
};

function formatDate(value: string | null): string | null {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

export function CampaignsWorkspace({
    campaigns,
    adoptable,
    shelters,
    canCreate,
    canEdit,
    canDelete,
    aiConfigured,
}: Props) {
    const counts = useMemo(() => {
        const base: Record<CampaignStatus, number> = { borrador: 0, publicada: 0, archivada: 0 };
        for (const c of campaigns) base[c.status] += 1;
        return base;
    }, [campaigns]);

    // Abre en la primera pestaña que tenga contenido (borradores, luego publicadas...).
    const [tab, setTab] = useState<CampaignStatus>(
        () => TAB_ORDER.find((s) => campaigns.some((c) => c.status === s)) ?? "borrador",
    );
    const [panelOpen, setPanelOpen] = useState(false);
    const [editing, setEditing] = useState<Campaign | null>(null);
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [pendingId, setPendingId] = useState<number | null>(null);
    const [, startTransition] = useTransition();

    const visible = campaigns.filter((c) => c.status === tab);
    const showShelter = shelters.length > 0;

    function changeStatus(campaign: Campaign, status: CampaignStatus, okMessage: string) {
        setFeedback(null);
        setPendingId(campaign.id);
        startTransition(async () => {
            const result = await setCampaignStatusAction({ id: campaign.id, status });
            setPendingId(null);
            setFeedback(
                result.success ? { type: "ok", msg: okMessage } : { type: "error", msg: result.error },
            );
        });
    }

    function remove(campaign: Campaign) {
        if (!confirm(`¿Eliminar la campaña "${campaign.title}"? Esta acción no se puede deshacer.`)) return;
        setFeedback(null);
        setPendingId(campaign.id);
        startTransition(async () => {
            const result = await deleteCampaignAction(campaign.id);
            setPendingId(null);
            setFeedback(
                result.success
                    ? { type: "ok", msg: "Campaña eliminada" }
                    : { type: "error", msg: result.error },
            );
        });
    }

    return (
        <>
            <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Campañas</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Publicaciones para encontrar hogar a los animales en adopción.
                    </p>
                </div>
                {canCreate && (
                    <Button
                        onClick={() => setPanelOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition"
                        style={{ backgroundColor: "#43AE6D" }}
                    >
                        <Sparkles size={15} aria-hidden="true" /> Generar con IA
                    </Button>
                )}
            </div>

            {canCreate && !aiConfigured && (
                <div
                    role="note"
                    className="mb-5 flex items-start gap-2 px-4 py-3 rounded-xl text-sm bg-amber-50 border border-amber-200 text-amber-800"
                >
                    <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <span>
                        La IA aún no está configurada. Agrega <code>GEMINI_API_KEY</code> al archivo{" "}
                        <code>.env</code> del servidor y reinícialo para poder generar sugerencias.
                    </span>
                </div>
            )}

            {feedback && (
                <div
                    role={feedback.type === "error" ? "alert" : "status"}
                    className={`mb-5 px-4 py-3 rounded-xl text-sm ${
                        feedback.type === "ok"
                            ? "bg-green-50 border border-green-200 text-green-700"
                            : "bg-red-50 border border-red-200 text-red-700"
                    }`}
                >
                    {feedback.msg}
                </div>
            )}

            <div role="tablist" aria-label="Estado de las campañas" className="flex gap-1 mb-6 border-b border-border">
                {TAB_ORDER.map((status) => (
                    <button
                        key={status}
                        role="tab"
                        aria-selected={tab === status}
                        onClick={() => setTab(status)}
                        className={`px-4 py-2.5 text-sm font-medium -mb-px border-b-2 transition-colors ${
                            tab === status
                                ? "border-primary text-foreground"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        {STATUS_LABELS[status]}
                        <span className="ml-2 text-xs rounded-full bg-secondary px-2 py-0.5">{counts[status]}</span>
                    </button>
                ))}
            </div>

            {visible.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    <Megaphone size={40} className="mx-auto mb-3 opacity-30" aria-hidden="true" />
                    <p className="font-medium">{EMPTY_MESSAGES[tab]}</p>
                </div>
            ) : (
                <ul className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {visible.map((campaign) => {
                        const pending = pendingId === campaign.id;
                        const date =
                            campaign.status === "publicada"
                                ? `Publicada el ${formatDate(campaign.publishedAt) ?? "—"}`
                                : `Creada el ${formatDate(campaign.createdAt) ?? "—"}`;

                        return (
                            <li key={campaign.id}>
                                <article
                                    aria-label={campaign.title}
                                    className="h-full flex flex-col rounded-2xl border border-border bg-card p-5"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <h2 className="font-semibold text-foreground leading-snug">{campaign.title}</h2>
                                        <span
                                            className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[campaign.status]}`}
                                        >
                                            {STATUS_LABELS[campaign.status]}
                                        </span>
                                    </div>

                                    <div className="mt-1 flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
                                        <span>{date}</span>
                                        {campaign.generatedByAi && (
                                            <span className="inline-flex items-center gap-1">
                                                <Sparkles size={11} aria-hidden="true" /> Sugerida por IA
                                            </span>
                                        )}
                                        {showShelter && campaign.shelterName && (
                                            <span className="inline-flex items-center gap-1">
                                                <Building2 size={11} aria-hidden="true" /> {campaign.shelterName}
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-3 text-sm text-foreground whitespace-pre-line line-clamp-5">
                                        {campaign.content}
                                    </p>

                                    {campaign.hashtags.length > 0 && (
                                        <p className="mt-2 text-sm text-primary">{hashtagsToText(campaign.hashtags)}</p>
                                    )}
                                    {campaign.callToAction && (
                                        <p className="mt-2 text-sm italic text-muted-foreground">{campaign.callToAction}</p>
                                    )}

                                    <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Animales de la campaña">
                                        {campaign.animals.map((a) => (
                                            <li
                                                key={a.idAnimal}
                                                className="text-[11px] px-2 py-0.5 rounded-md bg-secondary text-foreground font-medium"
                                            >
                                                {animalSummary(a)}
                                            </li>
                                        ))}
                                    </ul>

                                    {(canEdit || canDelete) && (
                                        <div className="mt-auto pt-4">
                                        <div className="pt-4 border-t border-border flex flex-wrap gap-2">
                                            {canEdit && (
                                                <ActionButton disabled={pending} onClick={() => setEditing(campaign)}>
                                                    Editar
                                                </ActionButton>
                                            )}
                                            {canEdit && campaign.status === "borrador" && (
                                                <ActionButton
                                                    primary
                                                    disabled={pending}
                                                    onClick={() => changeStatus(campaign, "publicada", "Campaña publicada en la landing")}
                                                >
                                                    Publicar
                                                </ActionButton>
                                            )}
                                            {canEdit && campaign.status === "publicada" && (
                                                <>
                                                    <ActionButton
                                                        disabled={pending}
                                                        onClick={() => changeStatus(campaign, "borrador", "La campaña volvió a borrador y ya no se ve en la landing")}
                                                    >
                                                        Despublicar
                                                    </ActionButton>
                                                    <ActionButton
                                                        disabled={pending}
                                                        onClick={() => changeStatus(campaign, "archivada", "Campaña archivada")}
                                                    >
                                                        Archivar
                                                    </ActionButton>
                                                </>
                                            )}
                                            {canEdit && campaign.status === "archivada" && (
                                                <ActionButton
                                                    disabled={pending}
                                                    onClick={() => changeStatus(campaign, "borrador", "La campaña volvió a borradores")}
                                                >
                                                    Volver a borrador
                                                </ActionButton>
                                            )}
                                            {canDelete && (
                                                <ActionButton danger disabled={pending} onClick={() => remove(campaign)}>
                                                    Eliminar
                                                </ActionButton>
                                            )}
                                        </div>
                                        </div>
                                    )}
                                </article>
                            </li>
                        );
                    })}
                </ul>
            )}

            {panelOpen && (
                <SuggestionPanel
                    adoptable={adoptable}
                    shelters={shelters}
                    onClose={() => setPanelOpen(false)}
                    onSaved={() => {
                        setFeedback({ type: "ok", msg: "Borrador guardado. Revísalo en la pestaña Borradores y publícalo cuando esté listo." });
                        setTab("borrador");
                    }}
                />
            )}

            {editing && (
                <EditCampaignModal
                    campaign={editing}
                    onClose={() => setEditing(null)}
                    onSaved={() => setFeedback({ type: "ok", msg: "Cambios guardados" })}
                />
            )}
        </>
    );
}

function ActionButton({
    children,
    onClick,
    disabled,
    primary,
    danger,
}: {
    children: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    primary?: boolean;
    danger?: boolean;
}) {
    const style = primary
        ? "bg-primary text-primary-foreground hover:opacity-90 border-transparent"
        : danger
            ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
            : "border-border bg-card text-foreground hover:bg-secondary";

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition disabled:opacity-60 ${style}`}
        >
            {children}
        </button>
    );
}
