'use client';

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
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {MEXICAN_STATES} from "@/modules/catalogs/constants/mexican-states";
import {ShelterFormProps} from "@/modules/shelters/types";
import {useRouter} from "next/navigation";

export function ShelterForm({
                                form,
                                onSubmit,
                                isLoading = false,
                                mode,
                            }: ShelterFormProps) {

    const router = useRouter();

    return (

        <Card>
            <CardContent className="pt-6">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
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
                                        defaultValue={field.value}
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

                        {/* Dirección completa (F-SHELTER-04) */}
                        <FormField
                            control={form.control}
                            name="calle"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Calle *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ej: Av. Insurgentes"
                                            {...field}
                                            value={field.value ?? ''}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="numero"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ej: 123"
                                                {...field}
                                                value={field.value ?? ''}
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
                                        <FormLabel>Código postal *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ej: 06700"
                                                inputMode="numeric"
                                                maxLength={5}
                                                {...field}
                                                value={field.value ?? ''}
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
                                        <FormLabel>Colonia *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ej: Roma Norte"
                                                {...field}
                                                value={field.value ?? ''}
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

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