'use client';

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {ArrowLeft, Pencil} from 'lucide-react';
import {useRouter} from 'next/navigation';
import {Shelter} from "@/modules/shelters/types";

interface ShelterDetailProps {
    shelter: Shelter;
    canEdit?: boolean;
}

export function ShelterDetail({ shelter, canEdit = false }: ShelterDetailProps) {
    const router = useRouter();

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-2xl">{shelter.nombre_albergue}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant={shelter.activo ? 'default' : 'secondary'}>
                                {shelter.activo ? 'Activo' : 'Inactivo'}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push("/shelters")}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Button>
                        {canEdit && (
                            <Button
                                size="sm"
                                onClick={() => router.push(`/shelters/${shelter.id}/edit`)}
                            >
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* F-SHELTER-04: dirección completa */}
                    <div className="md:col-span-2">
                        <dt className="text-sm font-medium text-muted-foreground">Dirección</dt>
                        <dd className="text-lg">
                            {shelter.calle
                                ? `${shelter.calle}${shelter.numero ? `, ${shelter.numero}` : ''}${shelter.colonia ? `, ${shelter.colonia}` : ''}${shelter.codigo_postal ? `, CP ${shelter.codigo_postal}` : ''}`
                                : 'No especificada'}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-muted-foreground">Ciudad</dt>
                        <dd className="text-lg">{shelter.ciudad}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-muted-foreground">Estado</dt>
                        <dd className="text-lg">{shelter.estado}</dd>
                    </div>
                    {/*<div>
                        <dt className="text-sm font-medium text-muted-foreground">Administrador</dt>
                        <dd className="text-lg">{admin}</dd>
                    </div>*/}
                    <div>
                        <dt className="text-sm font-medium text-muted-foreground">Correo de contacto</dt>
                        <dd className="text-lg">{shelter.correo_contacto || 'No especificado'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-muted-foreground">Teléfono</dt>
                        <dd className="text-lg">{shelter.telefono || 'No especificado'}</dd>
                    </div>
                    <div className="md:col-span-2">
                        <dt className="text-sm font-medium text-muted-foreground">Fecha de creación</dt>
                        <dd className="text-lg">
                            {new Date(shelter.fecha_registro).toLocaleDateString('es-MX', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </dd>
                    </div>
                </dl>
            </CardContent>
        </Card>
    );
}