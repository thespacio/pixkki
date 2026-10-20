import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server-client'

const logo = '/images/logo.png'

type AlberguePublico = {
    slug: string
    logo_url: string | null
    portada_url: string | null
    descripcion_corta: string | null
    color_primario: string | null
    refugio: {
        nombre: string
        ciudad: string
        estado: string
    }
}

export default async function HomePage() {
    const supabase = await createSupabaseServerClient()

    const { data: albergues } = await supabase
        .from('albergue_perfil')
        .select(`
      slug, logo_url, portada_url, descripcion_corta, color_primario,
      refugio ( nombre, ciudad, estado )
    `)
        .eq('visible_publico', true)
        // F-SHELTER-03: ocultar del catálogo los refugios inactivos
        .eq('refugio.activo', true)
        .order('id_perfil', { ascending: false })

    // La relación puede resolverse como objeto o como arreglo según la
    // definición de la FK: se normaliza sin usar casts.
    const lista: AlberguePublico[] = []

    for (const row of albergues ?? []) {
        const refugio = Array.isArray(row.refugio) ? row.refugio[0] : row.refugio

        if (!refugio) continue

        lista.push({
            slug: row.slug,
            logo_url: row.logo_url,
            portada_url: row.portada_url,
            descripcion_corta: row.descripcion_corta,
            color_primario: row.color_primario,
            refugio: {
                nombre: refugio.nombre,
                ciudad: refugio.ciudad,
                estado: refugio.estado,
            },
        })
    }

    return (
        <div className="min-h-screen bg-white"
             style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center px-1 py-1"
                         style={{ backgroundColor: '#43AE6D' }}>
                        <img src={logo} alt="Pixkki" />
                    </div>
                    <span className="text-base font-bold text-gray-900">Pixkki</span>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                    <a href="#albergues" className="hover:text-gray-900 transition-colors">Albergues</a>
                    <a href="#como-funciona" className="hover:text-gray-900 transition-colors">Cómo funciona</a>
                    <Link href="/auth/login"
                          className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
                          style={{ backgroundColor: '#43AE6D' }}>
                        Iniciar sesión
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="pt-36 pb-24 px-6 text-center max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 border"
                     style={{ backgroundColor: '#EAF7F0', color: '#43AE6D', borderColor: '#C3E9D5' }}>
                    🐾 La red de albergues más grande de México
                </div>
                <h1 className="text-6xl font-bold text-gray-900 leading-tight tracking-tight mb-6">
                    Conectamos animales<br />
                    <span style={{ color: '#43AE6D' }}>con familias</span>
                </h1>
                <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Pixkki es la plataforma que une a los mejores albergues del país
                    para que encuentres a tu compañero ideal o apoyes una causa que importa.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <a href="#albergues"
                       className="px-8 py-3.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
                       style={{ backgroundColor: '#43AE6D' }}>
                        Ver albergues
                    </a>
                    <a href="#como-funciona"
                       className="px-8 py-3.5 rounded-xl text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition">
                        Cómo funciona
                    </a>
                </div>
            </section>

            {/* Stats */}
            <section className="py-12 bg-gray-50 border-y border-gray-100">
                <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center px-6">
                    <div>
                        <p className="text-4xl font-bold text-gray-900 mb-1">{lista.length}+</p>
                        <p className="text-sm text-gray-500">Albergues registrados</p>
                    </div>
                    <div>
                        <p className="text-4xl font-bold text-gray-900 mb-1">2,400+</p>
                        <p className="text-sm text-gray-500">Animales en adopción</p>
                    </div>
                    <div>
                        <p className="text-4xl font-bold text-gray-900 mb-1">890+</p>
                        <p className="text-sm text-gray-500">Adopciones exitosas</p>
                    </div>
                </div>
            </section>

            {/* Cómo funciona */}
            <section id="como-funciona" className="py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-4xl font-bold text-center text-gray-900 mb-3">Cómo funciona</h2>
                    <p className="text-center text-gray-500 mb-16 max-w-xl mx-auto">
                        Tres pasos simples para encontrar a tu nuevo compañero de vida
                    </p>
                    <div className="grid grid-cols-3 gap-8">
                        {[
                            { num: '01', title: 'Explora albergues', desc: 'Navega por los albergues registrados en la plataforma y encuentra uno cerca de ti.', color: '#43AE6D' },
                            { num: '02', title: 'Conoce a los animales', desc: 'Revisa los perfiles de los animales disponibles en adopción de cada albergue.', color: '#6366f1' },
                            { num: '03', title: 'Inicia el proceso', desc: 'Contacta directamente al albergue y comienza el proceso de adopción.', color: '#f59e0b' },
                        ].map((step) => (
                            <div key={step.num} className="rounded-2xl border border-gray-100 p-8 hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg mb-5"
                                     style={{ backgroundColor: step.color }}>
                                    {step.num}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3">{step.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Albergues */}
            <section id="albergues" className="py-24 px-6 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-center text-gray-900 mb-3">Albergues registrados</h2>
                    <p className="text-center text-gray-500 mb-14">
                        Conoce los albergues que forman parte de la red Pixkki
                    </p>

                    {lista.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <p className="text-5xl mb-4">🐾</p>
                            <p className="text-lg font-medium">Próximamente habrá albergues aquí</p>
                            <p className="text-sm mt-2">Estamos incorporando nuevos albergues a la red</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {lista.map((a) => {
                                const refugio = a.refugio
                                const primary = a.color_primario ?? '#43AE6D'
                                return (
                                    <Link key={a.slug} href={`/albergue/${a.slug}`}
                                          className="group rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                        {/* Portada */}
                                        <div className="h-48 flex items-center justify-center overflow-hidden relative"
                                             style={{ backgroundColor: primary }}>
                                            {a.portada_url ? (
                                                <img src={a.portada_url} alt={refugio.nombre}
                                                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : a.logo_url ? (
                                                <img src={a.logo_url} alt={refugio.nombre} className="h-20 object-contain" />
                                            ) : (
                                                <span className="text-6xl font-bold text-white/30">{refugio.nombre[0]}</span>
                                            )}
                                            <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-medium bg-black/40 text-white backdrop-blur-sm">
                                                {refugio.ciudad}, {refugio.estado}
                                            </div>
                                        </div>
                                        {/* Info */}
                                        <div className="p-5">
                                            <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:opacity-80 transition-opacity">
                                                {refugio.nombre}
                                            </h3>
                                            {a.descripcion_corta && (
                                                <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                                                    {a.descripcion_corta}
                                                </p>
                                            )}
                                            <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full text-white"
                                                 style={{ backgroundColor: primary }}>
                                                Ver albergue →
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6 text-center" style={{ backgroundColor: '#43AE6D' }}>
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-4xl font-bold text-white mb-4">¿Tienes un albergue?</h2>
                    <p className="text-white/80 text-lg mb-10">
                        Únete a la red Pixkki y lleva la gestión de tu albergue al siguiente nivel.
                    </p>
                    <a href="mailto:pixkki@pixkki.es"
                       className="inline-block px-8 py-3.5 rounded-xl text-sm font-semibold bg-white transition hover:bg-gray-50"
                       style={{ color: '#43AE6D' }}>
                        Contáctanos para unirte
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-10 px-8 border-t border-gray-100 flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center px-0.5 py-0.5"
                         style={{ backgroundColor: '#43AE6D' }}>
                        <img src={logo} alt="Pixkki" />
                    </div>
                    <span className="font-semibold text-gray-600">Pixkki</span>
                    <span>© {new Date().getFullYear()}</span>
                </div>
                <Link href="/auth/login" className="hover:text-gray-600 transition-colors">
                    Panel de administración
                </Link>
            </footer>
        </div>
    )
}