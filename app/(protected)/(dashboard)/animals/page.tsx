'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client'
import { Plus, Search, PawPrint, X, Save, Stethoscope } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {Animal, CreateAnimalInput, UpdateAnimalInput} from "@/modules/animals/types";
import {createAnimal, deleteAnimal, fetchAnimals, updateAnimal} from "@/modules/animals/client";
import {AnimalFormData} from "@/app/(protected)/(dashboard)/animals/types";
import {toCreateAnimalInput} from "@/app/(protected)/(dashboard)/animals/form-mapper";
import {AnimalState} from "@/modules/catalogs/animal-states/types";


type Espacio      = { id_espacio: number; nombre_espacio: string }

export default function AnimalsPage() {
  const supabase = getSupabaseBrowserClient()

  const [idRefugio, setIdRefugio]   = useState<number | null>(null)
  const [animales, setAnimales]     = useState<Animal[]>([])
  const [estados, setEstados]       = useState<AnimalState[]>([])
  const [espacios, setEspacios]     = useState<Espacio[]>([])
  const [loading, setLoading]       = useState(true)
  const [busqueda, setBusqueda]     = useState('')
  const [modalOpen, setModalOpen]   = useState(false)
  const [saving, setSaving]         = useState(false)
  const [feedback, setFeedback]     = useState<{ type: 'ok' | 'error'; msg: string } | null>(null)
  const [animalDetalle, setAnimalDetalle] = useState<Animal | null>(null)

  const [form, setForm] = useState<AnimalFormData>({
    nombre: "",
    especie: 'Perro',
    raza: "",
    sexo: "",
    edadEstimada: "",
    peso: "",
    procedencia: "",
    rasgosFisicos: "",
    estadoInicial: "",
    idEstado: "",
    idEspacio: "",
    enCuarentena: false,
    esterilizado: false,
    disponibleParaAdopcion: false,
  });

  // Crear animal
  const handleCreate = async (formData: CreateAnimalInput) => {
    setSaving(true);
    try {
      const newAnimal = await createAnimal(formData);
      setAnimales(prev => [...prev, newAnimal]);
      setModalOpen(false);
      setFeedback({ type: 'ok', msg: 'Animal creado exitosamente' });
    } catch (error) {
      setFeedback({ type: 'error', msg: 'Error al crear animal' });
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = async (
      e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    try {
      const input = toCreateAnimalInput(form);
      await handleCreate(input);
    } catch (error) {
      // Errores de validación de Zod
      setFeedback({
        type: "error",
        msg: "Revisa los datos del formulario.",
      });
    }
  };

  // Actualizar animal
  const handleUpdate = async (id: number, data: UpdateAnimalInput) => {
    try {
      const updated = await updateAnimal(id, data);
      setAnimales(prev => prev.map(a => a.id === id ? updated : a));
      setFeedback({ type: 'ok', msg: 'Animal actualizado' });
    } catch (error) {
      setFeedback({ type: 'error', msg: 'Error al actualizar' });
    }
  };

  // Eliminar animal
  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este animal?')) return;
    try {
      await deleteAnimal(id);
      setAnimales(prev => prev.filter(a => a.id !== id));
      setFeedback({ type: 'ok', msg: 'Animal eliminado' });
    } catch (error) {
      setFeedback({ type: 'error', msg: 'Error al eliminar' });
    }
  };

  // useEffect para carga inicial
  useEffect(() => {
    async function loadEstados() {
      const response = await fetch("/api/catalogs/animal-states");
      const data = await response.json();
      setEstados(data);
    }
    const loadAnimals = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/animals')
        if (!response.ok) throw new Error('Error al cargar animales')
        const json = await response.json()
        setAnimales(Array.isArray(json?.data) ? json.data : [])
      } catch (error) {
        console.error('Error:', error)
        setAnimales([])
        setFeedback({ type: 'error', msg: 'Error al cargar animales' })
      } finally {
        setLoading(false)
      }
    }
    loadAnimals()
    loadEstados()
  }, [])

  /*function resetForm() {
    setForm({
      nombre: '', especie: 'Perro', raza: '', sexo: 'M',
      edadEstimada: '', peso: '', procedencia: '',
      rasgosFisicos: '', estadoInicial: '',
      idEstado: estados[0]?.id_estado?.toString() ?? '',
      idEspacio: espacios[0]?.id_espacio?.toString() ?? '',
      enCuarentena: false, esterilizado: false, disponibleParaAdopcion: false,
    })
    setFeedback(null)
  }*/

  // Filtrar animales - con validación de seguridad
  const animalesFiltrados = Array.isArray(animales)
      ? animales.filter((a) =>
          `${a?.nombre ?? ''} ${a?.especie ?? ''} ${a?.raza ?? ''}`
              .toLowerCase()
              .includes(busqueda.toLowerCase())
      )
      : []


  const inputCls = "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
  const labelCls = "block text-xs font-medium text-foreground mb-1"

  return (
    <div className="p-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Animales</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {animalesFiltrados.length} animal{animalesFiltrados.length !== 1 ? 'es' : ''} registrado{animalesFiltrados.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => { {/*esetForm();*/} setModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition"
          style={{ backgroundColor: '#43AE6D' }}>
          <Plus size={15} /> Registrar animal
        </Button>
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
            <div key={animal.id}
              className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setAnimalDetalle(animal)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {/*<span className="text-2xl">{ESPECIE_EMOJI[animal.especie] ?? '🐾'}</span>*/}
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
                  animal.disponibleAdopcion
                    ? 'bg-green-100 text-green-700'
                    : 'bg-secondary text-muted-foreground'
                }`}>
                  {animal.disponibleAdopcion ? 'En adopción' : 'No disponible'}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2 py-1 rounded-lg bg-secondary text-muted-foreground">
                  {animal.estado?.nombre}
                </span>
                {animal.cuarentena && (
                  <span className="text-xs px-2 py-1 rounded-lg bg-orange-100 text-orange-600">Cuarentena</span>
                )}
                {animal.esterilizado && (
                  <span className="text-xs px-2 py-1 rounded-lg bg-blue-100 text-blue-600">Esterilizado</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                📍 {animal.espacio?.nombre ?? '—'}
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

            <form
                onSubmit={onSubmit}
                className="space-y-4">
              {/* Fila 1 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Nombre (opcional)</label>
                  <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej. Firulais" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Especie *</label>
                  <select
                      required value={form.especie}
                      onChange={(e) =>
                          setForm(
                              { ...form,
                                especie: e.target.value as "Perro" | "Gato",
                              })}
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
                  <select
                      required value={form.sexo}
                      onChange={(
                          e) =>
                          setForm({ ...form, sexo: e.target.value as "H" | "M" | ""}
                          )}
                    className={inputCls}>
                    <option value="M">Macho</option>
                    <option value="H">Hembra</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Edad estimada (meses)</label>
                  <input type="number" min="0" value={form.edadEstimada}
                    onChange={(e) => setForm({ ...form, edadEstimada: e.target.value })}
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
                  <label className={labelCls}>Orígen *</label>
                  <input required value={form.procedencia}
                    onChange={(e) => setForm({ ...form, procedencia: e.target.value })}
                    placeholder="Ej. Avenida, aguas sucias," className={inputCls} />
                </div>
              </div>

              {/* Estado y espacio */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Estado *</label>
                  <select required value={form.idEstado}
                    onChange={(e) => setForm({ ...form, idEstado: e.target.value })}
                    className={inputCls}>
                    <option value="">Seleccionar...</option>
                    {estados.map((e) => (
                      <option key={e.id_estado} value={e.id_estado}>{e.nombre_estado}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Espacio / Lugar *</label>
                  <select required value={form.idEspacio}
                    onChange={(e) => setForm({ ...form, idEspacio: e.target.value })}
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
                <textarea required value={form.rasgosFisicos}
                  onChange={(e) => setForm({ ...form, rasgosFisicos: e.target.value })}
                  placeholder="Color, marcas, tamaño..." rows={2}
                  className={`${inputCls} resize-none`} />
              </div>
              <div>
                <label className={labelCls}>Estado inicial al ingreso *</label>
                <textarea required value={form.estadoInicial}
                  onChange={(e) => setForm({ ...form, estadoInicial: e.target.value })}
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
              {/*<div className="text-5xl mb-2">{ESPECIE_EMOJI[animalDetalle.especie] ?? '🐾'}</div>*/}
              <h2 className="text-xl font-bold text-foreground">
                {animalDetalle.nombre ?? `${animalDetalle.especie} sin nombre`}
              </h2>
              <p className="text-sm text-muted-foreground">
                {animalDetalle.raza ?? animalDetalle.especie} · {animalDetalle.sexo === 'M' ? 'Macho' : 'Hembra'}
              </p>
            </div>

            <div className="space-y-3 text-sm">
              {[
                { label: 'Estado', val: animalDetalle.estado?.nombre },
                { label: 'Espacio', val: animalDetalle.espacio?.nombre },
                { label: 'Edad estimada', val: animalDetalle.edadEstimada ? `${animalDetalle.edadEstimada} meses` : '—' },
                { label: 'Peso', val: animalDetalle.peso ? `${animalDetalle.peso} kg` : '—' },
                { label: 'Procedencia', val: animalDetalle.procedencia },
                { label: 'Rasgos físicos', val: animalDetalle.rasgosFisicos },
                { label: 'Estado inicial', val: animalDetalle.estadoInicial },
              ].map(({ label, val }) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="text-foreground">{val ?? '—'}</p>
                </div>
              ))}

              <div className="flex gap-2 flex-wrap pt-2">
                {animalDetalle.cuarentena && (
                  <span className="text-xs px-2 py-1 rounded-lg bg-orange-100 text-orange-600">Cuarentena</span>
                )}
                {animalDetalle.esterilizado && (
                  <span className="text-xs px-2 py-1 rounded-lg bg-blue-100 text-blue-600">Esterilizado</span>
                )}
                {animalDetalle.disponibleAdopcion && (
                  <span className="text-xs px-2 py-1 rounded-lg bg-green-100 text-green-700">En adopción</span>
                )}
              </div>
            </div>

            {/* Acciones */}
            <div className="mt-8 space-y-3">
              <button
                //onClick={() => toggleDisponible(animalDetalle)}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold border transition ${
                  animalDetalle.disponibleAdopcion
                    ? 'border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100'
                    : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                }`}>
                {animalDetalle.disponibleAdopcion ? 'Marcar como no disponible' : 'Marcar disponible para adopción'}
              </button>
              <button
                //onClick={() => darDeBaja(animalDetalle)}
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