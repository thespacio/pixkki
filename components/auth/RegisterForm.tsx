'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export function RegisterForm() {
    const router = useRouter();
    const supabase = getSupabaseBrowserClient();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        setStatus("");

        if (password !== confirmPassword) {
            setStatus("Las contraseñas no coinciden.");
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        setLoading(false);

        if (error) {
            setStatus(error.message);
            return;
        }

        setStatus(
            "Cuenta creada correctamente. Revisa tu correo electrónico para confirmar tu cuenta."
        );
    }

    async function handleGoogleRegister() {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    }

    return (
        <div className="rounded-xl border bg-card p-8 shadow-lg">

            <h1 className="mb-2 text-3xl font-bold">
                Crear cuenta
            </h1>

            <p className="mb-6 text-muted-foreground">
                Regístrate para acceder a la plataforma.
            </p>

            <button
                type="button"
                onClick={handleGoogleRegister}
                className="mb-6 flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2 hover:bg-muted"
            >
                Continuar con Google
            </button>

            <div className="mb-6 flex items-center">
                <div className="flex-1 border-t"></div>
                <span className="mx-3 text-xs text-muted-foreground">
          O
        </span>
                <div className="flex-1 border-t"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

                <input
                    type="email"
                    required
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border p-3"
                />

                <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border p-3"
                />

                <input
                    type="password"
                    required
                    placeholder="Confirmar contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-md border p-3"
                />

                {status && (
                    <p className="text-sm text-center text-red-500">
                        {status}
                    </p>
                )}

                <button
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-50"
                >
                    <UserPlus size={18} />

                    {loading
                        ? "Creando cuenta..."
                        : "Crear cuenta"}
                </button>

            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
                ¿Ya tienes cuenta?

                <button
                    onClick={() => router.push("/auth/login")}
                    className="ml-1 text-primary hover:underline"
                >
                    Inicia sesión
                </button>
            </p>

        </div>
    );
}