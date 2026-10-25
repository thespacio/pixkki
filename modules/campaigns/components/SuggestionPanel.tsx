"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Loader2, RefreshCw, Sparkles, X } from "lucide-react";
import {
    createCampaignAction,
    generateCampaignSuggestionsAction,
} from "@/modules/campaigns/actions/campaign.actions";
import {
    CAMPAIGN_LIMITS,
    CAMPAIGN_TONES,
    CAMPAIGN_TONE_LABELS,
    type AdoptableAnimal,
    type Campaign,
    type CampaignTone,
} from "@/modules/campaigns/types";
import { animalLabel, hashtagsToText, textToHashtags } from "@/modules/campaigns/format";

export type ShelterOption = { id: number; nombre: string };

type Props = {
    adoptable: AdoptableAnimal[];
    /** Solo superadmin: albergues entre los que elegir. Vacío = se usa el albergue del usuario. */
    shelters: ShelterOption[];
    onClose: () => void;
    onSaved: (campaign: Campaign) => void;
};

type Draft = {
    key: string;
    title: string;
    content: string;
    hashtags: string;
    callToAction: string;
    animalIds: number[];
    saving: boolean;
    saved: boolean;
    error: string | null;
};

type Batch = { shelterId: number; model: string; drafts: Draft[] };

const INPUT_CLS =
    "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";
const LABEL_CLS = "block text-xs font-medium text-foreground mb-1";

