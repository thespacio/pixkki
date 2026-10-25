"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {AlertCircle} from "lucide-react";

import {acceptTermsAction} from "@/modules/auth/action";

/**
 * Aceptación de Términos y Condiciones (F-AUTH-05).
 * Checkbox obligatorio; el servidor registra versión + timestamp
 * de la aceptación de forma auditable.
 */
export default function AcceptTermsForm() {
    const router = useRouter();

    const [accepted, setAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!accepted) {
            setError("Debes aceptar los Términos y Condiciones.");
            return;
        }

        setLoading(true);

        try {
            const result = await acceptTermsAction({accepted});

            if (!result.success) {
                setError(result.message);
                return;
            }

            setMessage(result.message);

            setTimeout(() => {
                router.replace("/dashboard");
                router.refresh();
            }, 1000);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Error al aceptar los Términos y Condiciones"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md w-full space-y-8">
            <div>
                <h1 className="text-3xl font-semibold text-foreground tracking-tight mb-2 mt-16">
                    Términos y Condiciones
                </h1>
                <p className="text-sm text-muted-foreground mb-8">
                    Antes de acceder al panel debes leer y aceptar los términos
                    de uso de la plataforma.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                    La aceptación se registra con la versión vigente del
                    documento y la fecha y hora de tu aceptación, como parte del
                    contrato electrónico con Pixkki.
                </div>

                <label
                    className="flex items-start gap-3 text-sm text-foreground cursor-pointer"
                    htmlFor="acceptTerms">
                    <input
                        id="acceptTerms"
                        type="checkbox"
                        checked={accepted}
                        onChange={(e) => setAccepted(e.target.checked)}
                        className="mt-0.5 h-4 w-4 accent-[#43AE6D] cursor-pointer"
                    />
                    <span>
                        He leído y acepto los{" "}
                        <a
                            href="/terminos-condiciones"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:opacity-75 transition-opacity underline">
                            Términos y Condiciones
                        </a>{" "}
                        y el{" "}
                        <a
                            href="/aviso-privacidad"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:opacity-75 transition-opacity underline">
                            Aviso de privacidad
                        </a>
                        .
                    </span>
                </label>

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
                    disabled={loading || !accepted}
                    className="w-full py-3 cursor-pointer rounded-xl text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{backgroundColor: "#43AE6D"}}>
                    {loading ? "Registrando..." : "Aceptar y continuar"}
                </button>
            </form>
        </div>
    );
}
