'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client'
import {
  GripVertical, Eye, EyeOff, Trash2, Save,
  Type, Image, Grid, Phone, MapPin, Share2, Heart, Layers
} from 'lucide-react'

type BloqueType = 'hero' | 'texto' | 'galeria' | 'animales' | 'contacto' | 'mapa' | 'redes' | 'donacion'

type Bloque = {
  id_bloque?: number
  tipo: BloqueType
  orden: number
  visible: boolean
  contenido: Record<string, unknown>
}

const TIPO_META: Record<BloqueType, { label: string; icon: React.ElementType; color: string }> = {
  hero:     { label: 'Portada / Hero',       icon: Image,  color: '#6366f1' },
  texto:    { label: 'Texto libre',          icon: Type,   color: '#0ea5e9' },
  galeria:  { label: 'Galería',             icon: Grid,   color: '#f59e0b' },
  animales: { label: 'Animales en adopción', icon: Heart,  color: '#ec4899' },
  contacto: { label: 'Contacto',            icon: Phone,  color: '#10b981' },
  mapa:     { label: 'Mapa',               icon: MapPin, color: '#f97316' },
  redes:    { label: 'Redes sociales',      icon: Share2, color: '#8b5cf6' },
  donacion: { label: 'Donación',            icon: Heart,  color: '#ef4444' },
}

