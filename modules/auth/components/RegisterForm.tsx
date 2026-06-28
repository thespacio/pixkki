'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import {AlertCircle, Eye, EyeOff, UserPlus} from "lucide-react";
import { getSupabaseBrowserClient } from "../../../app/lib/supabase/browser-client";
import {error} from "next/dist/build/output/log";

export function RegisterForm() {
    const router = useRouter();
    const supabase = getSupabaseBrowserClient();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);


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
        <div
            className=""
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
            {/* Texto superior */}
            <h1 className="text-3xl font-semibold text-foreground tracking-tight mb-2">
                Crear cuenta
            </h1>
            <p className="text-sm text-muted-foreground mb-8">
                Regístrate para comenzar
            </p>

            {/* Botón Google */}
            <button
                type="button"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 mb-8 rounded-md bg-secondary px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60 cursor-pointer"
            >
                {/* Google Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
                    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.3-.4-3.5z" />
                    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z" />
                    <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.3l-6.3-5.3c-2.1 1.6-4.7 2.6-7.3 2.6-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.5 16.2 44 24 44z" />
                    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.5-2.4 4.6-4.6 6.1l.1-.1 6.3 5.3C36.7 39.6 44 34 44 24c0-1.3-.1-2.3-.4-3.5z" />
                </svg>

                Registrarse con Google
            </button>

            {/* Separador */}
            <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
      <span className="bg-background px-2 text-muted-foreground">
        o regístrate con correo
      </span>
                </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">

                {/* Email */}
                <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Correo electrónico
                    </label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="amara@pixkki.com"
                        className="w-full px-4 py-3 text-sm bg-card border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/25 placeholder:text-muted-foreground transition-shadow"
                    />
                </div>

                {/* Password */}
                <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Contraseña
                    </label>

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••"
                            className="w-full px-4 py-3 pr-11 text-sm bg-card border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/25 placeholder:text-muted-foreground transition-shadow"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                    </div>
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Confirmar contraseña
                    </label>

                    <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••"
                        className="w-full px-4 py-3 text-sm bg-card border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/25 placeholder:text-muted-foreground transition-shadow"
                    />
                </div>

                {/* Error */}
                {/*{error() && (
                    <div
                        className="flex items-start gap-2 p-3 rounded-xl text-xs"
                        style={{ backgroundColor: "#FDF2EA", color: "#E8A87C" }}
                    >
                        <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />

                    </div>
                )}*/}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60 mt-2 flex items-center justify-center gap-2 cursor-pointer"
                    style={{ backgroundColor: "#43AE6D" }}
                >
                    {loading ? "Creando cuenta..." : "Crear cuenta"}
                </button>
            </form>
        </div>
    );
}