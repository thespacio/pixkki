// modules/shelters/ShelterForm/ShelterCard.tsx
// Tarjeta de un refugio en el listado global del superadministrador.

import Link from "next/link";
import { Building2, MapPin, Pencil, Power, PowerOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import type { ShelterListItem } from "@/modules/shelters/types";

type ShelterCardProps = {
    shelter: ShelterListItem;
};

export function ShelterCard({ shelter }: ShelterCardProps) {
    return (
        <Card className="flex h-full flex-col transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Building2 aria-hidden="true" className="size-5" />
                    </div>
                    <div className="min-w-0 space-y-1">
                        <Link
                            href={`/refugios/${shelter.id}`}
                            className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            <h3 className="line-clamp-1 font-semibold text-lg transition-colors hover:text-primary">
                                {shelter.nombre_albergue}
                            </h3>
                        </Link>
                        <p className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin aria-hidden="true" className="size-4" />
                            <span>
                                {shelter.ciudad}, {shelter.estado}
                            </span>
                        </p>
                    </div>
                </div>
                <Badge variant={shelter.activo ? "default" : "secondary"}>
                    {shelter.activo ? "Activo" : "Inactivo"}
                </Badge>
            </CardHeader>

            <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">
                    {shelter.activo
                        ? "El refugio puede operar y su personal puede iniciar sesión."
                        : "El refugio está inactivo: su personal no puede iniciar sesión."}
                </p>
            </CardContent>

            <CardFooter className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                    <Link href={`/refugios/${shelter.id}`}>Ver detalle</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                    <Link href={`/refugios/${shelter.id}/edit`}>
                        <Pencil aria-hidden="true" />
                        Editar
                    </Link>
                </Button>
                <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className={shelter.activo ? "text-destructive" : undefined}
                >
                    <Link
                        href={`/refugios?confirmar=${shelter.id}`}
                        aria-label={
                            shelter.activo
                                ? `Desactivar ${shelter.nombre_albergue}`
                                : `Activar ${shelter.nombre_albergue}`
                        }
                    >
                        {shelter.activo ? (
                            <PowerOff aria-hidden="true" />
                        ) : (
                            <Power aria-hidden="true" />
                        )}
                        {shelter.activo ? "Desactivar" : "Activar"}
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
