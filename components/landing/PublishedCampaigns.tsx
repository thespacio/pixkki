import { Cat, Dog, MapPin, PawPrint } from "lucide-react";
import type { PublicCampaign } from "@/modules/campaigns/types";
import { animalSummary, hashtagsToText } from "@/modules/campaigns/format";

function SpeciesIcon({ especie }: { especie: string }) {
    const e = especie.toLowerCase();
    if (e.includes("perro")) return <Dog size={14} aria-hidden="true" />;
    if (e.includes("gato")) return <Cat size={14} aria-hidden="true" />;
    return <PawPrint size={14} aria-hidden="true" />;
}

/**
 * Sección de la landing con las campañas de adopción publicadas por los albergues.
 * Es solo lectura y no usa hooks: se renderiza en el servidor. Si no hay campañas
 * publicadas no muestra nada (no se deja un hueco ni un mensaje de "vacío").
 */
export function PublishedCampaigns({ campaigns }: { campaigns: PublicCampaign[] }) {
    if (campaigns.length === 0) return null;

    return (
        <section id="adopta" aria-labelledby="adopta-title" className="max-w-6xl mx-auto px-8 py-20">
            <div className="text-center mb-12">
                <p
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
                    style={{ backgroundColor: "#EBF7F1", color: "#43AE6D" }}
                >
                    <PawPrint size={13} aria-hidden="true" />
                    Buscan hogar
                </p>
                <h2 id="adopta-title" className="text-3xl font-semibold text-foreground tracking-tight mb-3">
                    Ellos están esperando una familia
                </h2>
                <p className="text-base text-muted-foreground max-w-xl mx-auto">
                    Historias reales de animales de nuestros albergues que hoy están disponibles para adopción.
                </p>
            </div>

            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => (
                    <li key={campaign.id}>
                        <article className="h-full flex flex-col bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
                            <ul className="flex flex-wrap gap-1.5 mb-4" aria-label="Animales en esta publicación">
                                {campaign.animals.map((animal) => (
                                    <li
                                        key={animal.idAnimal}
                                        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
                                        style={{ backgroundColor: "#EBF7F1", color: "#2E7D4F" }}
                                    >
                                        <SpeciesIcon especie={animal.especie} />
                                        {animalSummary(animal)}
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-base font-semibold text-foreground leading-snug mb-2">
                                {campaign.title}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line flex-1">
                                {campaign.content}
                            </p>

                            {campaign.hashtags.length > 0 && (
                                <p className="mt-3 text-sm font-medium" style={{ color: "#43AE6D" }}>
                                    {hashtagsToText(campaign.hashtags)}
                                </p>
                            )}

                            {campaign.callToAction && (
                                <p className="mt-3 text-sm font-semibold text-foreground">{campaign.callToAction}</p>
                            )}

                            <p className="mt-4 pt-4 border-t border-border flex items-center gap-1.5 text-xs text-muted-foreground">
                                <MapPin size={12} aria-hidden="true" />
                                <span>
                                    {campaign.shelterName}
                                    {campaign.shelterCity ? ` · ${campaign.shelterCity}` : ""}
                                    {campaign.shelterState ? `, ${campaign.shelterState}` : ""}
                                </span>
                            </p>
                        </article>
                    </li>
                ))}
            </ul>
        </section>
    );
}
