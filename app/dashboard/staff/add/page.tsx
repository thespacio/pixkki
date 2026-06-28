"use client"

import { useState } from "react";

import { ArrowLeft, User, Mail, Lock, Shield, Eye, EyeOff } from "lucide-react";

// Configuración de roles
const roleConfig: Record<string, { label: string; color: string; bg: string }> = {
    veterinarian: { label: "Veterinario", color: "#43AE6D", bg: "#EBF7F1" },
    operator: { label: "Operador", color: "#6B9FAE", bg: "#EAF3F6" },
    coordinator: { label: "Coordinador", color: "#E8A87C", bg: "#FDF2EA" },
    evaluator: { label: "Evaluador", color: "#7A7670", bg: "#EDE9E1" },
};

// Dentro de tu componente
import { useRouter } from "next/navigation";

export default function AddStaffForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        rol: "veterinarian",
    });

    const [errors, setErrors] = useState({
        name: "",
        email: "",
        password: "",
        rol: "",
    });

    const validateForm = () => {
        const newErrors = {
            name: "",
            email: "",
            password: "",
            rol: "",
        };
        let isValid = true;

        if (!formData.name.trim()) {
            newErrors.name = "El nombre completo es requerido";
            isValid = false;
        } else if (formData.name.trim().length < 3) {
            newErrors.name = "El nombre debe tener al menos 3 caracteres";
            isValid = false;
        }

        if (!formData.email.trim()) {
            newErrors.email = "El email es requerido";
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Ingresa un email válido";
            isValid = false;
        }

        if (!formData.password) {
            newErrors.password = "La contraseña es requerida";
            isValid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = "La contraseña debe tener al menos 6 caracteres";
            isValid = false;
        }

        if (!formData.rol) {
            newErrors.rol = "Selecciona un rol";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            // Simulación de envío - Reemplazar con tu API
            await new Promise(resolve => setTimeout(resolve, 1500));

            console.log("Datos del nuevo personal:", formData);

            // Aquí iría tu llamada a la API
            // await api.post('/staff', formData);

            // Redirigir a la lista de personal
            router.push("/dashboard/staff");
        } catch (error) {
            console.error("Error al registrar personal:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Limpiar error del campo cuando el usuario escribe
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            {/* Botón de retroceso */}
            <button
                onClick={() => router.push("./")}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
                <ArrowLeft size={16} />
                Volver al listado
            </button>

            <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                {/* Encabezado */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-foreground tracking-tight">
                        Registrar nuevo personal
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Completa los campos para agregar un nuevo miembro al equipo
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nombre Completo */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                            Nombre completo <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Ej: María García Pérez"
                                className={`w-full pl-10 pr-4 py-2.5 text-sm bg-secondary border rounded-xl outline-none transition-colors ${
                                    errors.name ? "border-red-500 focus:ring-red-500" : "border-border focus:ring-2 focus:ring-primary/20"
                                }`}
                            />
                        </div>
                        {errors.name && (
                            <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Ej: maria.garcia@ejemplo.com"
                                className={`w-full pl-10 pr-4 py-2.5 text-sm bg-secondary border rounded-xl outline-none transition-colors ${
                                    errors.email ? "border-red-500 focus:ring-red-500" : "border-border focus:ring-2 focus:ring-primary/20"
                                }`}
                            />
                        </div>
                        {errors.email && (
                            <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>
                        )}
                    </div>

                    {/* Contraseña */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                            Contraseña <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Mínimo 6 caracteres"
                                className={`w-full pl-10 pr-12 py-2.5 text-sm bg-secondary border rounded-xl outline-none transition-colors ${
                                    errors.password ? "border-red-500 focus:ring-red-500" : "border-border focus:ring-2 focus:ring-primary/20"
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>
                        )}
                        <p className="mt-1.5 text-xs text-muted-foreground">
                            La contraseña debe tener al menos 6 caracteres
                        </p>
                    </div>

                    {/* Rol */}
                    <div>
                        <label htmlFor="rol" className="block text-sm font-medium text-foreground mb-1.5">
                            Rol <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Shield size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <select
                                id="rol"
                                name="rol"
                                value={formData.rol}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-2.5 text-sm bg-secondary border rounded-xl outline-none transition-colors appearance-none ${
                                    errors.rol ? "border-red-500 focus:ring-red-500" : "border-border focus:ring-2 focus:ring-primary/20"
                                }`}
                            >
                                <option value="">Selecciona un rol</option>
                                {Object.entries(roleConfig).map(([key, { label }]) => (
                                    <option key={key} value={key}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {errors.rol && (
                            <p className="mt-1.5 text-xs text-red-500">{errors.rol}</p>
                        )}
                    </div>

                    {/* Vista previa del rol seleccionado */}
                    {formData.rol && roleConfig[formData.rol] && (
                        <div className="p-4 rounded-xl border border-border bg-secondary/30">
                            <p className="text-sm text-muted-foreground mb-1">Rol seleccionado:</p>
                            <div className="flex items-center gap-2">
                <span
                    className="px-3 py-1.5 rounded-lg text-sm font-medium"
                    style={{
                        color: roleConfig[formData.rol].color,
                        backgroundColor: roleConfig[formData.rol].bg
                    }}
                >
                  {roleConfig[formData.rol].label}
                </span>
                            </div>
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={() => router.push("./")}
                            className="flex-1 px-6 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-xl hover:bg-secondary transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            style={{ backgroundColor: "#43AE6D" }}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Registrando...
                                </div>
                            ) : (
                                "Registrar personal"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}