import Link from "next/link";
import { PawPrint, Search, FileText, HeartHandshake, ShieldCheck } from "lucide-react";
import { PublicShell } from "@/components/layouts/PublicShell";
import { createPublicCatalogService } from "@/modules/adoptions/factories/create-public-catalog-service";
import { PublicAnimalCard } from "@/modules/adoptions/components/public-animal-card";

export default async function HomePage() {
    let destacados: Array<Record<string, unknown>> = [];
    let destacadosError = false;
    try {
        const service = await createPublicCatalogService();
        const data = await service.listCatalog({ page: 1, pageSize: 8 }) as { items?: Array<Record<string, unknown>> };
        destacados = data.items ?? [];
    } catch {
        destacadosError = true;
    }

    return (
        <PublicShell>
            <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background">
                <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
                    <div className="space-y-6">
                        <p className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            Plataforma para refugios y adoptantes
                        </p>
                        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                            Conecta animales con familias, con claridad y confianza
                        </h1>
                        <p className="max-w-xl text-base text-muted-foreground">
                            Pixkki ayuda a refugios a gestionar adopciones de forma transparente y a adoptantes a encontrar perfiles confiables, con información clara y seguimiento.
                        </p>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Link href="/adopciones" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90">
                                Ver animales en adopción
                            </Link>
                            <Link href="/login" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border px-6 text-sm font-medium text-foreground hover:bg-secondary">
                                Soy refugio / Iniciar sesión
                            </Link>
                        </div>
                    </div>
                    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl bg-secondary p-4"><PawPrint className="mb-2 text-primary" size={20} /><p className="font-medium">Perfiles claros</p><p className="text-sm text-muted-foreground">Información pública segura del animal y su refugio.</p></div>
                            <div className="rounded-2xl bg-secondary p-4"><Search className="mb-2 text-primary" size={20} /><p className="font-medium">Búsqueda simple</p><p className="text-sm text-muted-foreground">Filtra por especie, tamaño, sexo y más.</p></div>
                            <div className="rounded-2xl bg-secondary p-4"><FileText className="mb-2 text-primary" size={20} /><p className="font-medium">Solicitud sin cuenta</p><p className="text-sm text-muted-foreground">Postúlate con un formulario claro y consentimiento informado.</p></div>
                            <div className="rounded-2xl bg-secondary p-4"><HeartHandshake className="mb-2 text-primary" size={20} /><p className="font-medium">Acompañamiento</p><p className="text-sm text-muted-foreground">El refugio revisa tu solicitud y te contacta.</p></div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="mb-8 max-w-2xl">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Cómo funciona</h2>
                    <p className="text-muted-foreground">Un proceso simple para adoptar con responsabilidad.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {[
                        { title: "1. Conoce el perfil", desc: "Explora animales disponibles y revisa información segura sobre su perfil y compatibilidad." },
                        { title: "2. Envía tu solicitud", desc: "Completa el formulario sin crear cuenta, con consentimiento y datos de contacto." },
                        { title: "3. El refugio te contacta", desc: "El equipo del refugio evalúa la solicitud y continúa el proceso contigo." },
                    ].map((step) => (
                        <div key={step.title} className="rounded-2xl border border-border bg-card p-5">
                            <p className="font-semibold text-foreground">{step.title}</p>
                            <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="border-y border-border bg-card/30">
                <div className="mx-auto max-w-7xl space-y-6 px-4 py-16 sm:px-6 lg:px-8">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-foreground">Animales destacados</h2>
                            <p className="text-muted-foreground">Algunos perfiles publicados recientemente.</p>
                        </div>
                        <Link href="/adopciones" className="text-sm font-medium text-primary hover:underline">Ver todos</Link>
                    </div>

                    {destacadosError ? (
                        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
                            No pudimos cargar los destacados en este momento. Puedes <Link href="/adopciones" className="text-primary hover:underline">explorar el catálogo</Link>.
                        </div>
                    ) : destacados.length === 0 ? (
                        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
                            Pronto habrá animales disponibles. Mientras tanto, puedes conocer los <Link href="/refugios" className="text-primary hover:underline">refugios</Link>.
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {destacados.map((item) => <PublicAnimalCard key={String(item.id_animal)} item={item as unknown as import("@/modules/adoptions/components/public-animal-card").CatalogItem} />)}
                        </div>
                    )}
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                    <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-1 text-primary" size={20} />
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold text-foreground">Transparencia y cuidado de datos</h2>
                            <p className="text-sm text-muted-foreground">
                                Mostramos solo información pública segura de los animales. Los datos del postulante se usan para gestionar la solicitud y son visibles únicamente para el personal autorizado del refugio.
                            </p>
                            <Link href="/aviso-privacidad" className="text-sm font-medium text-primary hover:underline">Ver aviso de privacidad</Link>
                        </div>
                    </div>
                </div>
            </section>
        </PublicShell>
    );
}