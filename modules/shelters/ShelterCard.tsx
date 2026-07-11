// components/shelters/ShelterCard.tsx
// Componente para mostrar un albergue individual

import Link from 'next/link';
import { Building2, MapPin, Phone, Mail, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShelterListItem } from '@/modules/shelters/types';

interface ShelterCardProps {
    shelter: ShelterListItem;
}

export function ShelterCard({ shelter }: ShelterCardProps) {
    return (
        <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                    <Link href={`/shelters/${shelter.id}`}>
                        <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1">
                            {shelter.nombre}
                        </h3>
                    </Link>
                    <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>
              {shelter.ciudad}, {shelter.estado}
            </span>
                    </div>
                </div>
                <Badge variant={shelter.activo ? 'default' : 'secondary'}>
                    {shelter.activo ? 'Activo' : 'Inactivo'}
                </Badge>
            </CardHeader>

            <CardContent className="flex-grow">
                <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                        <Building2 className="h-4 w-4 mr-2" />
                        <span>ID: {shelter.id}...</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="border-t pt-4 flex justify-between">
                <div className="flex space-x-2">
                    <Link href={`/shelters/${shelter.id}`}>
                        <Button variant="outline" size="sm">
                            Ver detalles
                        </Button>
                    </Link>
                    <Link href={`/shelters/${shelter.id}/edit`}>
                        <Button variant="outline" size="sm">
                            Editar
                        </Button>
                    </Link>
                </div>
                <Link href={`/shelters/${shelter.id}/animals`}>
                    <Button variant="ghost" size="sm" className="gap-1">
                        <Users className="h-4 w-4" />
                        Animales
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}