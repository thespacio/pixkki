'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client'
import {
  Building2, Users, Plus, LogOut,
  Mail, KeyRound, Trash2, AlertTriangle
} from 'lucide-react'

type Refugio = {
  id_refugio: number
  nombre: string
  ciudad: string
  estado: string
  correo_contacto: string
  activo: boolean
  albergue_perfil: { slug: string } | null
}

type Admin = {
  id_usuario: number
  nombre_completo: string
  correo: string
}

export default function SuperAdminPage() {
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()

  const [refugios, setRefugios]           = useState<Refugio[]>([])
  const [loading, setLoading]             = useState(true)
  const [modalOpen, setModalOpen]         = useState(false)
  const [resetModal, setResetModal]       = useState(false)
  const [eliminarModal, setEliminarModal] = useState(false)
  const [refugioSeleccionado, setRefugioSeleccionado] = useState<Refugio | null>(null)
  const [adminSeleccionado, setAdminSeleccionado]     = useState<Admin | null>(null)
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [resetting, setResetting]         = useState(false)
  const [eliminando, setEliminando]       = useState(false)
  const [resetFeedback, setResetFeedback] = useState<{ type: 'ok' | 'error'; msg: string } | null>(null)
  const [saving, setSaving]               = useState(false)
  const [feedback, setFeedback]           = useState<{ type: 'ok' | 'error'; msg: string } | null>(null)

  const [form, setForm] = useState({
    nombre: '', ciudad: '', estado: '',
    correo_contacto: '', telefono: '',
    correo_admin: '', password_admin: '',
  })

  useEffect(() => { fetchRefugios() }, [])

  async function fetchRefugios() {
    setLoading(true)
    const { data } = await supabase
      .from('refugio')
      .select(`id_refugio, nombre, ciudad, estado, correo_contacto, activo, albergue_perfil ( slug )`)
      .eq('activo', true)
      .order('id_refugio', { ascending: false })
    setRefugios((data as Refugio[]) ?? [])
    setLoading(false)
  }

  async function abrirResetPassword(refugio: Refugio) {
    const { data } = await supabase
      .from('usuario')
      .select('id_usuario, nombre_completo, correo')
      .eq('id_refugio', refugio.id_refugio)
      .eq('activo', true)
      .limit(1)
      .single()
    if (!data) { alert('No se encontró administrador para este albergue.'); return }
    setAdminSeleccionado(data as Admin)
    setNuevaPassword('')
    setResetFeedback(null)
    setResetModal(true)
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!adminSeleccionado) return
    setResetting(true)
    setResetFeedback(null)
    const res = await fetch('/api/superadmin/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correo: adminSeleccionado.correo,
        nueva_password: nuevaPassword,
      }),
    })
    if (res.ok) {
      setResetFeedback({ type: 'ok', msg: 'Contraseña actualizada correctamente.' })
      setNuevaPassword('')
    } else {
      const err = await res.json()
      setResetFeedback({ type: 'error', msg: err.error ?? 'Error al cambiar contraseña.' })
    }
    setResetting(false)
  }

  async function handleEliminar() {
    if (!refugioSeleccionado) return
    setEliminando(true)
    const res = await fetch('/api/superadmin/delete-refugio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_refugio: refugioSeleccionado.id_refugio }),
    })
    if (res.ok) {
      setEliminarModal(false)
      setRefugioSeleccionado(null)
      fetchRefugios()
    } else {
      const err = await res.json()
      alert(err.error ?? 'Error al eliminar.')
    }
    setEliminando(false)
  }

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setFeedback(null)

    try {
      // 1. Crear el refugio
      const { data: refugioData, error: refugioError } = await supabase
        .from('refugio')
        .insert({
          nombre: form.nombre,
          ciudad: form.ciudad,
          estado: form.estado,
          correo_contacto: form.correo_contacto,
          telefono: form.telefono,
        })
        .select('id_refugio')
        .single()

      if (refugioError) throw new Error('Error al crear refugio: ' + refugioError.message)

      // 2. Crear perfil + admin en el API route (usa service_role, salta RLS)
      const res = await fetch('/api/superadmin/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: form.correo_admin,
          password: form.password_admin,
          id_refugio: refugioData.id_refugio,
          nombre_refugio: form.nombre,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Error al crear credenciales')
      }

      setFeedback({ type: 'ok', msg: `Albergue "${form.nombre}" creado correctamente.` })
      setForm({
        nombre: '', ciudad: '', estado: '',
        correo_contacto: '', telefono: '',
        correo_admin: '', password_admin: '',
      })
      fetchRefugios()
    } catch (err: unknown) {
      setFeedback({ type: 'error', msg: err instanceof Error ? err.message : 'Error desconocido' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>

      {/* Header */}
      <header className="border-b border-border px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: '#43AE6D' }}>P</div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Pixkki</h1>
            <p className="text-xs text-muted-foreground">Panel Super Administrador</p>
          </div>
        </div>
        <button
          onClick={async () => { await supabase.auth.signOut(); router.push('/auth/login') }}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-red-500 transition-colors">
          <LogOut size={16} /> Cerrar sesión
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-10">

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3 mb-1">
              <Building2 size={18} className="text-primary" />
              <span className="text-sm text-muted-foreground">Total albergues</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{refugios.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3 mb-1">
              <Users size={18} className="text-primary" />
              <span className="text-sm text-muted-foreground">Albergues activos</span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {refugios.filter((r) => r.activo).length}
            </p>
          </div>
        </div>

        {/* Tabla */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Albergues registrados</h2>
          <button
            onClick={() => { setModalOpen(true); setFeedback(null) }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition"
            style={{ backgroundColor: '#43AE6D' }}>
            <Plus size={14} /> Nuevo albergue
          </button>
        </div>

        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Albergue</th>
                <th className="text-left px-4 py-3 font-medium">Ubicación</th>
                <th className="text-left px-4 py-3 font-medium">Correo contacto</th>
                <th className="text-left px-4 py-3 font-medium">URL pública</th>
                <th className="text-center px-4 py-3 font-medium">Contraseña admin</th>
                <th className="text-center px-4 py-3 font-medium">Eliminar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-muted-foreground">
                    Cargando...
                  </td>
                </tr>
              ) : refugios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-muted-foreground">
                    Sin albergues registrados
                  </td>
                </tr>
              ) : (
                refugios.map((r) => (
                  <tr key={r.id_refugio}
                    className="border-t border-border hover:bg-secondary/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{r.nombre}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.ciudad}, {r.estado}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.correo_contacto}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {r.albergue_perfil?.slug ? `/albergue/${r.albergue_perfil.slug}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => abrirResetPassword(r)}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors">
                        <KeyRound size={12} /> Cambiar contraseña
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => { setRefugioSeleccionado(r); setEliminarModal(true) }}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={12} /> Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal nuevo albergue */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-2xl border border-border w-full max-w-lg p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground mb-5">
              Nuevo albergue y administrador
            </h3>

            {feedback && (
              <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
                feedback.type === 'ok'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {feedback.msg}
              </div>
            )}

            <form onSubmit={handleCrear} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Nombre del albergue *
                  </label>
                  <input required value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Ciudad *</label>
                  <input required value={form.ciudad}
                    onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Estado *</label>
                  <input required value={form.estado}
                    onChange={(e) => setForm({ ...form, estado: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Teléfono</label>
                  <input value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Correo de contacto del albergue *
                </label>
                <input required type="email" value={form.correo_contacto}
                  onChange={(e) => setForm({ ...form, correo_contacto: e.target.value })}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>

              <hr className="border-border" />

              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Mail size={12} /> Credenciales del administrador
              </p>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Correo del administrador *
                </label>
                <input required type="email" value={form.correo_admin}
                  onChange={(e) => setForm({ ...form, correo_admin: e.target.value })}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Contraseña temporal *
                </label>
                <input required type="password" value={form.password_admin}
                  onChange={(e) => setForm({ ...form, password_admin: e.target.value })}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button"
                  onClick={() => { setModalOpen(false); setFeedback(null) }}
                  className="flex-1 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-secondary transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition"
                  style={{ backgroundColor: '#43AE6D' }}>
                  {saving ? 'Creando...' : 'Crear albergue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal reset contraseña */}
      {resetModal && adminSeleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-2xl border border-border w-full max-w-sm p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: '#43AE6D' }}>
                {adminSeleccionado.nombre_completo[0]}
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">
                  {adminSeleccionado.nombre_completo}
                </p>
                <p className="text-xs text-muted-foreground">{adminSeleccionado.correo}</p>
              </div>
            </div>

            {resetFeedback && (
              <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
                resetFeedback.type === 'ok'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {resetFeedback.msg}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Nueva contraseña *
                </label>
                <input required type="password" value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="flex gap-3">
                <button type="button"
                  onClick={() => { setResetModal(false); setResetFeedback(null) }}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-secondary transition-colors">
                  Cerrar
                </button>
                <button type="submit" disabled={resetting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition"
                  style={{ backgroundColor: '#43AE6D' }}>
                  {resetting ? 'Guardando...' : 'Cambiar contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminar */}
      {eliminarModal && refugioSeleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-2xl border border-border w-full max-w-sm p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={18} className="text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Eliminar albergue</p>
                <p className="text-xs text-muted-foreground">{refugioSeleccionado.nombre}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Esta acción desactivará el albergue y{' '}
              <span className="font-semibold text-foreground">bloqueará el acceso</span>{' '}
              a todos los usuarios asociados. No se eliminarán los datos históricos.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setEliminarModal(false); setRefugioSeleccionado(null) }}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-secondary transition-colors">
                Cancelar
              </button>
              <button onClick={handleEliminar} disabled={eliminando}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 transition">
                {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}