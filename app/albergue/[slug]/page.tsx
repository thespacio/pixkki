    import { createSupabaseServerClient } from '@/lib/supabase/server-client'
    import { notFound } from 'next/navigation'
    import AnimalesBloque from './AnimalesBloque'

    type BloqueType = 'hero' | 'texto' | 'galeria' | 'animales' | 'contacto' | 'mapa' | 'redes' | 'donacion'

    type Bloque = {
    id_bloque: number
    tipo: BloqueType
    orden: number
    visible: boolean
    contenido: Record<string, unknown>
    }

    type Perfil = {
    id_perfil: number
    visible_publico: boolean
    color_primario: string | null
    logo_url: string | null
    refugio: {
        id_refugio: number
        nombre: string
        ciudad: string
        estado: string
        correo_contacto: string
        telefono: string
    }
    albergue_bloque: Bloque[]
    }

    export default async function AlberguePage({ params }: { params: { slug: string } }) {
    const supabase = await createSupabaseServerClient()

    const { data: perfil } = await supabase
        .from('albergue_perfil')
        .select(`
        id_perfil, visible_publico, color_primario, logo_url,
        refugio ( id_refugio, nombre, ciudad, estado, correo_contacto, telefono ),
        albergue_bloque ( id_bloque, tipo, orden, visible, contenido )
        `)
        .eq('slug', params.slug)
        .single()

    if (!perfil || !perfil.visible_publico) notFound()

    const p = perfil as unknown as Perfil
    const refugio = p.refugio
    const primary = p.color_primario ?? '#43AE6D'

    const bloques = (p.albergue_bloque ?? [])
        .filter((b) => b.visible)
        .sort((a, b) => a.orden - b.orden)

    return (
        <div className="min-h-screen bg-white" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>

        {/* Mini nav del albergue */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-white/90 backdrop-blur-md border-b border-gray-100">
            <a href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            ← Volver a Pixkki
            </a>
            <span className="text-sm font-semibold text-gray-700">{refugio.nombre}</span>
            <a href="#animales"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: primary }}>
            Ver animales
            </a>
        </nav>

        <div className="pt-16">
            {bloques.map((bloque) => {
            if (bloque.tipo === 'animales') {
                return (
                <AnimalesBloque
                    key={bloque.id_bloque}
                    idRefugio={refugio.id_refugio}
                    titulo={(bloque.contenido.titulo as string) ?? ''}
                    primary={primary}
                />
                )
            }
            return (
                <BloqueRender
                key={bloque.id_bloque}
                bloque={bloque}
                primary={primary}
                refugio={refugio}
                />
            )
            })}
        </div>
        </div>
    )
    }

    function BloqueRender({ bloque, primary, refugio }: {
    bloque: Bloque
    primary: string
    refugio: { nombre: string; ciudad: string; estado: string; correo_contacto: string; telefono: string }
    }) {
    const c = bloque.contenido

    switch (bloque.tipo) {
        case 'hero':
        return (
            <section className="relative min-h-[560px] flex items-center justify-center text-center overflow-hidden"
            style={{
                backgroundImage: c.imagen_url ? `url(${c.imagen_url})` : undefined,
                backgroundColor: primary,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}>
            <div className="absolute inset-0 bg-black/45" />
            <div className="relative z-10 max-w-3xl px-6">
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-5 leading-tight">
                {(c.titulo as string) || refugio.nombre}
                </h1>
                {c.subtitulo && (
                <p className="text-xl text-white/80 mb-10">{c.subtitulo as string}</p>
                )}
                {c.cta_texto && (
                <a href="#animales"
                    className="inline-block px-8 py-3.5 rounded-full font-semibold text-white text-sm transition hover:opacity-90 border-2 border-white/30 backdrop-blur-sm"
                    style={{ backgroundColor: `${primary}cc` }}>
                    {c.cta_texto as string}
                </a>
                )}
            </div>
            </section>
        )

        case 'texto':
        return (
            <section className="max-w-3xl mx-auto px-6 py-20">
            {c.titulo && (
                <h2 className="text-3xl font-bold mb-6" style={{ color: primary }}>
                {c.titulo as string}
                </h2>
            )}
            <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">
                {c.cuerpo as string}
            </p>
            </section>
        )

        case 'galeria':
        return (
            <section className="px-6 py-20 bg-gray-50">
            <div className="max-w-5xl mx-auto">
                {c.titulo && (
                <h2 className="text-3xl font-bold mb-10 text-center" style={{ color: primary }}>
                    {c.titulo as string}
                </h2>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {((c.imagenes as string[]) ?? []).map((url, i) => (
                    <img key={i} src={url} alt={`Foto ${i + 1}`}
                    className="w-full h-56 object-cover rounded-2xl hover:scale-105 transition-transform duration-300" />
                ))}
                </div>
            </div>
            </section>
        )

        case 'contacto':
        return (
            <section className="px-6 py-20 bg-gray-50">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold mb-10 text-center" style={{ color: primary }}>
                Contacto
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                    { label: 'Teléfono',  val: c.telefono  || refugio.telefono || null },
                    { label: 'Correo',    val: c.correo    || refugio.correo_contacto || null },
                    { label: 'Dirección', val: c.direccion || null },
                    { label: 'Horario',   val: c.horario   || null },
                ].filter((item) => item.val).map((item) => (
                    <div key={item.label}
                    className="p-5 rounded-2xl border border-gray-100 bg-white">
                    <p className="text-xs font-bold uppercase tracking-widest mb-2"
                        style={{ color: primary }}>
                        {item.label}
                    </p>
                    <p className="text-gray-700">{item.val as string}</p>
                    </div>
                ))}
                </div>
            </div>
            </section>
        )

        case 'mapa':
        return c.embed_url ? (
            <section className="px-6 py-8">
            <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden h-80 shadow-sm border border-gray-100">
                <iframe src={c.embed_url as string} width="100%" height="100%"
                style={{ border: 0 }} allowFullScreen loading="lazy" />
            </div>
            </section>
        ) : null

        case 'redes':
        return (
            <section className="px-6 py-16" style={{ backgroundColor: primary }}>
            <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-2xl font-bold text-white mb-8">Síguenos en redes</h2>
                <div className="flex justify-center gap-3 flex-wrap">
                {[
                    { key: 'facebook',  label: 'Facebook' },
                    { key: 'instagram', label: 'Instagram' },
                    { key: 'tiktok',    label: 'TikTok' },
                ].filter((r) => c[r.key]).map((r) => (
                    <a key={r.key} href={c[r.key] as string} target="_blank" rel="noopener noreferrer"
                    className="px-6 py-2.5 rounded-full bg-white/20 text-white text-sm font-medium hover:bg-white/30 transition backdrop-blur-sm">
                    {r.label}
                    </a>
                ))}
                {c.whatsapp && (
                    <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noopener noreferrer"
                    className="px-6 py-2.5 rounded-full bg-white text-sm font-semibold hover:opacity-90 transition"
                    style={{ color: primary }}>
                    WhatsApp
                    </a>
                )}
                </div>
            </div>
            </section>
        )

        case 'donacion':
        return (
            <section className="px-6 py-20 bg-gray-50">
            <div className="max-w-xl mx-auto text-center">
                {c.titulo && (
                <h2 className="text-3xl font-bold mb-4" style={{ color: primary }}>
                    {c.titulo as string}
                </h2>
                )}
                {c.descripcion && (
                <p className="text-gray-500 mb-10 leading-relaxed">{c.descripcion as string}</p>
                )}
                {c.link && (
                <a href={c.link as string} target="_blank" rel="noopener noreferrer"
                    className="inline-block px-10 py-4 rounded-full font-semibold text-white text-sm transition hover:opacity-90 shadow-lg"
                    style={{ backgroundColor: primary }}>
                    {(c.boton_texto as string) || 'Donar ahora'} ❤️
                </a>
                )}
            </div>
            </section>
        )

        default:
        return null
    }
    }