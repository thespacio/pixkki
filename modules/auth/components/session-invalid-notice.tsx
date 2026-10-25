"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {LogOut, ShieldAlert} from "lucide-react";

import {logout} from "@/modules/auth/client";

type Props = {
    message: string;
};

/**
 * Pantalla mostrada cuando la sesión no permite acceder al dashboard
 * (correo no verificado, cuenta deshabilitada o usuario inexistente).
 * Ofrece cerrar sesión para volver al login de forma segura.
 */
export default function SessionInvalidNotice({message}: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleLogout() {
        setLoading(true);
        setError("");

        try {
            await logout();
        } catch (err) {
            console.error("Error al cerrar sesión:", err);
            setError("No fue posible cerrar la sesión. Intenta nuevamente.");
            setLoading(false);
            return;
        }

        router.replace("/login");
        router.refresh();
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                    <ShieldAlert size={22} className="text-muted-foreground"/>
                </div>
                <h1 className="text-lg font-semibold text-foreground">
                    Sesión no disponible
                </h1>
                <p className="text-sm text-muted-foreground">{message}</p>

                {error && (
                    <p className="text-xs text-red-500">{error}</p>
                )}

                <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60 cursor-pointer"
                    style={{backgroundColor: "#43AE6D"}}>
                    <LogOut size={15}/>
                    {loading ? "Cerrando sesión..." : "Cerrar sesión"}
                </button>
            </div>
        </div>
    );
}
