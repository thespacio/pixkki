"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {AlertCircle, CheckCircle2, PawPrint, Plus} from "lucide-react";

import {completeOnboardingAction} from "@/modules/auth/action";
import {createSpaceAction} from "@/modules/spaces/actions";

interface OnboardingSpace {
    id: number;
    name: string;
    type: string;
    capacity: number;
}

interface Props {
    initialSpaces: OnboardingSpace[];
}

const SPACE_TYPES = ["Canil", "Gatera", "Cuarentena", "Rehabilitación", "Otro"];

/**
 * Asistente mínimo de configuración inicial (US30).
 * Reutiliza `createSpaceAction` para dar de alta los espacios del refugio y,
 * cuando hay al menos uno, marca el onboarding como completado.
 */
export default function OnboardingWizard({initialSpaces}: Props) {
    const router = useRouter();

    const [spaces, setSpaces] = useState<OnboardingSpace[]>(initialSpaces);

    const [type, setType] = useState("");
    const [name, setName] = useState("");
    const [capacity, setCapacity] = useState(1);
    const [description, setDescription] = useState("");

    const [saving, setSaving] = useState(false);
    const [finishing, setFinishing] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleAddSpace = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!type) {
            setError("Selecciona el tipo de espacio.");
            return;
        }

        setSaving(true);

        try {
            const result = await createSpaceAction({
                name,
                type,
                capacity,
                description: description.trim() ? description.trim() : null,
                available: true,
            });

            if (!result.success || !result.data) {
                setError(result.error ?? "Error al crear el espacio");
                return;
            }

            setSpaces((prev) => [
                ...prev,
                {
                    id: result.data.id,
                    name: result.data.name,
                    type: result.data.type,
                    capacity: result.data.capacity,
                },
            ]);

            setName("");
            setCapacity(1);
            setDescription("");
            setType("");
            setMessage("Espacio agregado. Puedes añadir otro o finalizar.");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Error inesperado al crear el espacio"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleFinish = async () => {
        setError("");
        setFinishing(true);

        try {
            const result = await completeOnboardingAction();

            if (!result.success) {
                setError(result.message);
                return;
            }

            router.replace("/dashboard");
            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Error al completar la configuración inicial"
            );
        } finally {
            setFinishing(false);
        }
    };

    return (
        <div className="max-w-2xl w-full space-y-8">
            <div>
                <div className="flex items-center gap-2 text-primary mb-2 mt-16">
                    <PawPrint size={20}/>
                    <span className="text-xs font-semibold uppercase tracking-wide">
                        Configuración inicial
                    </span>
                </div>
                <h1 className="text-3xl font-semibold text-foreground tracking-tight mb-2">
                    Configura tu albergue
                </h1>
                <p className="text-sm text-muted-foreground">
                    Registra al menos un espacio (canil, gatera, cuarentena…) para
                    empezar a recibir animales. Podrás añadir más desde el panel.
                </p>
            </div>

            {/* Espacios ya registrados */}
            <div className="rounded-2xl border border-border bg-card p-5">
                <h2 className="text-sm font-semibold text-foreground mb-3">
                    Espacios registrados
                </h2>

                {spaces.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Aún no hay espacios. Agrega el primero con el formulario de
                        abajo.
                    </p>
                ) : (
                    <ul className="space-y-2">
                        {spaces.map((space) => (
                            <li
                                key={space.id}
                                className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm">
                                <span className="flex items-center gap-2 text-foreground">
                                    <CheckCircle2 size={16} className="text-primary"/>
                                    {space.name}
                                </span>
                                <span className="text-muted-foreground">
                                    {space.type} · {space.capacity} lugares
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Alta de espacio */}
            <form
                onSubmit={handleAddSpace}
                className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <h2 className="text-sm font-semibold text-foreground">
                    Agregar espacio
                </h2>

                <div>
                    <label
                        className="block text-xs font-semibold text-foreground mb-1.5"
                        htmlFor="spaceType">
                        Tipo de espacio
                    </label>
                    <select
                        id="spaceType"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full px-4 py-3 text-sm bg-background border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/25">
                        <option value="">Seleccionar tipo</option>
                        {SPACE_TYPES.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label
                        className="block text-xs font-semibold text-foreground mb-1.5"
                        htmlFor="spaceName">
                        Nombre del espacio
                    </label>
                    <input
                        id="spaceName"
                        type="text"
                        required
                        minLength={3}
                        maxLength={100}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej. Canil A"
                        className="w-full px-4 py-3 text-sm bg-background border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/25 placeholder:text-muted-foreground"
                    />
                </div>

                <div>
                    <label
                        className="block text-xs font-semibold text-foreground mb-1.5"
                        htmlFor="spaceCapacity">
                        Capacidad
                    </label>
                    <input
                        id="spaceCapacity"
                        type="number"
                        required
                        min={1}
                        max={9999}
                        step={1}
                        value={capacity}
                        onChange={(e) => setCapacity(Number(e.target.value))}
                        onKeyDown={(e) => {
                            if (["-", "e", "E", "+", "."].includes(e.key)) {
                                e.preventDefault();
                            }
                        }}
                        className="w-full px-4 py-3 text-sm bg-background border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/25"
                    />
                </div>

                <div>
                    <label
                        className="block text-xs font-semibold text-foreground mb-1.5"
                        htmlFor="spaceDescription">
                        Descripción (opcional)
                    </label>
                    <input
                        id="spaceDescription"
                        type="text"
                        maxLength={500}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Descripción del espacio"
                        className="w-full px-4 py-3 text-sm bg-background border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/25 placeholder:text-muted-foreground"
                    />
                </div>

                {error && (
                    <div
                        className="flex items-start gap-2 p-3 rounded-xl text-xs"
                        style={{backgroundColor: "#FDF2EA", color: "#E8A87C"}}>
                        <AlertCircle size={13} className="flex-shrink-0 mt-0.5"/>
                        {error}
                    </div>
                )}

                {message && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                        {message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 cursor-pointer rounded-xl text-sm font-semibold border border-border hover:bg-muted transition-colors disabled:opacity-60">
                    <Plus size={16}/>
                    {saving ? "Agregando..." : "Agregar espacio"}
                </button>
            </form>

            <button
                type="button"
                onClick={handleFinish}
                disabled={finishing || spaces.length === 0}
                className="w-full py-3 cursor-pointer rounded-xl text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{backgroundColor: "#43AE6D"}}>
                {finishing ? "Guardando..." : "Finalizar configuración"}
            </button>

            {spaces.length === 0 && (
                <p className="text-xs text-muted-foreground text-center -mt-4">
                    Necesitas registrar al menos un espacio para continuar.
                </p>
            )}
        </div>
    );
}
