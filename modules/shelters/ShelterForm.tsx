// components/shelters/ShelterForm.tsx
// Formulario para crear/editar albergues

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { CreateShelterSchema } from '@/modules/shelters/schemas';
import {createShelterAction} from "@/app/(protected)/(dashboard)/shelters/actions";

type FormValues = z.infer<typeof CreateShelterSchema>;

interface ShelterFormProps {
    initialData?: Partial<FormValues>;
    shelterId?: string;
}

export function ShelterForm() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const form = useForm<FormValues>();
    async function onSubmit(data: FormValues) {
        try {
            setIsLoading(true);
            await createShelterAction({
                shelter: CreateShelterSchema.parse(data),
            });
            router.push("/shelters");
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <Card>
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Nombre */}
                        <FormField
                            /*control={form.control}*/
                            name="nombre"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre del albergue *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ej: Refugio San Francisco"
                                            {...field}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Nombre completo del albergue (mínimo 3 caracteres)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Ciudad */}
                        <FormField
                            /*control={form.control}*/
                            name="ciudad"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ciudad *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ej: Ciudad de México"
                                            {...field}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Estado */}
                        <FormField
                            /*control={form.control}*/
                            name="estado"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estado *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ej: CDMX"
                                            {...field}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Correo de contacto */}
                        <FormField
                            /*control={form.control}*/
                            name="correo_contacto"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Correo de contacto</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="Ej: contacto@refugio.com"
                                            {...field}
                                            value={field.value || ''}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Opcional. Correo electrónico de contacto del albergue
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Teléfono */}
                        <FormField
                            /*control={form.control}*/
                            name="telefono"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Teléfono</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ej: +525512345678"
                                            {...field}
                                            value={field.value || ''}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Opcional. Número de teléfono con código de país
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Botones */}
                        <div className="flex gap-4">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Guardando...' : 'Crear albergue'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}