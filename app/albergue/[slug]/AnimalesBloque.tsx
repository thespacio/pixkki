    'use client'

    import { useEffect, useState } from 'react'
    import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client'

    type Animal = {
    id_animal: number
    nombre: string
    especie: string
    raza: string | null
    edad_anios: number | null
    edad_meses: number | null
    sexo: string
    foto_url: string | null
    descripcion: string | null
    }

    export default function AnimalesBloque({
    idRefugio,
    titulo,
    primary,
    }: {
    idRefugio: number
    titulo: string
    primary: string
    }) {
    const supabase = getSupabaseBrowserClient()
    const [animales, setAnimales] = useState<Animal[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase
        .from('animal')
        .select('id_animal, nombre, especie, raza, edad_anios, edad_meses, sexo, foto_url, descripcion')
        .eq('id_refugio', idRefugio)
        .eq('disponible_adopcion', true)
        .order('id_animal', { ascending: false })
        .then(({ data }) => {
            setAnimales((data as Animal[]) ?? [])
            setLoading(false)
        })
    }, [idRefugio, supabase])

    function edadTexto(a: Animal) {
        if (a.edad_anios && a.edad_anios > 0) return `${a.edad_anios} año${a.edad_anios > 1 ? 's' : ''}`
        if (a.edad_meses && a.edad_meses > 0) return `${a.edad_meses} mes${a.edad_meses > 1 ? 'es' : ''}`
        return 'Edad desconocida'
    }

    return (
        <section id="animales" className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-3" style={{ color: primary }}>
            {titulo || 'Animales en adopción'}
            </h2>
            <p className="text-center text-gray-500 mb-14 text-sm">
            Estos peludos están esperando un hogar
            </p>

            {loading ? (
            <div className="flex justify-center py-20">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
                style={{ borderColor: primary, borderTopColor: 'transparent' }} />
            </div>
            ) : animales.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
                <p className="text-4xl mb-3">🐾</p>
                <p className="text-base font-medium">No hay animales disponibles por ahora</p>
            </div>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {animales.map((animal) => (
                <div key={animal.id_animal}
                    className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 group">
                    {/* Foto */}
                    <div className="h-52 overflow-hidden relative" style={{ backgroundColor: `${primary}20` }}>
                    {animal.foto_url ? (
                        <img src={animal.foto_url} alt={animal.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">
                        {animal.especie?.toLowerCase().includes('gato') ? '🐱' : '🐶'}
                        </div>
                    )}
                    {/* Badge sexo */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: animal.sexo === 'Macho' ? '#3b82f6' : '#ec4899' }}>
                        {animal.sexo}
                    </div>
                    </div>
                    {/* Info */}
                    <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-base mb-1">{animal.nombre}</h3>
                    <p className="text-xs text-gray-400 mb-2">
                        {animal.especie}{animal.raza ? ` · ${animal.raza}` : ''} · {edadTexto(animal)}
                    </p>
                    {animal.descripcion && (
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {animal.descripcion}
                        </p>
                    )}
                    <div className="mt-4 w-full py-2 rounded-xl text-xs font-semibold text-white text-center transition hover:opacity-90 cursor-pointer"
                        style={{ backgroundColor: primary }}>
                        Me interesa adoptarlo
                    </div>
                    </div>
                </div>
                ))}
            </div>
            )}
        </div>
        </section>
    )
    }