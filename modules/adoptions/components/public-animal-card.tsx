import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type CatalogItem = {
    id_animal: number;
    nombre: string;
    especie: string | null;
    raza: string | null;
    sexo: string | null;
    edad_estimada: number | null;
    tamano: string | null;
    temperamento: string | null;
    foto_principal: string | null;
    refugio?: { nombre?: string | null; ciudad?: string | null; estado?: string | null; slug?: string | null } | null;
};

export function PublicAnimalCard({ item }: { item: CatalogItem }) {
    return (
        <Card className="overflow-hidden border-border/80 transition-shadow hover:shadow-md">
            <div className="aspect-[4/3] bg-secondary">
                {item.foto_principal ? (
                    <img
                        src={item.foto_principal}
                        alt={`Foto de ${item.nombre}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                        Sin fotografía
                    </div>
                )}
            </div>
            <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <h3 className="font-semibold text-foreground">{item.nombre}</h3>
                        <p className="text-sm text-muted-foreground">
                            {[item.especie, item.raza].filter(Boolean).join(" · ") || "Mascota"}
                        </p>
                    </div>
                    {item.sexo && <Badge variant="secondary">{item.sexo === "M" ? "Macho" : "Hembra"}</Badge>}
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {item.edad_estimada != null && <span>{item.edad_estimada} año(s)</span>}
                    {item.tamano && <span>{item.tamano}</span>}
                    {item.temperamento && <span>{item.temperamento}</span>}
                </div>
                <p className="text-xs text-muted-foreground">
                    {item.refugio?.nombre ?? "Refugio"}
                    {item.refugio?.ciudad ? ` · ${item.refugio.ciudad}` : ""}
                </p>
                <Link
                    href={`/adopciones/${item.id_animal}`}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                >
                    Ver perfil
                </Link>
            </CardContent>
        </Card>
    );
}