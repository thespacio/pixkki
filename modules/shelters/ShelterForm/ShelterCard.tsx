// components/shelters/ShelterCard.tsx
// Componente para mostrar un albergue individual

import Link from 'next/link';
import {Building2, MapPin, Users, Cat, Edit, Coins} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShelterListItem } from '@/modules/shelters/types';
import {ShelterStatusSwitch} from "@/modules/shelters/ShelterForm/ShelterStatusSwitch";

interface ShelterCardProps {
    shelter: ShelterListItem;
    /** Solo el superadmin puede gestionar (F-SHELTER-03) */
    canManage?: boolean;
}

const logo = "/images/logo.png";


export function ShelterCard({ shelter, canManage = false }: ShelterCardProps) {
    return (
        <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between ">
                <div >
                    <div className="w-15 h-15 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#43AE6D" }}>
                        <img src={logo} alt="Logo" />
                    </div>
                    <div className="space-y-1">
                        <Link href={`/shelters/${shelter.id}`}>
                            <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1">
                                {shelter.nombre_albergue}
                            </h3>
                        </Link>
                        <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>
                                {shelter.ciudad}, {shelter.estado}
                            </span>
                        </div>
                        {/* F-SHELTER-01: fecha de creación en el tablero */}
                        <div className="text-xs text-muted-foreground">
                            Creado: {new Date(shelter.fecha_registro).toLocaleDateString('es-MX', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <Badge variant={shelter.activo ? 'default' : 'secondary'}>
                        {shelter.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                    {/* F-SHELTER-03: switch de activación (solo superadmin) */}
                    {canManage && (
                        <ShelterStatusSwitch id={shelter.id} activo={shelter.activo} />
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <span className="text-xs text-muted-foreground">
                    {shelter.activo
                        ? "Visible en el catálogo público"
                        : "Oculto del catálogo público · login bloqueado"}
                </span>
            </CardContent>
            <CardFooter>
                <div className="flex flex-wrap gap-2">
                    <Link href={`/shelters/${shelter.id}/edit`}>
                        <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                            Editar
                        </Button>
                    </Link>
                    <Link href={`/shelters/${shelter.id}/animals`}>
                        <Button variant="outline" size="sm" className="gap-1">
                            <Cat className="h-4 w-4" />
                            Animales
                        </Button>
                    </Link>
                    <Link href={`/shelters/${shelter.id}/animals`}>
                        <Button variant="outline" size="sm" className="gap-1">
                            <Building2 className="h-4 w-4" />
                            Espacios
                        </Button>
                    </Link>
                    <Link href={`/shelters/${shelter.id}/animals`}>
                        <Button variant="outline" size="sm" className="gap-1">
                            <Coins className="h-4 w-4" />
                            Donaciones
                        </Button>
                    </Link>
                    <Link href={`/shelters/${shelter.id}/animals`}>
                        <Button variant="outline" size="sm" className="gap-1">
                            <Users className="h-4 w-4" />
                            Personal
                        </Button>
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}