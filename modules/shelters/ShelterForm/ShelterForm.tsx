'use client';

import {useRef, useState} from 'react';

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

const FIELD_LABELS: Record<string, string> = {
    nombre_albergue: 'Nombre del albergue',
    ciudad: 'Ciudad',
    estado: 'Estado',
    nombre_admin: 'Nombre del administrador',
    correo_contacto: 'Correo',
    telefono: 'Teléfono (10 dígitos)',
    direccion: 'Dirección',
    latitud: 'Ubicación en el mapa',
    longitud: 'Ubicación en el mapa',
};

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
    const [invalidFields, setInvalidFields] = useState<string[]>([]);
    const alertRef = useRef<HTMLDivElement>(null);
    const rootError = form.formState.errors.root?.message;

    // Antes un formulario inválido no mostraba nada: ahora se lista qué falta y se baja hasta el aviso.
    function handleInvalid(errors: Record<string, unknown>) {
        const labels = Object.keys(errors).map((key) => FIELD_LABELS[key] ?? key);
        setInvalidFields([...new Set(labels)]);
        requestAnimationFrame(() => alertRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }));
    }

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
        // El desglose se reemplaza completo (si Google no trae la colonia, no se queda la anterior).
        form.setValue('calle', picked.calle, opts);
        form.setValue('numero', picked.numero, opts);
        form.setValue('colonia', picked.colonia, opts);
        form.setValue('codigo_postal', picked.codigoPostal, opts);
        if (picked.ciudad) form.setValue('ciudad', picked.ciudad, opts);
        if (picked.estado) form.setValue('estado', picked.estado, opts);
        setAutofilled(true);
    }

    return (

        <Card>
            <CardContent className="pt-6">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(async (data: ShelterFormValues) => {
                            setInvalidFields([]);
                            await onSubmit(data);
                        }, handleInvalid)}
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
                                    Se llenaron calle, número, colonia, código postal, ciudad y estado según el mapa.
                                    Puedes corregirlos.
                                </p>
                            )}
                            <div className="grid gap-4 pt-2 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="calle"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Calle</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ej: Av. Patria"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(e.target.value || null)}
                                                    disabled={isLoading}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="numero"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Número</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ej: 1891"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(e.target.value || null)}
                                                    disabled={isLoading}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="colonia"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Colonia</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ej: Jardines Universidad"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(e.target.value || null)}
                                                    disabled={isLoading}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="codigo_postal"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Código postal</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ej: 45110" inputMode="numeric" maxLength={5}
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(e.target.value || null)}
                                                    disabled={isLoading}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {(invalidFields.length > 0 || rootError) && (
                            <div
                                ref={alertRef}
                                role="alert"
                                className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
                            >
                                {rootError ?? 'Revisa los campos marcados antes de continuar:'}
                                {invalidFields.length > 0 && !rootError && (
                                    <ul className="mt-1 list-disc pl-5">
                                        {invalidFields.map((label) => (
                                            <li key={label}>{label}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

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