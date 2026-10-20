'use client'

import { useEffect, useState, useCallback } from 'react'
import {
    UserPlus, Stethoscope, Heart, Phone, CheckCircle,
    XCircle, Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'

import {
    getStaffAction,
    toggleStaffStatusAction,
    deleteStaffAction,
    createStaffAction,
} from '@/modules/users/actions/user.actions'
import { ROLE_ID_TO_NAME } from '@/modules/users/types'

type StaffMember = {
    id: number
    nombreCompleto: string
    correo: string
    activo: boolean
    rol: string
}

type RolStaff = 'veterinarian' | 'operator' | 'coordinator' | 'evaluator'

const ROL_META: Record<RolStaff, { label: string; icon: React.ElementType; color: string }> = {
    veterinarian:   { label: 'Veterinario',   icon: Stethoscope, color: '#43AE6D' },
    operator:    { label: 'Operador',    icon: Phone,       color: '#6B9FAE' },
    coordinator: { label: 'Coordinador', icon: Heart,       color: '#E8A87C' },
    evaluator: { label: 'Evaluador', icon: UserPlus,       color: '#7A7670' },
}

export default function StaffPage() {
    const [equipo, setEquipo] = useState<StaffMember[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [feedback, setFeedback] = useState<{ type: 'ok' | 'error'; msg: string } | null>(null)

    const [form, setForm] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'veterinarian' as RolStaff,
    })

    const cargar = useCallback(async () => {
        setLoading(true)
        try {
            const data = await getStaffAction()
            // El rol persiste como id numérico en BD; se traduce al
            // identificador lógico que consume la UI.
            setEquipo(data.map((u) => ({
                id: u.id,
                nombreCompleto: u.nombreCompleto,
                correo: u.correo,
                activo: u.activo,
                rol: ROLE_ID_TO_NAME[u.rol] ?? String(u.rol),
            })))
        } catch (err: unknown) {
            setFeedback({
                type: 'error',
                msg: err instanceof Error ? err.message : 'Error al cargar el personal',
            })
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { cargar() }, [cargar])

    async function handleCrear(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        setFeedback(null)

        try {
            await createStaffAction({
                fullName: form.fullName,
                email: form.email,
                password: form.password,
                role: form.role,
            })

            setFeedback({ type: 'ok', msg: `${form.role === 'veterinarian' ? 'Veterinario' : form.role === 'operator' ? 'Operador' : form.role === 'coordinator' ? 'Coordinador' : 'Evaluador'} "${form.fullName}" creado correctamente.` })
            setForm({ fullName: '', email: '', password: '', role: 'veterinarian' })
            setModalOpen(false)
            cargar()
        } catch (err: unknown) {
            setFeedback({
                type: 'error',
                msg: err instanceof Error ? err.message : 'Error desconocido',
            })
        } finally {
            setSaving(false)
        }
    }

    async function toggleActivo(miembro: StaffMember) {
        try {
            await toggleStaffStatusAction(miembro.id, !miembro.activo)
            cargar()
        } catch (err: unknown) {
            setFeedback({
                type: 'error',
                msg: err instanceof Error ? err.message : 'Error al actualizar estado',
            })
        }
    }

    async function handleDelete(id: number) {
        try {
            await deleteStaffAction(id)
            cargar()
        } catch (err: unknown) {
            setFeedback({
                type: 'error',
                msg: err instanceof Error ? err.message : 'Error al eliminar miembro',
            })
        }
    }

    const roleLabel = (role: string) => ROL_META[role as RolStaff]?.label ?? role

    return (
        <div className="p-8 max-w-5xl mx-auto">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Personal del albergue</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Gestiona las credenciales de tu equipo de trabajo
                    </p>
                </div>
                <Button
                    onClick={() => { setModalOpen(true); setFeedback(null) }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
                    style={{ backgroundColor: '#43AE6D' }}
                >
                    <UserPlus size={15} /> Agregar miembro
                </Button>
            </div>

            {feedback && (
                <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${
                    feedback.type === 'ok'
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                    {feedback.msg}
                </div>
            )}

            {/* Cards por rol */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
            ) : (
                <div className="space-y-8">
                    {(Object.keys(ROL_META) as RolStaff[]).map((rol) => {
                        const { label, icon: Icon, color } = ROL_META[rol]
                        const miembros = equipo.filter((m) => m.rol === rol)

                        return (
                            <div key={rol}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: `${color}20` }}>
                                        <Icon size={15} style={{ color }} />
                                    </div>
                                    <h2 className="text-base font-semibold text-foreground">{label}s</h2>
                                    <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">
                                        {miembros.length}
                                    </span>
                                </div>

                                {miembros.length === 0 ? (
                                    <div
                                        className="rounded-2xl border-2 border-dashed border-border p-8 text-center text-sm text-muted-foreground cursor-pointer hover:border-primary/40 transition-colors"
                                        onClick={() => { setForm((f) => ({ ...f, role: rol })); setModalOpen(true) }}
                                    >
                                        <Plus size={20} className="mx-auto mb-2 opacity-40" />
                                        Agregar {label.toLowerCase()}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {miembros.map((m) => (
                                            <div key={m.id}
                                                className={`rounded-2xl border bg-card p-5 transition-all ${
                                                    m.activo ? 'border-border' : 'border-border opacity-50'
                                                }`}>
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                                                        style={{ backgroundColor: color }}>
                                                        {m.nombreCompleto.trim().split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {m.activo
                                                            ? <CheckCircle size={14} className="text-green-500" />
                                                            : <XCircle size={14} className="text-muted-foreground" />}
                                                        <button
                                                            onClick={() => toggleActivo(m)}
                                                            className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-secondary"
                                                        >
                                                            {m.activo ? 'Desactivar' : 'Activar'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(m.id)}
                                                            className="text-xs text-red-500 hover:text-red-700 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="font-semibold text-foreground text-sm mb-1">{m.nombreCompleto}</p>
                                                <p className="text-xs text-muted-foreground truncate">{m.correo}</p>
                                                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{roleLabel(m.rol)}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-background rounded-2xl border border-border w-full max-w-md p-6 shadow-xl">
                        <h3 className="text-lg font-semibold text-foreground mb-5">Agregar miembro al equipo</h3>

                        {feedback && (
                            <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${
                                feedback.type === 'ok'
                                    ? 'bg-green-50 border border-green-200 text-green-700'
                                    : 'bg-red-50 border border-red-200 text-red-700'
                            }`}>
                                {feedback.msg}
                            </div>
                        )}

                        <form onSubmit={handleCrear} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-foreground mb-1">Rol *</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(Object.keys(ROL_META) as RolStaff[]).map((rol) => {
                                        const { label, icon: Icon, color } = ROL_META[rol]
                                        const selected = form.role === rol
                                        return (
                                            <button
                                                key={rol}
                                                type="button"
                                                onClick={() => setForm({ ...form, role: rol })}
                                                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                                                    selected ? 'border-2' : 'border-border hover:border-primary/40'
                                                }`}
                                                style={selected ? { borderColor: color, backgroundColor: `${color}10`, color } : {}}
                                            >
                                                <Icon size={16} />
                                                {label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-foreground mb-1">Nombre completo *</label>
                                <input required value={form.fullName}
                                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                    className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-foreground mb-1">Correo electrónico *</label>
                                <input required type="email" value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-foreground mb-1">Contraseña temporal *</label>
                                <input required type="password" value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder="Mínimo 6 caracteres"
                                    className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button"
                                    onClick={() => { setModalOpen(false); setFeedback(null) }}
                                    className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-secondary transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={saving}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                                    style={{ backgroundColor: '#43AE6D' }}>
                                    {saving ? 'Creando...' : 'Crear miembro'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
