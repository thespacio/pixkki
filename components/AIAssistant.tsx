// app/components/AsistenteIA.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import {
    PawPrint,
    Send,
    X,
    Sparkles,
    Heart,
    Stethoscope,
    DollarSign,
    Bot,
    User,
    Minimize2,
    Maximize2,
} from "lucide-react";

// Tipos
interface Mensaje {
    id: string;
    rol: "usuario" | "asistente";
    contenido: string;
    hora: Date;
}

// Preguntas sugeridas para acceso rápido
const preguntasSugeridas = [
    { icono: <PawPrint size={14} />, texto: "¿Cómo registro un animal?", color: "#43AE6D" },
    { icono: <Heart size={14} />, texto: "Seguir una solicitud de adopción", color: "#E8A87C" },
    { icono: <DollarSign size={14} />, texto: "Registrar una donación", color: "#6B9FAE" },
    { icono: <Stethoscope size={14} />, texto: "Agregar historial médico", color: "#D8C4A5" },
];

// Respuestas simuladas (en producción, conéctalo a tu backend de IA)
const obtenerRespuestaIA = (mensajeUsuario: string): string => {
    const texto = mensajeUsuario.toLowerCase();

    if (texto.includes("registrar") || texto.includes("registro") || texto.includes("ingreso") || texto.includes("nuevo animal")) {
        return "Para registrar un nuevo animal, ve a la sección **Animales** y haz clic en **Nuevo Ingreso**. Necesitarás:\n\n• Fotos del animal\n• Especie, raza y edad aproximada\n• Fecha de ingreso y procedencia\n• Evaluación inicial de salud\n• Asignación de jaula\n\nEl sistema generará un ID único y lo añadirá automáticamente a tu pipeline de adopción.";
    }
    if (texto.includes("adopción") || texto.includes("adopcion") || texto.includes("solicitud")) {
        return "Tu pipeline de adopción tiene 4 etapas:\n\n1. **Solicitud recibida** — notificación automática enviada\n2. **Visita domiciliaria agendada** — invitación al calendario creada\n3. **Aprobada** — contrato enviado para firma electrónica\n4. **Adoptado** — animal marcado como colocado\n\nPuedes seguir a cada solicitante desde el panel de **Adopciones**.";
    }
    if (texto.includes("donación") || texto.includes("donacion") || texto.includes("donante")) {
        return "Para registrar una donación:\n\n• Ve a **Donaciones** → **Nueva Aportación**\n• Selecciona al donante (o crea uno nuevo)\n• Elige el tipo: única, recurrente, corporativa o subvención\n• Agrega monto, fecha y destino\n\nLos donantes recurrentes se marcan automáticamente para seguimiento. Los reportes se exportan para tu junta con un solo clic.";
    }
    if (texto.includes("médic") || texto.includes("medic") || texto.includes("vacuna") || texto.includes("salud")) {
        return "Los registros médicos se organizan por animal. Puedes:\n\n• Registrar vacunas con recordatorios de vencimiento\n• Seguir tratamientos y medicamentos\n• Adjuntar notas veterinarias y resultados de laboratorio\n• Establecer estado de retención médica\n• Agendar citas de seguimiento\n\nLas alertas aparecen en tu panel cuando hay acciones pendientes.";
    }
    if (texto.includes("panel") || texto.includes("dashboard") || texto.includes("métrica") || texto.includes("metrica") || texto.includes("reporte")) {
        return "Tu panel muestra en vivo:\n\n• Tasa de ocupación de jaulas\n• Conteo mensual de adopciones\n• Tendencias de ingresos por donaciones\n• Alertas médicas\n• Actividad del personal\n\nPuedes filtrar por rango de fechas y exportar cualquier vista como PDF o CSV.";
    }
    if (texto.includes("hola") || texto.includes("buenas") || texto.includes("qué tal") || texto.includes("hey")) {
        return "¡Hola! 👋 Soy el Asistente de Pixkki. Puedo ayudarte con:\n\n• Registrar animales\n• Gestionar adopciones\n• Seguir donaciones\n• Historial médico\n• Entender tu panel\n\n¿Qué te gustaría saber?";
    }

    return "¡Con gusto te ayudo con eso! Puedo asistirte con gestión de animales, adopciones, donaciones, historial médico y métricas del panel. ¿Me cuentas un poco más sobre lo que quieres hacer?";
};

