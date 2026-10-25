"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { updateCampaignAction } from "@/modules/campaigns/actions/campaign.actions";
import { CAMPAIGN_LIMITS, type Campaign } from "@/modules/campaigns/types";
import { animalSummary, hashtagsToText, textToHashtags } from "@/modules/campaigns/format";

type Props = {
    campaign: Campaign;
    onClose: () => void;
    onSaved: (campaign: Campaign) => void;
};

const INPUT_CLS =
    "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";
const LABEL_CLS = "block text-xs font-medium text-foreground mb-1";

export function EditCampaignModal({ campaign, onClose, onSaved }: Props) {
    const [title, setTitle] = useState(campaign.title);
    const [content, setContent] = useState(campaign.content);
    const [hashtags, setHashtags] = useState(hashtagsToText(campaign.hashtags));
    const [callToAction, setCallToAction] = useState(campaign.callToAction ?? "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const savingRef = useRef(saving);
    savingRef.current = saving;
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !savingRef.current) onCloseRef.current();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const result = await updateCampaignAction({
                id: campaign.id,
                title,
                content,
                hashtags: textToHashtags(hashtags),
                callToAction: callToAction.trim() === "" ? null : callToAction,
            });

            if (!result.success) {
                setError(result.error);
                return;
            }

            onSaved(result.data);
            onClose();
        } catch {
            setError("No se pudo conectar con el servidor. Intenta de nuevo.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
            onClick={() => !saving && onClose()}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-campaign-title"
                className="bg-background rounded-2xl border border-border w-full max-w-2xl p-6 shadow-xl my-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-5">
                    <h3 id="edit-campaign-title" className="text-lg font-semibold text-foreground">
                        Editar campaña
                    </h3>
                    <button
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Cerrar"
                        className="text-muted-foreground hover:text-foreground disabled:opacity-50"
                    >
                        <X size={18} />
                    </button>
                </div>

                {campaign.status === "publicada" && (
                    <p className="mb-4 px-4 py-3 rounded-xl text-sm bg-amber-50 border border-amber-200 text-amber-800">
                        Esta campaña está publicada: los cambios se verán en la landing al guardar.
                    </p>
                )}

                {error && (
                    <div
                        role="alert"
                        className="mb-4 px-4 py-3 rounded-xl text-sm bg-red-50 border border-red-200 text-red-700"
                    >
                        {error}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4" noValidate>
                    <div>
                        <label htmlFor="ec-title" className={LABEL_CLS}>Título</label>
                        <input
                            id="ec-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={CAMPAIGN_LIMITS.title.max}
                            className={INPUT_CLS}
                        />
                    </div>

                    <div>
                        <label htmlFor="ec-content" className={LABEL_CLS}>Texto</label>
                        <textarea
                            id="ec-content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={7}
                            maxLength={CAMPAIGN_LIMITS.content.max}
                            className={`${INPUT_CLS} resize-y`}
                        />
                        <p className="mt-1 text-[11px] text-muted-foreground text-right">
                            {content.length} / {CAMPAIGN_LIMITS.content.max}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label htmlFor="ec-tags" className={LABEL_CLS}>Hashtags</label>
                            <input
                                id="ec-tags"
                                value={hashtags}
                                onChange={(e) => setHashtags(e.target.value)}
                                placeholder="#Adopta #SinHogar"
                                className={INPUT_CLS}
                            />
                        </div>
                        <div>
                            <label htmlFor="ec-cta" className={LABEL_CLS}>Llamado a la acción</label>
                            <input
                                id="ec-cta"
                                value={callToAction}
                                onChange={(e) => setCallToAction(e.target.value)}
                                maxLength={CAMPAIGN_LIMITS.callToAction.max}
                                className={INPUT_CLS}
                            />
                        </div>
                    </div>

                    <div>
                        <p className={LABEL_CLS}>Animales de esta campaña</p>
                        <div className="flex flex-wrap gap-1.5">
                            {campaign.animals.map((a) => (
                                <span
                                    key={a.idAnimal}
                                    className="text-[11px] px-2 py-0.5 rounded-md bg-secondary text-foreground font-medium"
                                >
                                    {animalSummary(a)}
                                </span>
                            ))}
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Los animales no se pueden cambiar: para otros animales, archiva esta campaña y crea una nueva.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-60"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition"
                            style={{ backgroundColor: "#43AE6D" }}
                        >
                            {saving ? "Guardando..." : "Guardar cambios"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
