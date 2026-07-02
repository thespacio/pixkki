  'use client'

  import { useEffect, useState, useCallback } from 'react'
  import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client'
  import {
    UserPlus, Stethoscope, Heart, Phone, CheckCircle,
    XCircle, Trash2, Plus
  } from 'lucide-react'

  type RolStaff = 'Veterinario' | 'Voluntario' | 'Recepcionista'

  type Miembro = {
    id_usuario: number
    nombre_completo: string
    correo: string
    activo: boolean
    usuario_rol: { rol: { nombre_rol: string } }[]
  }

  const ROL_META: Record<RolStaff, { label: string; icon: React.ElementType; color: string }> = {
    Veterinario:   { label: 'Veterinario',   icon: Stethoscope, color: '#6366f1' },
    Voluntario:    { label: 'Voluntario',    icon: Heart,       color: '#ec4899' },
    Recepcionista: { label: 'Recepcionista', icon: Phone,       color: '#f59e0b' },
  }

  export default function StaffPage() {
    const supabase = getSupabaseBrowserClient()

    const [idRefugio, setIdRefugio]   = useState<number | null>(null)
    const [equipo, setEquipo]         = useState<Miembro[]>([])
    const [loading, setLoading]       = useState(true)
    const [modalOpen, setModalOpen]   = useState(false)
    const [saving, setSaving]         = useState(false)
    const [feedback, setFeedback]     = useState<{ type: 'ok' | 'error'; msg: string } | null>(null)

    const [form, setForm] = useState({
      nombre_completo: '',
      correo: '',
      password: '',
      nombre_rol: 'Veterinario' as RolStaff,
    })

    const cargar = useCallback(async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return

      const { data: usuarioData } = await supabase
        .from('usuario')
        .select('id_refugio')
        .eq('correo', user.email)
        .single()

      if (!usuarioData) return
      setIdRefugio(usuarioData.id_refugio)

      const { data: equipoData } = await supabase
        .from('usuario')
        .select(`
          id_usuario, nombre_completo, correo, activo,
          usuario_rol ( rol ( nombre_rol ) )
        `)
        .eq('id_refugio', usuarioData.id_refugio)
        .neq('correo', user.email) // excluir al propio admin
        .order('id_usuario', { ascending: false })

      setEquipo((equipoData as Miembro[]) ?? [])
      setLoading(false)
    }, [supabase])

    useEffect(() => { cargar() }, [cargar])

    async function handleCrear(e: React.FormEvent) {
      e.preventDefault()
      setSaving(true)
      setFeedback(null)

      try {
        const res = await fetch('/api/admin/create-staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error ?? 'Error al crear el usuario')
        }

        setFeedback({ type: 'ok', msg: `${form.nombre_rol} "${form.nombre_completo}" creado correctamente.` })
        setForm({ nombre_completo: '', correo: '', password: '', nombre_rol: 'Veterinario' })
        cargar()
      } catch (err: unknown) {
        setFeedback({ type: 'error', msg: err instanceof Error ? err.message : 'Error desconocido' })
      } finally {
        setSaving(false)
      }
    }

    async function toggleActivo(miembro: Miembro) {
      await supabase
        .from('usuario')
        .update({ activo: !miembro.activo })
        .eq('id_usuario', miembro.id_usuario)
      cargar()
    }

    // Agrupar por rol
    const porRol = (rol: string) =>
      equipo.filter((m) => m.usuario_rol?.[0]?.rol?.nombre_rol === rol)

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
          <button
            onClick={() => { setModalOpen(true); setFeedback(null) }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: '#43AE6D' }}
          >
            <UserPlus size={15} /> Agregar miembro
          </button>
        </div>

        {/* Cards por rol */}
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-8">
            {(Object.keys(ROL_META) as RolStaff[]).map((rol) => {
              const { label, icon: Icon, color } = ROL_META[rol]
              const miembros = porRol(rol)

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
                      onClick={() => { setForm((f) => ({ ...f, nombre_rol: rol })); setModalOpen(true) }}
                    >
                      <Plus size={20} className="mx-auto mb-2 opacity-40" />
                      Agregar {label.toLowerCase()}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {miembros.map((m) => (
                        <div key={m.id_usuario}
                          className={`rounded-2xl border bg-card p-5 transition-all ${
                            m.activo ? 'border-border' : 'border-border opacity-50'
                          }`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                              style={{ backgroundColor: color }}>
                              {m.nombre_completo.trim().split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
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
                            </div>
                          </div>
                          <p className="font-semibold text-foreground text-sm mb-1">{m.nombre_completo}</p>
                          <p className="text-xs text-muted-foreground truncate">{m.correo}</p>
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
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(ROL_META) as RolStaff[]).map((rol) => {
                      const { label, icon: Icon, color } = ROL_META[rol]
                      const selected = form.nombre_rol === rol
                      return (
                        <button
                          key={rol}
                          type="button"
                          onClick={() => setForm({ ...form, nombre_rol: rol })}
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
                  <input required value={form.nombre_completo}
                    onChange={(e) => setForm({ ...form, nombre_completo: e.target.value })}
                    className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Correo electrónico *</label>
                  <input required type="email" value={form.correo}
                    onChange={(e) => setForm({ ...form, correo: e.target.value })}
                    className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Contraseña temporal *</label>
                  <input required type="password" value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Mínimo 8 caracteres"
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