import { Suspense } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { PublicShell } from "@/components/layouts/PublicShell";
import { HomeHeroSlider } from "@/components/landing/home-hero-slider";
import {
    PublishedCampaigns,
    PublishedCampaignsSkeleton,
} from "@/components/landing/PublishedCampaigns";
import { createPublicCatalogService } from "@/modules/adoptions/factories/create-public-catalog-service";
import { PublicAnimalCard } from "@/modules/adoptions/components/public-animal-card";
import { getPublishedCampaigns } from "@/modules/campaigns/public";

async function CampaignsSection() {
    const campaigns = await getPublishedCampaigns();
    return <PublishedCampaigns campaigns={campaigns} />;
}

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
            <HomeHeroSlider />

            <section id="como-funciona" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
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

            <Suspense fallback={<PublishedCampaignsSkeleton />}>
                <CampaignsSection />
            </Suspense>

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