export function SuggestionPanel({ adoptable, shelters, onClose, onSaved }: Props) {
    const chooseShelter = shelters.length > 0;

    const [shelterId, setShelterId] = useState("");
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [count, setCount] = useState(3);
    const [tone, setTone] = useState<CampaignTone>("cercano");
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [batch, setBatch] = useState<Batch | null>(null);

    const busy = generating || (batch?.drafts.some((d) => d.saving) ?? false);
    const busyRef = useRef(busy);
    busyRef.current = busy;
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    // Escape cierra el panel, salvo mientras se genera o se guarda algo.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !busyRef.current) onCloseRef.current();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    const visibleAnimals = useMemo(
        () => (chooseShelter ? adoptable.filter((a) => String(a.shelterId) === shelterId) : adoptable),
        [adoptable, chooseShelter, shelterId],
    );

    const animalById = useMemo(() => new Map(adoptable.map((a) => [a.idAnimal, a])), [adoptable]);

    function toggleAnimal(id: number) {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function changeShelter(value: string) {
        setShelterId(value);
        setSelected(new Set()); // los animales elegidos pertenecían al otro albergue
        setBatch(null);
        setError(null);
    }

    async function generate() {
        setError(null);

        if (chooseShelter && shelterId === "") {
            setError("Elige un albergue.");
            return;
        }
        if (visibleAnimals.length === 0) {
            setError(
                "No hay animales disponibles para adopción en este albergue. " +
                "Marca al menos uno como \"disponible para adopción\" desde la sección Animales.",
            );
            return;
        }

        setGenerating(true);
        try {
            const result = await generateCampaignSuggestionsAction({
                count,
                tone,
                idRefugio: chooseShelter ? Number(shelterId) : undefined,
                animalIds: selected.size > 0 ? [...selected] : undefined,
            });

            if (!result.success) {
                setError(result.error);
                return;
            }

            setBatch({
                shelterId: result.data.shelterId,
                model: result.data.model,
                drafts: result.data.suggestions.map((s, i) => ({
                    key: `${Date.now()}-${i}`,
                    title: s.title,
                    content: s.content,
                    hashtags: hashtagsToText(s.hashtags),
                    callToAction: s.callToAction ?? "",
                    animalIds: s.animalIds,
                    saving: false,
                    saved: false,
                    error: null,
                })),
            });
        } catch {
            setError("No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.");
        } finally {
            setGenerating(false);
        }
    }

    function patchDraft(key: string, patch: Partial<Draft>) {
        setBatch((prev) =>
            prev ? { ...prev, drafts: prev.drafts.map((d) => (d.key === key ? { ...d, ...patch } : d)) } : prev,
        );
    }

    function discardDraft(key: string) {
        setBatch((prev) => (prev ? { ...prev, drafts: prev.drafts.filter((d) => d.key !== key) } : prev));
    }

    async function saveDraft(draft: Draft) {
        if (!batch) return;
        patchDraft(draft.key, { saving: true, error: null });

        try {
            const result = await createCampaignAction({
                title: draft.title,
                content: draft.content,
                hashtags: textToHashtags(draft.hashtags),
                callToAction: draft.callToAction.trim() === "" ? null : draft.callToAction,
                animalIds: draft.animalIds,
                idRefugio: batch.shelterId,
                generatedByAi: true,
                aiModel: batch.model,
            });

            if (!result.success) {
                patchDraft(draft.key, { saving: false, error: result.error });
                return;
            }

            patchDraft(draft.key, { saving: false, saved: true });
            onSaved(result.data);
        } catch {
            patchDraft(draft.key, {
                saving: false,
                error: "No se pudo conectar con el servidor. Intenta de nuevo.",
            });
        }
    }

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
            onClick={() => !busy && onClose()}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="suggestion-panel-title"
                className="bg-background rounded-2xl border border-border w-full max-w-3xl p-6 shadow-xl my-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between mb-5 gap-4">
                    <div>
                        <h3
                            id="suggestion-panel-title"
                            className="text-lg font-semibold text-foreground flex items-center gap-2"
                        >
                            <Sparkles size={18} className="text-primary" aria-hidden="true" />
                            Generar publicaciones con IA
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            La IA propone textos sobre animales disponibles para adopción. Tú los revisas, los
                            editas y decides cuáles guardar.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={busy}
                        aria-label="Cerrar"
                        className="text-muted-foreground hover:text-foreground disabled:opacity-50"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* ---------------- Opciones ---------------- */}
                <div className="space-y-4">
                    {chooseShelter && (
                        <div>
                            <label htmlFor="sg-shelter" className={LABEL_CLS}>Albergue *</label>
                            <select
                                id="sg-shelter"
                                value={shelterId}
                                onChange={(e) => changeShelter(e.target.value)}
                                disabled={generating}
                                className={INPUT_CLS}
                            >
                                <option value="">Seleccionar...</option>
                                {shelters.map((s) => (
                                    <option key={s.id} value={s.id}>{s.nombre}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label htmlFor="sg-tone" className={LABEL_CLS}>Tono</label>
                            <select
                                id="sg-tone"
                                value={tone}
                                onChange={(e) => setTone(e.target.value as CampaignTone)}
                                disabled={generating}
                                className={INPUT_CLS}
                            >
                                {CAMPAIGN_TONES.map((t) => (
                                    <option key={t} value={t}>{CAMPAIGN_TONE_LABELS[t]}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="sg-count" className={LABEL_CLS}>Cantidad de sugerencias</label>
                            <select
                                id="sg-count"
                                value={count}
                                onChange={(e) => setCount(Number(e.target.value))}
                                disabled={generating}
                                className={INPUT_CLS}
                            >
                                {Array.from(
                                    { length: CAMPAIGN_LIMITS.suggestions.max },
                                    (_, i) => i + CAMPAIGN_LIMITS.suggestions.min,
                                ).map((n) => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <fieldset disabled={generating} className="rounded-2xl border border-border p-4">
                        <legend className="px-2 text-xs font-bold uppercase tracking-widest text-primary">
                            Animales (opcional)
                        </legend>
                        <p className="text-xs text-muted-foreground mb-3">
                            {selected.size === 0
                                ? "Si no eliges ninguno, la IA decide entre todos los que están en adopción."
                                : `${selected.size} elegido${selected.size === 1 ? "" : "s"}: la IA solo hablará de ellos.`}
                        </p>

                        {chooseShelter && shelterId === "" ? (
                            <p className="text-sm text-muted-foreground">Primero elige un albergue.</p>
                        ) : visibleAnimals.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No hay animales disponibles para adopción en este albergue.
                            </p>
                        ) : (
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 max-h-44 overflow-y-auto">
                                {visibleAnimals.map((a) => (
                                    <li key={a.idAnimal}>
                                        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selected.has(a.idAnimal)}
                                                onChange={() => toggleAnimal(a.idAnimal)}
                                                className="w-4 h-4 rounded accent-primary"
                                            />
                                            <span className="truncate">
                                                {animalLabel({ nombre: a.nombre, especie: a.especie })}
                                                {a.nombre ? ` · ${a.especie}` : ""}
                                            </span>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </fieldset>

                    {error && (
                        <div
                            role="alert"
                            className="px-4 py-3 rounded-xl text-sm bg-red-50 border border-red-200 text-red-700"
                        >
                            {error}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={generate}
                        disabled={generating}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition flex items-center justify-center gap-2"
                        style={{ backgroundColor: "#43AE6D" }}
                    >
                        {generating ? (
                            <>
                                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                                Gemini está redactando…
                            </>
                        ) : batch ? (
                            <>
                                <RefreshCw size={14} aria-hidden="true" />
                                Generar otras sugerencias
                            </>
                        ) : (
                            <>
                                <Sparkles size={14} aria-hidden="true" />
                                Generar sugerencias
                            </>
                        )}
                    </button>
                    {generating && (
                        <p role="status" className="text-xs text-center text-muted-foreground">
                            Esto puede tardar unos segundos.
                        </p>
                    )}
                </div>

                {/* ---------------- Resultados ---------------- */}
                {batch && (
                    <section aria-label="Sugerencias" className="mt-6 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-primary">
                            Sugerencias · revísalas antes de guardar
                        </h4>

                        {batch.drafts.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                Descartaste todas las sugerencias. Genera otras cuando quieras.
                            </p>
                        )}

                        {batch.drafts.map((draft, index) => (
                            <article
                                key={draft.key}
                                aria-label={`Sugerencia ${index + 1}`}
                                className="rounded-2xl border border-border bg-card p-4 space-y-3"
                            >
                                <div>
                                    <label htmlFor={`${draft.key}-title`} className={LABEL_CLS}>Título</label>
                                    <input
                                        id={`${draft.key}-title`}
                                        value={draft.title}
                                        onChange={(e) => patchDraft(draft.key, { title: e.target.value })}
                                        disabled={draft.saved || draft.saving}
                                        maxLength={CAMPAIGN_LIMITS.title.max}
                                        className={INPUT_CLS}
                                    />
                                </div>

                                <div>
                                    <label htmlFor={`${draft.key}-content`} className={LABEL_CLS}>Texto</label>
                                    <textarea
                                        id={`${draft.key}-content`}
                                        value={draft.content}
                                        onChange={(e) => patchDraft(draft.key, { content: e.target.value })}
                                        disabled={draft.saved || draft.saving}
                                        rows={5}
                                        maxLength={CAMPAIGN_LIMITS.content.max}
                                        className={`${INPUT_CLS} resize-y`}
                                    />
                                    <p className="mt-1 text-[11px] text-muted-foreground text-right">
                                        {draft.content.length} / {CAMPAIGN_LIMITS.content.max}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label htmlFor={`${draft.key}-tags`} className={LABEL_CLS}>Hashtags</label>
                                        <input
                                            id={`${draft.key}-tags`}
                                            value={draft.hashtags}
                                            onChange={(e) => patchDraft(draft.key, { hashtags: e.target.value })}
                                            disabled={draft.saved || draft.saving}
                                            placeholder="#Adopta #SinHogar"
                                            className={INPUT_CLS}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor={`${draft.key}-cta`} className={LABEL_CLS}>Llamado a la acción</label>
                                        <input
                                            id={`${draft.key}-cta`}
                                            value={draft.callToAction}
                                            onChange={(e) => patchDraft(draft.key, { callToAction: e.target.value })}
                                            disabled={draft.saved || draft.saving}
                                            maxLength={CAMPAIGN_LIMITS.callToAction.max}
                                            className={INPUT_CLS}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5" aria-label="Animales de la sugerencia">
                                    {draft.animalIds.map((id) => {
                                        const animal = animalById.get(id);
                                        return (
                                            <span
                                                key={id}
                                                className="text-[11px] px-2 py-0.5 rounded-md bg-secondary text-foreground font-medium"
                                            >
                                                {animal ? animalLabel({ nombre: animal.nombre, especie: animal.especie }) : `Animal ${id}`}
                                            </span>
                                        );
                                    })}
                                </div>

                                {draft.error && (
                                    <div
                                        role="alert"
                                        className="px-3 py-2 rounded-xl text-sm bg-red-50 border border-red-200 text-red-700"
                                    >
                                        {draft.error}
                                    </div>
                                )}

                                <div className="flex items-center justify-end gap-2">
                                    {draft.saved ? (
                                        <span
                                            role="status"
                                            className="inline-flex items-center gap-1.5 text-sm text-green-700"
                                        >
                                            <CheckCircle2 size={14} aria-hidden="true" />
                                            Guardada como borrador
                                        </span>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => discardDraft(draft.key)}
                                                disabled={draft.saving}
                                                className="px-3 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-secondary disabled:opacity-60"
                                            >
                                                Descartar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => saveDraft(draft)}
                                                disabled={draft.saving}
                                                className="px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                                                style={{ backgroundColor: "#43AE6D" }}
                                            >
                                                {draft.saving ? "Guardando..." : "Guardar borrador"}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </article>
                        ))}
                    </section>
                )}
            </div>
        </div>
    );
}
