'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreateSpaceSchema } from '@/modules/spaces/schemas';
import type { CreateSpaceInput } from '@/modules/spaces/types/types';

type SpaceFormValues = z.input<typeof CreateSpaceSchema>;

const TYPE_OPTIONS: Array<{ value: SpaceFormValues['type']; label: string }> = [
    { value: 'canil', label: 'Canil' },
    { value: 'gatera', label: 'Gatera' },
    { value: 'cuarentena', label: 'Cuarentena' },
    { value: 'rehabilitacion', label: 'Rehabilitación' },
    { value: 'otro', label: 'Otro' },
];

interface Props {
    defaultValues?: Partial<CreateSpaceInput>;
    onSubmit: (values: CreateSpaceInput) => Promise<{ success: boolean; error?: string }>;
    submitLabel?: string;
    isPending?: boolean;
}

export default function SpaceForm({
    defaultValues,
    onSubmit,
    submitLabel = 'Guardar',
    isPending = false,
}: Props) {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<SpaceFormValues, unknown, CreateSpaceInput>({
        resolver: zodResolver(CreateSpaceSchema),
        defaultValues: {
            name: defaultValues?.name ?? '',
            description: defaultValues?.description ?? '',
            capacity: defaultValues?.capacity ?? 1,
            type: defaultValues?.type ?? 'canil',
            available: defaultValues?.available ?? true,
        },
    });

    const busy = isPending || isSubmitting;

    async function handleFormSubmit(values: CreateSpaceInput) {
        const result = await onSubmit({
            ...values,
            description: values.description?.trim() ? values.description.trim() : null,
        });
        if (!result.success) {
            setError('root', { message: result.error ?? 'Error inesperado al guardar el espacio' });
        }
    }

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div>
                <label htmlFor="space-name" className="block text-sm font-medium mb-1.5">
                    Nombre del espacio <span className="text-destructive">*</span>
                </label>
                <Input
                    id="space-name"
                    {...register('name')}
                    placeholder="Ej. Canil A"
                    disabled={busy}
                    aria-invalid={!!errors.name}
                />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>

            <div>
                <label htmlFor="space-type" className="block text-sm font-medium mb-1.5">
                    Tipo <span className="text-destructive">*</span>
                </label>
                <select
                    id="space-type"
                    {...register('type')}
                    disabled={busy}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-invalid={!!errors.type}
                >
                    {TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {errors.type && <p className="text-sm text-destructive mt-1">{errors.type.message}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                    Los espacios de tipo &quot;Cuarentena&quot; son los únicos destinos válidos para animales en cuarentena.
                </p>
            </div>

            <div>
                <label htmlFor="space-capacity" className="block text-sm font-medium mb-1.5">
                    Capacidad <span className="text-destructive">*</span>
                </label>
                <Input
                    id="space-capacity"
                    type="number"
                    min={1}
                    step={1}
                    inputMode="numeric"
                    {...register('capacity', { valueAsNumber: true })}
                    disabled={busy}
                    aria-invalid={!!errors.capacity}
                />
                {errors.capacity && <p className="text-sm text-destructive mt-1">{errors.capacity.message}</p>}
            </div>

            <div>
                <label htmlFor="space-description" className="block text-sm font-medium mb-1.5">
                    Descripción (opcional)
                </label>
                <Input
                    id="space-description"
                    {...register('description')}
                    placeholder="Descripción del espacio"
                    disabled={busy}
                    aria-invalid={!!errors.description}
                />
                {errors.description && (
                    <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
                )}
            </div>

            <label className="flex items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    {...register('available')}
                    disabled={busy}
                    className="size-4 rounded border-input accent-primary"
                />
                Espacio disponible para recibir animales
            </label>

            {errors.root?.message && (
                <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {errors.root.message}
                </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
                <Button type="submit" disabled={busy}>
                    {busy ? 'Guardando...' : submitLabel}
                </Button>
            </div>
        </form>
    );
}