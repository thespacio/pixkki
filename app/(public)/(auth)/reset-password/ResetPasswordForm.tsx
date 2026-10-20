"use client";

import { useEffect, useState } from "react";
import {getSupabaseBrowserClient} from "@/lib/supabase/browser-client";
import {resetPasswordAction, sendPasswordResetAction} from "@/modules/auth/action";
import {Button} from "@/components/ui/button";
import {ArrowLeft, Eye, EyeOff} from "lucide-react";
import {useRouter} from "next/navigation";
export default function ResetPasswordForm() {
    const [ready, setReady] = useState(false);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const initializeRecoverySession = async () => {
            try {
                const hash = window.location.hash.substring(1);
                const params = new URLSearchParams(hash);
                const accessToken = params.get("access_token");
                const refreshToken = params.get("refresh_token");

                if (!accessToken || !refreshToken) {
                    // Si no hay tokens, redirigir al login
                    router.push("/login");
                    return;
                }

                const supabase = getSupabaseBrowserClient();

                const { error } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                });

                if (error) {
                    console.error(error);
                    setError("Error al establecer la sesión. Por favor, intenta nuevamente.");
                    // Limpia la URL para que no se quede con los tokens
                    window.history.replaceState({}, "", window.location.pathname);
                    // No redirigimos, mostramos el error al usuario
                    setReady(true);
                    return;
                }

                // Limpia la URL
                window.history.replaceState(
                    {},
                    "",
                    window.location.pathname
                );

                setReady(true);
            } catch (err) {
                console.error(err);
                setError("Error al inicializar la recuperación");
                setReady(true);
            }
        };

        initializeRecoverySession();
    }, [router]);

    if (!ready) {
        return (
            <div className="w-full space-y-6">
                <p>Preparando recuperación...</p>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validación básica
        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const result = await resetPasswordAction(password);

            if (!result.success) {
                setError(result.message);
                return;
            }

            setMessage("Contraseña actualizada exitosamente");

            // Redirigir al login después de un breve delay para que el usuario vea el mensaje
            setTimeout(() => {
                router.push("/login");
            }, 1500);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al restablecer contraseña');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full space-y-6">
            <h1 className="text-2xl font-bold">
                Restablecer contraseña
            </h1>

            {message && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                    {message}
                </div>
            )}

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                    <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nueva contraseña (mínimo 6 caracteres)"
                        className="w-full px-4 py-3 pr-11 text-sm bg-card border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/25 placeholder:text-muted-foreground transition-shadow"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                </div>

                <Button
                    type="submit"
                    disabled={loading || !password}
                    className="w-full py-3 cursor-pointer rounded-xl text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60 mt-2 flex items-center justify-center gap-2"
                >
                    {loading ? 'Actualizando...' : 'Actualizar contraseña'}
                </Button>

                <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="flex items-center gap-2 text-sm cursor-pointer text-muted-foreground hover:text-foreground transition-colors mt-12"
                >
                    <ArrowLeft size={14} />
                    Volver al login
                </button>
            </form>
        </div>
    );
}