export default function MiAlberguePage() {
  const supabase = getSupabaseBrowserClient()

  const [idPerfil, setIdPerfil]             = useState<number | null>(null)
  const [bloques, setBloques]               = useState<Bloque[]>([])
  const [bloqueActivo, setBloqueActivo]     = useState<number | null>(null)
  const [saving, setSaving]                 = useState(false)
  const [saved, setSaved]                   = useState(false)
  const [dragIndex, setDragIndex]           = useState<number | null>(null)
  const [visible, setVisible]               = useState(false)
  const [togglingVisible, setTogglingVisible] = useState(false)
  const [errorMsg, setErrorMsg]             = useState<string | null>(null)

  const cargar = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return

    const { data: usuarioData, error: uErr } = await supabase
      .from('usuario')
      .select('id_refugio')
      .eq('correo', user.email)
      .single()

    if (uErr || !usuarioData) {
      setErrorMsg('No se encontró tu usuario en la base de datos.')
      return
    }

    const { data: perfilData, error: pErr } = await supabase
      .from('albergue_perfil')
      .select('id_perfil, visible_publico')
      .eq('id_refugio', usuarioData.id_refugio)
      .single()

    if (pErr || !perfilData) {
      setErrorMsg('Tu albergue no tiene perfil configurado. Contacta al super administrador.')
      return
    }

    setIdPerfil(perfilData.id_perfil)
    setVisible(perfilData.visible_publico)

    const { data: bloquesData } = await supabase
      .from('albergue_bloque')
      .select('*')
      .eq('id_perfil', perfilData.id_perfil)
      .order('orden')

    setBloques((bloquesData as Bloque[]) ?? [])
  }, [supabase])

  useEffect(() => { cargar() }, [cargar])

  async function toggleVisiblePublico() {
    if (!idPerfil) return
    setTogglingVisible(true)
    const nuevo = !visible
    const { error } = await supabase
      .from('albergue_perfil')
      .update({ visible_publico: nuevo })
      .eq('id_perfil', idPerfil)
    if (error) {
      setErrorMsg('Error al cambiar visibilidad: ' + error.message)
    } else {
      setVisible(nuevo)
    }
    setTogglingVisible(false)
  }

  function agregarBloque(tipo: BloqueType) {
    const nuevo: Bloque = { tipo, orden: bloques.length, visible: true, contenido: {} }
    setBloques([...bloques, nuevo])
    setBloqueActivo(bloques.length)
  }

  function toggleVisible(idx: number) {
    setBloques(bloques.map((b, i) => i === idx ? { ...b, visible: !b.visible } : b))
  }

  function eliminar(idx: number) {
    setBloques(bloques.filter((_, i) => i !== idx).map((b, i) => ({ ...b, orden: i })))
    if (bloqueActivo === idx) setBloqueActivo(null)
  }

  function actualizarContenido(idx: number, key: string, value: unknown) {
    setBloques(bloques.map((b, i) =>
      i === idx ? { ...b, contenido: { ...b.contenido, [key]: value } } : b
    ))
  }

  function onDragStart(idx: number) { setDragIndex(idx) }
  function onDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault()
    if (dragIndex === null || dragIndex === idx) return
    const reordered = [...bloques]
    const [moved] = reordered.splice(dragIndex, 1)
    reordered.splice(idx, 0, moved)
    setBloques(reordered.map((b, i) => ({ ...b, orden: i })))
    setDragIndex(idx)
  }
  function onDragEnd() { setDragIndex(null) }

  async function guardar() {
    if (!idPerfil) {
      setErrorMsg('No se encontró el perfil del albergue.')
      return
    }
    setSaving(true)
    setErrorMsg(null)

    for (const bloque of bloques) {
      if (bloque.id_bloque) {
        const { error } = await supabase.from('albergue_bloque').update({
          tipo: bloque.tipo,
          orden: bloque.orden,
          visible: bloque.visible,
          contenido: bloque.contenido,
        }).eq('id_bloque', bloque.id_bloque)
        if (error) { setErrorMsg('Error al guardar: ' + error.message); setSaving(false); return }
      } else {
        const { error } = await supabase.from('albergue_bloque').insert({
          id_perfil: idPerfil,
          tipo: bloque.tipo,
          orden: bloque.orden,
          visible: bloque.visible,
          contenido: bloque.contenido,
        })
        if (error) { setErrorMsg('Error al guardar: ' + error.message); setSaving(false); return }
      }
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    cargar()
  }

  if (errorMsg) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 max-w-md text-sm">
          <p className="font-semibold mb-1">Error</p>
          <p>{errorMsg}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Panel izquierdo */}
      <div className="w-64 flex-shrink-0 border-r border-border bg-card h-full overflow-y-auto p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Agregar bloque
        </p>
        <div className="space-y-1.5">
          {(Object.keys(TIPO_META) as BloqueType[]).map((tipo) => {
            const { label, icon: Icon, color } = TIPO_META[tipo]
            return (
              <button key={tipo} onClick={() => agregarBloque(tipo)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left hover:bg-secondary transition-colors">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${color}20` }}>
                  <Icon size={14} style={{ color }} />
                </div>
                <span className="text-foreground">{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-y-auto p-6 bg-background">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Editor de mi albergue</h2>
            <p className="text-sm text-muted-foreground">Arrastra los bloques para reordenarlos</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleVisiblePublico} disabled={togglingVisible || !idPerfil}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition border disabled:opacity-50 ${
                visible
                  ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                  : 'bg-secondary border-border text-muted-foreground hover:bg-secondary/80'
              }`}>
              {visible ? <Eye size={14} /> : <EyeOff size={14} />}
              {togglingVisible ? 'Guardando...' : visible ? 'Visible al público' : 'Oculto al público'}
            </button>
            <button onClick={guardar} disabled={saving || !idPerfil}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#43AE6D' }}>
              <Save size={14} />
              {saved ? '¡Guardado!' : saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>

        {bloques.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 rounded-2xl border-2 border-dashed border-border text-muted-foreground">
            <Layers size={32} className="mb-3 opacity-40" />
            <p className="text-sm">Agrega bloques desde el panel izquierdo</p>
          </div>
        )}

        <div className="space-y-3">
          {bloques.map((bloque, idx) => {
            const { label, icon: Icon, color } = TIPO_META[bloque.tipo]
            const isActive = bloqueActivo === idx
            return (
              <div key={idx} draggable
                onDragStart={() => onDragStart(idx)}
                onDragOver={(e) => onDragOver(e, idx)}
                onDragEnd={onDragEnd}
                className={`rounded-2xl border bg-card transition-all cursor-grab active:cursor-grabbing ${
                  isActive ? 'border-primary shadow-md' : 'border-border hover:border-primary/40'
                } ${!bloque.visible ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                  onClick={() => setBloqueActivo(isActive ? null : idx)}>
                  <GripVertical size={16} className="text-muted-foreground flex-shrink-0" />
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${color}20` }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <span className="text-sm font-medium text-foreground flex-1">{label}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); toggleVisible(idx) }}
                      className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
                      {bloque.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); eliminar(idx) }}
                      className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors text-muted-foreground">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {isActive && (
                  <div className="px-4 pb-4 border-t border-border pt-3">
                    <BloqueEditor tipo={bloque.tipo} contenido={bloque.contenido}
                      onChange={(key, val) => actualizarContenido(idx, key, val)} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function BloqueEditor({ tipo, contenido, onChange }: {
  tipo: BloqueType
  contenido: Record<string, unknown>
  onChange: (key: string, val: unknown) => void
}) {
  const input = (label: string, key: string, placeholder = '') => (
    <div>
      <label className="block text-xs font-medium text-foreground mb-1">{label}</label>
      <input value={(contenido[key] as string) ?? ''} onChange={(e) => onChange(key, e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
    </div>
  )
  const textarea = (label: string, key: string, placeholder = '') => (
    <div>
      <label className="block text-xs font-medium text-foreground mb-1">{label}</label>
      <textarea value={(contenido[key] as string) ?? ''} onChange={(e) => onChange(key, e.target.value)}
        placeholder={placeholder} rows={4}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
    </div>
  )

  switch (tipo) {
    case 'hero': return <div className="space-y-3">
      {input('Título principal', 'titulo', 'Ej. Bienvenido a nuestro albergue')}
      {input('Subtítulo', 'subtitulo', 'Ej. Encuentra a tu compañero ideal')}
      {input('URL imagen de fondo', 'imagen_url', 'https://...')}
      {input('Texto del botón CTA', 'cta_texto', 'Ver animales en adopción')}
    </div>
    case 'texto': return <div className="space-y-3">
      {input('Título de la sección', 'titulo', 'Ej. Sobre nosotros')}
      {textarea('Contenido', 'cuerpo', 'Escribe aquí tu texto...')}
    </div>
    case 'galeria': return <div className="space-y-3">
      {input('Título de la galería', 'titulo', 'Galería de nuestro albergue')}
      <div>
        <label className="block text-xs font-medium text-foreground mb-1">URLs de imágenes (una por línea)</label>
        <textarea value={((contenido.imagenes as string[]) ?? []).join('\n')}
          onChange={(e) => onChange('imagenes', e.target.value.split('\n').filter(Boolean))}
          placeholder={'https://imagen1.com\nhttps://imagen2.com'} rows={5}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-mono" />
      </div>
    </div>
    case 'animales': return <div className="space-y-3">
      {input('Título de la sección', 'titulo', 'Animales disponibles en adopción')}
      <p className="text-xs text-muted-foreground">Muestra automáticamente los animales con disponible_adopcion = true.</p>
    </div>
    case 'contacto': return <div className="space-y-3">
      {input('Teléfono', 'telefono', '+52 55 1234 5678')}
      {input('Correo', 'correo', 'contacto@albergue.com')}
      {input('Dirección', 'direccion', 'Calle, Colonia, Ciudad')}
      {input('Horario', 'horario', 'Lun–Vie 9am–6pm')}
    </div>
    case 'mapa': return <div className="space-y-3">
      {input('URL del embed de Google Maps', 'embed_url', 'https://maps.google.com/...')}
      <p className="text-xs text-muted-foreground">Google Maps → Compartir → Insertar mapa → copia el src del iframe.</p>
    </div>
    case 'redes': return <div className="space-y-3">
      {input('Facebook', 'facebook', 'https://facebook.com/...')}
      {input('Instagram', 'instagram', 'https://instagram.com/...')}
      {input('TikTok', 'tiktok', 'https://tiktok.com/@...')}
      {input('WhatsApp (con código de país)', 'whatsapp', '5215512345678')}
    </div>
    case 'donacion': return <div className="space-y-3">
      {input('Título', 'titulo', 'Apóyanos con una donación')}
      {textarea('Descripción', 'descripcion', 'Tu donación nos ayuda a...')}
      {input('Link de donación / pago', 'link', 'https://...')}
      {input('Texto del botón', 'boton_texto', 'Donar ahora')}
    </div>
    default: return null
  }
}