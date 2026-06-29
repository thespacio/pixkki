"use client"

import {PawPrint, Eye, EyeOff, ArrowLeft, AlertCircle, ShieldCheck} from "lucide-react";
import { login } from "@/modules/auth/auth";
import { useRouter } from "next/navigation";
import {useState} from "react";
const logo = "/images/logo.png";



export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState("");
    const [showTwoFactor, setShowTwoFactor] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        await new Promise((r) => setTimeout(r, 700));

        // Primer paso: validar usuario y contraseña
        if (!showTwoFactor) {
            const loginOk =
                password === "pixkki2024";

            if (!loginOk) {
                setError("Correo o contraseña incorrectos.");
                setLoading(false);
                return;
            }

            // Mostrar el segundo paso
            setShowTwoFactor(true);
            setLoading(false);
            return;
        }

        // Segundo paso: validar código
        const twoFactorOk = twoFactorCode === "123456";

        if (!twoFactorOk) {
            setError("El código de autenticación es incorrecto.");
            setLoading(false);
            return;
        }

        // Todo correcto
        router.push("/dashboard");
    };

    return (
        <div
            className=""
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
            {/*Logo Y Título*/}
            <div className="flex items-center gap-2.5 mb-10">
                {/*Logo*/}
                <div className="w-9 h-9 px-1 py-1 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#43AE6D" }}>
                    <img src={logo} alt="Logo" />
                </div>
                <span className="text-lg font-semibold tracking-tight text-foreground">Sistema de Albergues</span>
            </div>

            {/*Texto Superior*/}
            <h1 className="text-3xl font-semibold text-foreground tracking-tight mb-2">Bienvenido de vuelta</h1>
            <p className="text-sm text-muted-foreground mb-8">Inicia sesión con tu cuenta</p>
            {/* Demo hint */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl mb-7 text-xs" style={{ backgroundColor: "#EAF3F6", color: "#6B9FAE" }}>
                        <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                        <span><span className="font-semibold">Demo access:</span> Usa cualquier email, y la contraseña <span className="font-mono font-semibold">pixkki2024</span></span>
            </div>
            {/* Botón de Google
            <button
                type="button"
                //onClick={handleGoogleLogin}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 mb-8 rounded-md bg-secondary px-4
                        py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted
                        disabled:opacity-60 cursor-pointer"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="h-5 w-5"
                >
                    <path
                        fill="#FFC107"
                        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.3-.4-3.5z"
                    />
                    <path
                        fill="#FF3D00"
                        d="M6.3 14.7l6.6 4.8C14.7 15 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z"
                    />
                    <path
                        fill="#4CAF50"
                        d="M24 44c5.2 0 10-2 13.6-5.3l-6.3-5.3c-2.1 1.6-4.7 2.6-7.3 2.6-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.5 16.2 44 24 44z"
                    />
                    <path
                        fill="#1976D2"
                        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.5-2.4 4.6-4.6 6.1l.1-.1 6.3 5.3C36.7 39.6 44 34 44 24c0-1.3-.1-2.3-.4-3.5z"
                    />
                </svg>
                Iniciar Sesión con Google
            </button>
             Separador
            <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-background px-2 text-muted-foreground">
                                o continúa con correo
                              </span>
                </div>
            </div>*/}
            {/*Form*/}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5" htmlFor="email">
                        Correo electrónico
                    </label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="amara@pixkki.com"
                        className="w-full px-4 py-3 text-sm bg-card border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/25 placeholder:text-muted-foreground transition-shadow"
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-foreground" htmlFor="password">Contraseña</label>
                        <button type="button" className="text-xs text-primary hover:opacity-75 transition-opacity">
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
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

                {/* Código de Google Authenticator */}
                {showTwoFactor && (
                    <div>
                        <label
                            htmlFor="twoFactorCode"
                            className="block text-sm font-medium text-foreground mb-2"
                        >
                            Código de autenticación
                        </label>

                        <input
                            id="twoFactorCode"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={twoFactorCode}
                            onChange={(e) =>
                                setTwoFactorCode(e.target.value.replace(/\D/g, ""))
                            }
                            placeholder="123456"
                            className="w-full px-4 py-3 text-sm bg-card border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/25"
                        />
                    </div>
                )}

                {error && (
                    <div className="flex items-start gap-2 p-3 rounded-xl text-xs" style={{ backgroundColor: "#FDF2EA", color: "#E8A87C" }}>
                        <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60 mt-2 flex items-center justify-center gap-2 cursor-pointer"
                    style={{ backgroundColor: "#43AE6D" }}
                >
                    {loading ? (
                        <>Cargando...</>
                    ) : showTwoFactor ? (
                        "Verificar código"
                    ) : (
                        "Continuar"
                    )}
                </button>
            </form>
            {/*Texto Inferior*/}
            {/*<p className="text-center text-xs text-muted-foreground mt-6">
                ¿Deseas adoptar?{" "}
                <button
                    onClick={() => router.push("/auth/adopcion")}
                    className="cursor-pointer font-semibold text-primary hover:opacity-75 transition-opacity">
                    Completa el formulario de adopción aquí
                </button>
            </p>*/}

        </div>
    );
}
