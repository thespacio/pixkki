"use client";

import { useCallback, useState } from "react";
import {
    AlertTriangle,
    Building2,
    CheckCircle,
    RefreshCw,
    ShieldCheck,
    Stethoscope,
    Trash2,
    UserPlus,
    XCircle,
} from "lucide-react";
import { CreateStaffSchema, STAFF_ROLES, type StaffRole } from "@/modules/users/schemas";
import {
    createStaffAction,
    deleteStaffAction,
    getStaffAction,
    toggleStaffStatusAction,
} from "@/modules/users/actions/user.actions";
import { ROLE_CATALOG, ROLE_ID_TO_NAME, roleConfig, type StaffListItem } from "@/modules/users/types";

type StaffListProps = {
    initialStaff: StaffListItem[];
    loadError?: string;
    shelters: { id: number; nombre: string }[];
    isSuperadmin: boolean;
};

type Feedback = { type: "ok" | "error"; msg: string } | null;

const ROLE_ICONS = {
    administrador: ShieldCheck,
    veterinario: Stethoscope,
    superadmin: ShieldCheck,
} as const;

const EMPTY_FORM = {
    fullName: "",
    email: "",
    password: "",
    role: "veterinario" as StaffRole,
    shelterId: "",
};

export default function StaffList({
    initialStaff,
    loadError,
    shelters,
    isSuperadmin,
}: StaffListProps) {
    const [equipo, setEquipo] = useState<StaffListItem[]>(initialStaff);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<Feedback>(loadError ? { type: "error", msg: loadError } : null);
    const [confirmDelete, setConfirmDelete] = useState<StaffListItem | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);

    const recargar = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getStaffAction();
            if (result.success) {
                setEquipo(result.data);
            } else {
                setFeedback({ type: "error", msg: result.error });
            }
        } finally {
            setLoading(false);
        }
    }, []);

    async function handleCrear(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setFeedback(null);

        const input = {
            fullName: form.fullName,
            email: form.email,
            password: form.password,
            role: form.role,
            ...(isSuperadmin ? { shelterId: Number(form.shelterId) } : {}),
        };

        const parsed = CreateStaffSchema.safeParse(input);
        if (!parsed.success) {
            setFeedback({ type: "error", msg: parsed.error.issues[0]?.message ?? "Datos inválidos" });
            setSaving(false);
            return;
        }

        try {
            const result = await createStaffAction(parsed.data);
            if (!result.success) {
                setFeedback({ type: "error", msg: result.error });
                return;
            }
            setFeedback({ type: "ok", msg: result.data.message });
            setForm(EMPTY_FORM);
            setModalOpen(false);
            await recargar();
        } catch {
            setFeedback({ type: "error", msg: "No se pudo completar la operación. Intenta de nuevo." });
        } finally {
            setSaving(false);
        }
    }

    async function toggleActivo(miembro: StaffListItem) {
        setFeedback(null);
        const result = await toggleStaffStatusAction(miembro.id, !miembro.activo);
        if (!result.success) {
            setFeedback({ type: "error", msg: result.error });
            return;
        }
        setEquipo((actual) =>
            actual.map((m) => (m.id === miembro.id ? { ...m, activo: !miembro.activo } : m)),
        );
    }

    async function handleDelete() {
        if (!confirmDelete) return;
        setFeedback(null);
        const id = confirmDelete.id;
        const result = await deleteStaffAction(id);
        setConfirmDelete(null);
        if (!result.success) {
            setFeedback({ type: "error", msg: result.error });
            return;
        }
        setEquipo((actual) => actual.filter((m) => m.id !== id));
    }

    function abrirModal(role?: StaffRole) {
        setForm({ ...EMPTY_FORM, role: role ?? "veterinario" });
        setFeedback(null);
        setModalOpen(true);
    }

    const grupos = (Object.keys(ROLE_CATALOG) as (keyof typeof ROLE_CATALOG)[]).map((role) => ({
        role,
        miembros: equipo.filter((m) => ROLE_ID_TO_NAME[m.rol] === role),
    }));

    return (
        <div className="p-6 pb-28 md:p-8 md:pb-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Personal del albergue</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Gestiona las credenciales de tu equipo de trabajo
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => abrirModal()}
                    className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
                    style={{ backgroundColor: "#43AE6D" }}
                >
                    <UserPlus size={15} /> Agregar miembro
                </button>
            </div>

            {feedback && (
                <div
                    role="status"
                    className={`mb-4 flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm ${
                        feedback.type === "ok"
                            ? "bg-green-50 border border-green-200 text-green-700"
                            : "bg-red-50 border border-red-200 text-red-700"
                    }`}
                >
                    <span className="flex items-center gap-2">
                        {feedback.type === "error" && <AlertTriangle size={16} />}
                        {feedback.msg}
                    </span>
                    <div className="flex items-center gap-2">
                        {feedback.type === "error" && (
                            <button type="button" onClick={recargar} className="underline inline-flex items-center gap-1">
                                <RefreshCw size={14} /> Reintentar
                            </button>
                        )}
                        <button type="button" onClick={() => setFeedback(null)} aria-label="Cerrar aviso">
                            <XCircle size={16} />
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="space-y-4" aria-label="Cargando personal">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-24 rounded-2xl border border-border bg-muted/40 animate-pulse" />
                    ))}
                </div>
            ) : equipo.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-border p-10 text-center">
                    <UserPlus size={28} className="mx-auto mb-3 opacity-50" />
                    <p className="font-medium text-foreground">Aún no hay personal registrado</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Invita a tu equipo para que puedan trabajar en el refugio.
                    </p>
                    <button
                        type="button"
                        onClick={() => abrirModal()}
                        className="mt-5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                        style={{ backgroundColor: "#43AE6D" }}
                    >
                        Agregar miembro
                    </button>
                </div>
            ) : (
                <>
                    {equipo.length < 3 && (
                        <p className="mb-6 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 text-sm">
                            Tu equipo aún es pequeño. Puedes agregar más miembros cuando lo necesites.
                        </p>
                    )}

                    <div className="space-y-8">
                        {grupos.map(({ role, miembros }) => {
                            const { label, color } = roleConfig[role];
                            const Icon = ROLE_ICONS[role];
                            if (miembros.length === 0) return null;

                            return (
                                <section key={role}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className="w-8 h-8 rounded-xl flex items-center justify-center"
                                            style={{ backgroundColor: `${color}20` }}
                                        >
                                            <Icon size={15} style={{ color }} />
                                        </div>
                                        <h2 className="text-base font-semibold text-foreground">{label}s</h2>
                                        <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">
                                            {miembros.length}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {miembros.map((m) => (
                                            <article
                                                key={m.id}
                                                className={`rounded-2xl border bg-card p-5 transition-all ${
                                                    m.activo ? "border-border" : "border-border opacity-60"
                                                }`}
                                            >
                                                <div className="flex items-start justify-between mb-3 gap-3">
                                                    <div
                                                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                                                        style={{ backgroundColor: color }}
                                                    >
                                                        {m.nombreCompleto.trim().split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {m.activo
                                                            ? <CheckCircle size={14} className="text-green-500" />
                                                            : <XCircle size={14} className="text-muted-foreground" />}
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleActivo(m)}
                                                            className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-secondary"
                                                        >
                                                            {m.activo ? "Desactivar" : "Activar"}
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="font-semibold text-foreground text-sm mb-1">{m.nombreCompleto}</p>
                                                <p className="text-xs text-muted-foreground truncate">{m.correo}</p>
                                                {m.shelterNombre && (
                                                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                        <Building2 size={12} /> {m.shelterNombre}
                                                    </p>
                                                )}
                                                <div className="mt-3 flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => setConfirmDelete(m)}
                                                        className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50"
                                                    >
                                                        <Trash2 size={12} /> Eliminar
                                                    </button>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                </>
            )}

            {/* CTA fijo en móvil (zona del pulgar) */}
            <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 p-4 md:hidden">
                <button
                    type="button"
                    onClick={() => abrirModal()}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                    style={{ backgroundColor: "#43AE6D", minHeight: 48 }}
                >
                    <UserPlus size={16} /> Agregar miembro
                </button>
            </div>

            {/* Modal de alta */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-0 md:p-4" role="dialog" aria-modal="true">
                    <div className="w-full md:max-w-md bg-background rounded-t-2xl md:rounded-2xl border border-border p-6 shadow-xl">
                        <h3 className="text-lg font-semibold text-foreground mb-5">Agregar miembro al equipo</h3>
                        <form onSubmit={handleCrear} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-foreground mb-1">Rol *</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {STAFF_ROLES.map((rol) => {
                                        const selected = form.role === rol;
                                        const config = roleConfig[rol];
                                        return (
                                            <button
                                                key={rol}
                                                type="button"
                                                onClick={() => setForm({ ...form, role: rol })}
                                                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all"
                                                style={selected ? { borderColor: config.color, backgroundColor: `${config.color}10`, color: config.color } : {}}
                                            >
                                                {config.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {isSuperadmin && (
                                <div>
                                    <label htmlFor="shelterId" className="block text-xs font-medium text-foreground mb-1">Refugio *</label>
                                    <select
                                        id="shelterId"
                                        value={form.shelterId}
                                        onChange={(e) => setForm({ ...form, shelterId: e.target.value })}
                                        required
                                        className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm"
                                    >
                                        <option value="">Selecciona un refugio</option>
                                        {shelters.map((s) => (
                                            <option key={s.id} value={s.id}>{s.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label htmlFor="fullName" className="block text-xs font-medium text-foreground mb-1">Nombre completo *</label>
                                <input id="fullName" required value={form.fullName}
                                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                    className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm" />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-xs font-medium text-foreground mb-1">Correo electrónico *</label>
                                <input id="email" required type="email" value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm" />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-xs font-medium text-foreground mb-1">Contraseña temporal *</label>
                                <input id="password" required type="password" value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder="Mínimo 6 caracteres"
                                    className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm" />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setModalOpen(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-secondary">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={saving}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                                    style={{ backgroundColor: "#43AE6D", minHeight: 44 }}>
                                    {saving ? "Creando…" : "Crear miembro"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmación de eliminación */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-0 md:p-4" role="alertdialog" aria-modal="true">
                    <div className="w-full md:max-w-sm bg-background rounded-t-2xl md:rounded-2xl border border-border p-6 shadow-xl">
                        <h3 className="text-lg font-semibold text-foreground">Eliminar miembro</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                            ¿Eliminar a <strong>{confirmDelete.nombreCompleto}</strong>? Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-3 mt-6">
                            <button type="button" onClick={() => setConfirmDelete(null)}
                                className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-secondary">
                                Cancelar
                            </button>
                            <button type="button" onClick={handleDelete}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700"
                                style={{ minHeight: 44 }}>
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
