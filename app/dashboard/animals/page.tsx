'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client'
import { Plus, Search, PawPrint, X, Save, Stethoscope } from 'lucide-react'

type AnimalEstado = { id_estado: number; nombre_estado: string }
type Espacio      = { id_espacio: number; nombre_espacio: string }

type Animal = {
  id_animal: number
  nombre: string | null
  especie: string
  raza: string | null
  sexo: string
  edad_estimada: number | null
  peso: number | null
  procedencia: string
  rasgos_fisicos: string
  estado_inicial: string
  en_cuarentena: boolean
  esterilizado: boolean
  disponible_adopcion: boolean
  activo: boolean
  animal_estado: { nombre_estado: string }
  espacio: { nombre_espacio: string }
}

const ESPECIE_EMOJI: Record<string, string> = { Perro: '🐶', Gato: '🐱' }

export default function AnimalsPage() {
  const supabase = getSupabaseBrowserClient()

  const [idRefugio, setIdRefugio]   = useState<number | null>(null)
  const [animales, setAnimales]     = useState<Animal[]>([])
  const [estados, setEstados]       = useState<AnimalEstado[]>([])
  const [espacios, setEspacios]     = useState<Espacio[]>([])
  const [loading, setLoading]       = useState(true)
  const [busqueda, setBusqueda]     = useState('')
  const [modalOpen, setModalOpen]   = useState(false)
  const [saving, setSaving]         = useState(false)
  const [feedback, setFeedback]     = useState<{ type: 'ok' | 'error'; msg: string } | null>(null)
  const [animalDetalle, setAnimalDetalle] = useState<Animal | null>(null)

  const [form, setForm] = useState({
    nombre: '',
    especie: 'Perro',
    raza: '',
    sexo: 'M',
    edad_estimada: '',
    peso: '',
    procedencia: '',
    rasgos_fisicos: '',
    estado_inicial: '',
    id_estado: '',
    id_espacio: '',
    en_cuarentena: false,
    esterilizado: false,
    disponible_adopcion: false,
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

    const [animalesRes, estadosRes, espaciosRes] = await Promise.all([
      supabase
        .from('animal')
        .select(`
          id_animal, nombre, especie, raza, sexo, edad_estimada, peso,
          procedencia, rasgos_fisicos, estado_inicial,
          en_cuarentena, esterilizado, disponible_adopcion, activo,
          animal_estado ( nombre_estado ),
          espacio ( nombre_espacio )
        `)
        .eq('id_refugio', usuarioData.id_refugio)
        .eq('activo', true)
        .order('id_animal', { ascending: false }),

      supabase.from('animal_estado').select('id_estado, nombre_estado'),
      supabase.from('espacio').select('id_espacio, nombre_espacio').eq('id_refugio', usuarioData.id_refugio),
    ])

    setAnimales((animalesRes.data as Animal[]) ?? [])
    setEstados((estadosRes.data as AnimalEstado[]) ?? [])
    setEspacios((espaciosRes.data as Espacio[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { cargar() }, [cargar])

  const animalesFiltrados = animales.filter((a) =>
    `${a.nombre ?? ''} ${a.especie} ${a.raza ?? ''}`.toLowerCase().includes(busqueda.toLowerCase())
  )

  function resetForm() {
    setForm({
      nombre: '', especie: 'Perro', raza: '', sexo: 'M',
      edad_estimada: '', peso: '', procedencia: '',
      rasgos_fisicos: '', estado_inicial: '',
      id_estado: estados[0]?.id_estado?.toString() ?? '',
      id_espacio: espacios[0]?.id_espacio?.toString() ?? '',
      en_cuarentena: false, esterilizado: false, disponible_adopcion: false,
    })
    setFeedback(null)
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault()
    if (!idRefugio) return
    setSaving(true)
    setFeedback(null)

    const uuid = crypto.randomUUID()

    const { error } = await supabase.from('animal').insert({
      uuid,
      id_refugio: idRefugio,
      id_estado: parseInt(form.id_estado),
      id_espacio: parseInt(form.id_espacio),
      nombre: form.nombre || null,
      especie: form.especie,
      raza: form.raza || null,
      sexo: form.sexo,
      edad_estimada: form.edad_estimada ? parseInt(form.edad_estimada) : null,
      peso: form.peso ? parseFloat(form.peso) : null,
      procedencia: form.procedencia,
      rasgos_fisicos: form.rasgos_fisicos,
      estado_inicial: form.estado_inicial,
      en_cuarentena: form.en_cuarentena,
      esterilizado: form.esterilizado,
      disponible_adopcion: form.disponible_adopcion,
      activo: true,
    })

    if (error) {
      setFeedback({ type: 'error', msg: error.message })
    } else {
      setFeedback({ type: 'ok', msg: 'Animal registrado correctamente.' })
      resetForm()
      cargar()
    }
    setSaving(false)
  }

  async function toggleDisponible(animal: Animal) {
    await supabase
      .from('animal')
      .update({ disponible_adopcion: !animal.disponible_adopcion })
      .eq('id_animal', animal.id_animal)
    cargar()
  }

  async function darDeBaja(animal: Animal) {
    await supabase
      .from('animal')
      .update({ activo: false })
      .eq('id_animal', animal.id_animal)
    setAnimalDetalle(null)
    cargar()
  }

  const inputCls = "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
  const labelCls = "block text-xs font-medium text-foreground mb-1"

  return (
    <div className="p-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Animales</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {animales.length} animal{animales.length !== 1 ? 'es' : ''} registrado{animales.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => { resetForm(); setModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition"
          style={{ backgroundColor: '#43AE6D' }}>
          <Plus size={15} /> Registrar animal
        </button>
      </div>

      {/* Buscador */}
      <div className="relative mb-6">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, especie o raza..."
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Grid de animales */}
      {loading ? (
        <div className="flex justify-center py-20">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : animalesFiltrados.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <PawPrint size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No hay animales registrados</p>
          <p className="text-sm mt-1">Registra el primer animal con el botón de arriba</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {animalesFiltrados.map((animal) => (
            <div key={animal.id_animal}
              className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setAnimalDetalle(animal)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{ESPECIE_EMOJI[animal.especie] ?? '🐾'}</span>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {animal.nombre ?? `${animal.especie} sin nombre`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {animal.raza ?? animal.especie} · {animal.sexo === 'M' ? 'Macho' : 'Hembra'}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  animal.disponible_adopcion
                    ? 'bg-green-100 text-green-700'
                    : 'bg-secondary text-muted-foreground'
                }`}>
                  {animal.disponible_adopcion ? 'En adopción' : 'No disponible'}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2 py-1 rounded-lg bg-secondary text-muted-foreground">
                  {animal.animal_estado?.nombre_estado}
                </span>
                {animal.en_cuarentena && (
                  <span className="text-xs px-2 py-1 rounded-lg bg-orange-100 text-orange-600">Cuarentena</span>
                )}
                {animal.esterilizado && (
                  <span className="text-xs px-2 py-1 rounded-lg bg-blue-100 text-blue-600">Esterilizado</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                📍 {animal.espacio?.nombre_espacio ?? '—'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal registrar animal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-background rounded-2xl border border-border w-full max-w-2xl p-6 shadow-xl my-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-foreground">Registrar animal</h3>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            {feedback && (
              <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${
                feedback.type === 'ok'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>{feedback.msg}</div>
            )}

            <form onSubmit={handleGuardar} className="space-y-4">
              {/* Fila 1 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Nombre (opcional)</label>
                  <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej. Firulais" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Especie *</label>
                  <select required value={form.especie} onChange={(e) => setForm({ ...form, especie: e.target.value })}
                    className={inputCls}>
                    <option value="Perro">Perro</option>
                    <option value="Gato">Gato</option>
                  </select>
                </div>
              </div>

              {/* Fila 2 */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Raza</label>
                  <input value={form.raza} onChange={(e) => setForm({ ...form, raza: e.target.value })}
                    placeholder="Ej. Labrador" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Sexo *</label>
                  <select required value={form.sexo} onChange={(e) => setForm({ ...form, sexo: e.target.value })}
                    className={inputCls}>
                    <option value="M">Macho</option>
                    <option value="F">Hembra</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Edad estimada (meses)</label>
                  <input type="number" min="0" value={form.edad_estimada}
                    onChange={(e) => setForm({ ...form, edad_estimada: e.target.value })}
                    placeholder="Ej. 12" className={inputCls} />
                </div>
              </div>

              {/* Fila 3 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Peso (kg)</label>
                  <input type="number" step="0.1" min="0" value={form.peso}
                    onChange={(e) => setForm({ ...form, peso: e.target.value })}
                    placeholder="Ej. 5.5" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Procedencia *</label>
                  <input required value={form.procedencia}
                    onChange={(e) => setForm({ ...form, procedencia: e.target.value })}
                    placeholder="Ej. Rescate callejero" className={inputCls} />
                </div>
              </div>

              {/* Estado y espacio */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Estado *</label>
                  <select required value={form.id_estado}
                    onChange={(e) => setForm({ ...form, id_estado: e.target.value })}
                    className={inputCls}>
                    <option value="">Seleccionar...</option>
                    {estados.map((e) => (
                      <option key={e.id_estado} value={e.id_estado}>{e.nombre_estado}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Espacio / Lugar *</label>
                  <select required value={form.id_espacio}
                    onChange={(e) => setForm({ ...form, id_espacio: e.target.value })}
                    className={inputCls}>
                    <option value="">Seleccionar...</option>
                    {espacios.map((e) => (
                      <option key={e.id_espacio} value={e.id_espacio}>{e.nombre_espacio}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Textos */}
              <div>
                <label className={labelCls}>Rasgos físicos *</label>
                <textarea required value={form.rasgos_fisicos}
                  onChange={(e) => setForm({ ...form, rasgos_fisicos: e.target.value })}
                  placeholder="Color, marcas, tamaño..." rows={2}
                  className={`${inputCls} resize-none`} />
              </div>
              <div>
                <label className={labelCls}>Estado inicial al ingreso *</label>
                <textarea required value={form.estado_inicial}
                  onChange={(e) => setForm({ ...form, estado_inicial: e.target.value })}
                  placeholder="Condición de salud al momento de ingreso..." rows={2}
                  className={`${inputCls} resize-none`} />
              </div>

              {/* Checkboxes */}
              <div className="flex items-center gap-6 pt-1">
                {[
                  { key: 'en_cuarentena',      label: 'En cuarentena' },
                  { key: 'esterilizado',        label: 'Esterilizado' },
                  { key: 'disponible_adopcion', label: 'Disponible para adopción' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                    <input type="checkbox"
                      checked={form[key as keyof typeof form] as boolean}
                      onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                      className="w-4 h-4 rounded accent-primary" />
                    {label}
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-secondary transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#43AE6D' }}>
                  <Save size={14} />
                  {saving ? 'Guardando...' : 'Registrar animal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Panel lateral — detalle del animal */}
      {animalDetalle && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={() => setAnimalDetalle(null)}>
          <div className="bg-background w-full max-w-sm h-full overflow-y-auto shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-foreground">Detalle del animal</h3>
              <button onClick={() => setAnimalDetalle(null)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="text-5xl mb-2">{ESPECIE_EMOJI[animalDetalle.especie] ?? '🐾'}</div>
              <h2 className="text-xl font-bold text-foreground">
                {animalDetalle.nombre ?? `${animalDetalle.especie} sin nombre`}
              </h2>
              <p className="text-sm text-muted-foreground">
                {animalDetalle.raza ?? animalDetalle.especie} · {animalDetalle.sexo === 'M' ? 'Macho' : 'Hembra'}
              </p>
            </div>

            <div className="space-y-3 text-sm">
              {[
                { label: 'Estado', val: animalDetalle.animal_estado?.nombre_estado },
                { label: 'Espacio', val: animalDetalle.espacio?.nombre_espacio },
                { label: 'Edad estimada', val: animalDetalle.edad_estimada ? `${animalDetalle.edad_estimada} meses` : '—' },
                { label: 'Peso', val: animalDetalle.peso ? `${animalDetalle.peso} kg` : '—' },
                { label: 'Procedencia', val: animalDetalle.procedencia },
                { label: 'Rasgos físicos', val: animalDetalle.rasgos_fisicos },
                { label: 'Estado inicial', val: animalDetalle.estado_inicial },
              ].map(({ label, val }) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="text-foreground">{val ?? '—'}</p>
                </div>
              ))}

              <div className="flex gap-2 flex-wrap pt-2">
                {animalDetalle.en_cuarentena && (
                  <span className="text-xs px-2 py-1 rounded-lg bg-orange-100 text-orange-600">Cuarentena</span>
                )}
                {animalDetalle.esterilizado && (
                  <span className="text-xs px-2 py-1 rounded-lg bg-blue-100 text-blue-600">Esterilizado</span>
                )}
                {animalDetalle.disponible_adopcion && (
                  <span className="text-xs px-2 py-1 rounded-lg bg-green-100 text-green-700">En adopción</span>
                )}
              </div>
            </div>

            {/* Acciones */}
            <div className="mt-8 space-y-3">
              <button
                onClick={() => toggleDisponible(animalDetalle)}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold border transition ${
                  animalDetalle.disponible_adopcion
                    ? 'border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100'
                    : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                }`}>
                {animalDetalle.disponible_adopcion ? 'Marcar como no disponible' : 'Marcar disponible para adopción'}
              </button>
              <button
                onClick={() => darDeBaja(animalDetalle)}
                className="w-full py-2.5 rounded-xl text-sm font-semibold border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition">
                Dar de baja
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground flex items-center gap-2 mb-3">
                <Stethoscope size={12} /> Expediente veterinario — próximamente
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}