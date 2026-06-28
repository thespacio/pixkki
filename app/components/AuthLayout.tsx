"use client";

import {ArrowLeft, EyeOff, Eye, AlertCircle,
} from "lucide-react";

const logo = "/images/logo.png";

import { useRouter } from "next/navigation";
import {useState} from "react";
import {login} from "../auth";



export default function AuthLayout(
    {children}: {
        children: React.ReactNode;
    }) {

    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        await new Promise((r) => setTimeout(r, 700));

        const ok = login(email, password);
        if (ok) {
            router.push("/dashboard");
        } else {
            setError("Correo o contraseña incorrectos. Por favor, intente de nuevo.");
            setLoading(false);
        }
    };

    return (
        <div
            className="
            min-h-screen
            bg-background
            flex

            lg: max-h-screen
            "
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
            {/* Left — form */}
            <div className="
              flex flex-col
              w-full
              px-12 py-10
              min-h-screen

              lg:max-w-lg
            ">
                <div className={"pb-3"}>
                    {/*Back Button*/}
                    <button
                        onClick={() => router.push("/")}
                        className="flex items-center gap-2 text-sm cursor-pointer text-muted-foreground hover:text-foreground transition-colors mb-12"
                    >
                        <ArrowLeft size={14} />
                        Volver al Inicio
                    </button>
                    {/*Contenido Principal*/}
                    {children}
                </div>

                <p className="text-xs text-muted-foreground mt-auto">
                    © 2026 Pixkki · <a href="/aviso-privacidad" className="hover:text-foreground transition-colors">Aviso de privacidad</a> · <a href="/terminos-condiciones" className="hover:text-foreground transition-colors">Términos y Condiciones</a>
                </p>

            </div>

            {/* Right — visual panel */}
            <div  className="
            hidden
            relative
            overflow-hidden

            lg:flex
            lg:flex-1
            " style={{ backgroundColor: "#2E2E2E" }}>
                <img
                    src="https://images.unsplash.com/photo-1642625932641-3a52ad27e268?w=900&h=1100&fit=crop&auto=format"
                    alt="Dog and cat looking out the window"
                    className="w-full h-full object-cover object-[50%_20%] opacity-40"
                />
                {/* Overlay content */}
                <div className="absolute inset-0 flex flex-col justify-end p-12">
                    <div className="mb-8">
                        <blockquote className="text-white text-xl font-medium leading-relaxed mb-5 max-w-sm">
                            &ldquo;Pixkki transformó el caos de nuestras hojas de cálculo, en un sistema en el que nuestro equipo puede confiar.&rdquo;
                        </blockquote>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: "#43AE6D" }}>
                                SB
                            </div>
                            <div>
                                <p className="text-white text-sm font-semibold">Sofia Brennan</p>
                                <p className="text-white/60 text-xs">Directora, Rescatista animal</p>
                            </div>
                        </div>
                    </div>

                    {/* Mini stats */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { value: "340+", label: "Albergues" },
                            { value: "28k", label: "Animales/mes" },
                            { value: "94%", label: "Tiempo ahorrado" },
                        ].map(({ value, label }) => (
                            <div key={label} className="rounded-xl px-4 py-3" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                                <p className="text-white text-lg font-semibold tracking-tight" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</p>
                                <p className="text-white/55 text-xs mt-0.5">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
