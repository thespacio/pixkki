// components/shelters/ShelterCard.tsx
// Componente para mostrar un albergue individual

import Link from 'next/link';
import {Building2, MapPin, Phone, Mail, Users, Cat, InfoIcon, Edit, Coins, Image} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShelterListItem } from '@/modules/shelters/types';

interface ShelterCardProps {
    shelter: ShelterListItem;
}

const logo = "/images/logo.png";


export function ShelterCard({ shelter }: ShelterCardProps) {
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
                    </div>
                </div>
                <Badge variant={shelter.activo ? 'default' : 'secondary'}>
                    {shelter.activo ? 'Activo' : 'Inactivo'}
                </Badge>
            </CardHeader>
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