export default function AsistenteIA() {
    const [abierto, setAbierto] = useState(false);
    const [minimizado, setMinimizado] = useState(false);
    const [mensajes, setMensajes] = useState<Mensaje[]>([
        {
            id: "bienvenida",
            rol: "asistente",
            contenido:
                "¡Hola! Soy el Asistente de Pixkki. Puedo ayudarte a navegar la plataforma, responder dudas sobre la operación del albergue y guiarte en cualquier función. ¿En qué te ayudo?",
            hora: new Date(),
        },
    ]);
    const [entrada, setEntrada] = useState("");
    const [escribiendo, setEscribiendo] = useState(false);
    const finMensajesRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const desplazarAbajo = () => {
        finMensajesRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        desplazarAbajo();
    }, [mensajes, escribiendo]);

    useEffect(() => {
        if (abierto && !minimizado) {
            inputRef.current?.focus();
        }
    }, [abierto, minimizado]);

    const enviar = (texto?: string) => {
        const contenido = texto || entrada.trim();
        if (!contenido) return;

        const mensajeUsuario: Mensaje = {
            id: `usuario-${Date.now()}`,
            rol: "usuario",
            contenido,
            hora: new Date(),
        };

        setMensajes((prev) => [...prev, mensajeUsuario]);
        setEntrada("");
        setEscribiendo(true);

        // Simula el tiempo de "pensado" de la IA
        setTimeout(() => {
            const mensajeIA: Mensaje = {
                id: `ia-${Date.now()}`,
                rol: "asistente",
                contenido: obtenerRespuestaIA(contenido),
                hora: new Date(),
            };
            setMensajes((prev) => [...prev, mensajeIA]);
            setEscribiendo(false);
        }, 800 + Math.random() * 600);
    };

    const manejarTecla = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            enviar();
        }
    };

    const formatearHora = (fecha: Date) => {
        return fecha.toLocaleTimeString("es-MX", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    // Botón flotante (cerrado)
    if (!abierto) {
        return (
            <button
                onClick={() => setAbierto(true)}
                className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 group"
                style={{ backgroundColor: "#43AE6D" }}
                aria-label="Abrir Asistente IA"
            >
                <div className="relative">
                    <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white animate-pulse" />
                </div>
                <span>Pregunta a Pixkki IA</span>
            </button>
        );
    }

    // Estado minimizado
    if (minimizado) {
        return (
            <div
                className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border border-border bg-card cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setMinimizado(false)}
            >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#EBF7F1" }}>
                    <Bot size={16} style={{ color: "#43AE6D" }} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">Asistente Pixkki</p>
                    <p className="text-[10px] text-muted-foreground truncate">Clic para expandir</p>
                </div>
                <Maximize2 size={14} className="text-muted-foreground flex-shrink-0" />
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-3rem)] flex flex-col rounded-3xl shadow-2xl border border-border bg-card overflow-hidden">
            {/* Encabezado */}
            <div className="px-5 py-4 border-b border-border flex items-center justify-between" style={{ backgroundColor: "#43AE6D" }}>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-sm">
                        <Bot size={18} color="#fff" />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold text-white">Asistente Pixkki</p>
                            <Sparkles size={12} color="#fff" opacity={0.8} />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            <p className="text-[10px] text-white/80">En línea · Listo para ayudar</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setMinimizado(true)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                        aria-label="Minimizar"
                    >
                        <Minimize2 size={14} color="#fff" />
                    </button>
                    <button
                        onClick={() => setAbierto(false)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                        aria-label="Cerrar"
                    >
                        <X size={14} color="#fff" />
                    </button>
                </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4" style={{ backgroundColor: "#FAFAF9" }}>
                {mensajes.map((mensaje) => (
                    <div
                        key={mensaje.id}
                        className={`flex gap-2.5 ${mensaje.rol === "usuario" ? "flex-row-reverse" : "flex-row"}`}
                    >
                        {/* Avatar */}
                        <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{
                                backgroundColor: mensaje.rol === "usuario" ? "#EBF7F1" : "#43AE6D",
                            }}
                        >
                            {mensaje.rol === "usuario" ? (
                                <User size={14} style={{ color: "#43AE6D" }} />
                            ) : (
                                <PawPrint size={14} color="#fff" />
                            )}
                        </div>

                        {/* Burbuja */}
                        <div className={`max-w-[78%] ${mensaje.rol === "usuario" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                            <div
                                className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line ${
                                    mensaje.rol === "usuario"
                                        ? "rounded-tr-sm text-white"
                                        : "rounded-tl-sm text-foreground border border-border"
                                }`}
                                style={{
                                    backgroundColor: mensaje.rol === "usuario" ? "#43AE6D" : "#FFFFFF",
                                }}
                            >
                                {mensaje.contenido.split(/(\*\*.*?\*\*)/).map((parte, i) => {
                                    if (parte.startsWith("**") && parte.endsWith("**")) {
                                        return (
                                            <strong key={i} className="font-semibold">
                                                {parte.slice(2, -2)}
                                            </strong>
                                        );
                                    }
                                    return <span key={i}>{parte}</span>;
                                })}
                            </div>
                            <span className="text-[9px] text-muted-foreground px-1">
                {formatearHora(mensaje.hora)}
              </span>
                        </div>
                    </div>
                ))}

                {/* Indicador de escritura */}
                {escribiendo && (
                    <div className="flex gap-2.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#43AE6D" }}>
                            <PawPrint size={14} color="#fff" />
                        </div>
                        <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-border flex items-center gap-1">
                            {[0, 1, 2].map((i) => (
                                <span
                                    key={i}
                                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                                    style={{
                                        backgroundColor: "#43AE6D",
                                        animationDelay: `${i * 0.15}s`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div ref={finMensajesRef} />
            </div>

            {/* Preguntas sugeridas (solo al inicio) */}
            {mensajes.length <= 1 && (
                <div className="px-5 py-3 border-t border-border bg-card">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Preguntas rápidas
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {preguntasSugeridas.map(({ icono, texto, color }) => (
                            <button
                                key={texto}
                                onClick={() => enviar(texto)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border border-border hover:border-current transition-colors bg-background"
                                style={{ color }}
                            >
                                {icono}
                                {texto}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Entrada */}
            <div className="px-4 py-3 border-t border-border bg-card">
                <div className="flex items-end gap-2">
                    <div className="flex-1 relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={entrada}
                            onChange={(e) => setEntrada(e.target.value)}
                            onKeyDown={manejarTecla}
                            placeholder="Pregúntame lo que quieras sobre Pixkki..."
                            className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-[13px] bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => enviar()}
                        disabled={!entrada.trim() || escribiendo}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                        style={{ backgroundColor: "#43AE6D" }}
                        aria-label="Enviar mensaje"
                    >
                        <Send size={16} />
                    </button>
                </div>
                <p className="text-[9px] text-muted-foreground mt-2 text-center">
                    Pixkki IA puede cometer errores. Verifica la información importante.
                </p>
            </div>
        </div>
    );
}