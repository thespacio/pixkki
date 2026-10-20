"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {AlertCircle, Eye, EyeOff} from "lucide-react";

import {changePasswordAction} from "@/modules/auth/action";

/**
 * Cambio obligatorio de contraseña en primer login (F-AUTH-03).
 * El usuario no puede acceder al dashboard hasta completar este formulario.
 */
export default function ChangePasswordForm() {
    const router = useRouter();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try {
            const result = await changePasswordAction({
                password,
                confirmPassword,
            });

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
                    : "Error al cambiar la contraseña"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md w-full space-y-8">
            <div>
                <h1 className="text-3xl font-semibold text-foreground tracking-tight mb-2 mt-16">
                    Cambia tu contraseña
                </h1>
                <p className="text-sm text-muted-foreground mb-8">
                    Estás iniciando sesión con una contraseña temporal. Crea una
                    contraseña propia para continuar al panel.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label
                        className="block text-xs font-semibold text-foreground mb-1.5"
                        htmlFor="password">
                        Nueva contraseña
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mínimo 8 caracteres"
                            className="w-full px-4 py-3 pr-11 text-sm bg-card border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/25 placeholder:text-muted-foreground transition-shadow"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                            {showPassword ? <EyeOff size={15}/> : <Eye size={15}/>}
                        </button>
                    </div>
                </div>

                <div>
                    <label
                        className="block text-xs font-semibold text-foreground mb-1.5"
                        htmlFor="confirmPassword">
                        Confirmar contraseña
                    </label>
                    <input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repite la nueva contraseña"
                        className="w-full px-4 py-3 text-sm bg-card border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/25 placeholder:text-muted-foreground transition-shadow"
                    />
                </div>

                <p className="text-xs text-muted-foreground">
                    Debe incluir al menos 8 caracteres, una mayúscula, una
                    minúscula y un número.
                </p>

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
                    disabled={loading || !password || !confirmPassword}
                    className="w-full py-3 cursor-pointer rounded-xl text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60 mt-2 flex items-center justify-center gap-2"
                    style={{backgroundColor: "#43AE6D"}}>
                    {loading ? "Actualizando..." : "Guardar y continuar"}
                </button>
            </form>
        </div>
    );
}
