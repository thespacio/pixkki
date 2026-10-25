'use client';

import {useState} from 'react';

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
import {SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {MEXICAN_STATES} from "@/modules/catalogs/constants/mexican-states";
import {Select} from "@radix-ui/react-select";
import {ShelterFormProps} from "@/modules/shelters/types";
import router from "next/router";
import {useRouter} from "next/navigation";
import {LocationPicker} from "@/modules/shelters/ShelterForm/LocationPicker";
import type {PickedLocation} from "@/modules/shelters/google-maps";

export function ShelterForm({
                                form,
                                onSubmit,
                                isLoading = false,
                                mode,
                                //submitLabel,
                                //cancelLabel = 'Cancelar',
                            }: ShelterFormProps) {

    const router = useRouter();
    const [direccion, latitud, longitud] = form.watch(['direccion', 'latitud', 'longitud']);
    const [autofilled, setAutofilled] = useState(false);

    // Al elegir un punto en el mapa se guardan dirección y coordenadas, y se completan
    // ciudad y estado con lo que Google reconoce (la persona puede corregirlos después).
    function handleLocationChange(picked: PickedLocation | null) {
        const opts = { shouldDirty: true, shouldValidate: true } as const;
        if (!picked) {
            form.setValue('direccion', null, opts);
            form.setValue('latitud', null, opts);
            form.setValue('longitud', null, opts);
            setAutofilled(false);
            return;
        }
        form.setValue('direccion', picked.direccion, opts);
        form.setValue('latitud', picked.latitud, opts);
        form.setValue('longitud', picked.longitud, opts);
        if (picked.ciudad) form.setValue('ciudad', picked.ciudad, opts);
        if (picked.estado) form.setValue('estado', picked.estado, opts);
        setAutofilled(Boolean(picked.ciudad || picked.estado));
    }

    return (

        <Card>
            <CardContent className="pt-6">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(
                            onSubmit,
                            (errors) => {
                            console.log("Errores:", errors);
                            })}
                        className="space-y-6">
                        {/* Nombre del albergue*/}
                        <FormField
                            control={form.control}
                            name="nombre_albergue"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre del albergue * </FormLabel>
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
                            control={form.control}
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
                            control={form.control}
                            name="estado"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estado</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value ?? ''}
                                    >
                                        <SelectTrigger id="estado">
                                            <SelectValue placeholder="Seleccionar estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Todos los estados</SelectItem>
                                            {MEXICAN_STATES.map((state) => (
                                                <SelectItem key={state} value={state}>
                                                    {state}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>Selecciona un Estado mexicano</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                    {mode == "create" && (
                    <>
                        {/* Nombre */}
                        <FormField
                            control={form.control}
                            name="nombre_admin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre del administrador albergue *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ej: Juan Perez"
                                            {...field}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Nombre completo del administrador del refugio
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Correo de contacto */}
                        <FormField
                            control={form.control}
                            name="correo_contacto"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Correo del administrador</FormLabel>
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
                                        A este correo se le mandará el acceso.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                    )}

                        {/* Teléfono */}
                        <FormField
                            control={form.control}
                            name="telefono"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Teléfono</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ej: 5512345678"
                                            {...field}
                                            value={field.value || ''}
                                            disabled={isLoading}
                                            maxLength={10}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Número de teléfono
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Ubicación en el mapa */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium leading-none">Ubicación del albergue</p>
                            <p className="text-sm text-muted-foreground">
                                Opcional. Busca la dirección o márcala en el mapa.
                            </p>
                            <LocationPicker
                                value={{ direccion, latitud, longitud }}
                                onChange={handleLocationChange}
                                disabled={isLoading}
                            />
                            {autofilled && (
                                <p className="text-xs text-muted-foreground">
                                    Se actualizaron la ciudad y el estado según el mapa. Puedes corregirlos.
                                </p>
                            )}
                        </div>

                        {/* Botones */}
                        <div className="flex gap-4">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Guardando...' : mode === 'create' ? 'Crear albergue' : 'Actualizar albergue'}
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