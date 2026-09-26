'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {CreateSpaceInput, Space} from '@/modules/spaces/types/types';
import {SpaceSchema} from "@/modules/spaces/schemas";

interface Props {
    defaultValues?: Partial<CreateSpaceInput>;
    onSubmit: (values: CreateSpaceInput) => Promise<{ success: boolean; error?: string }>;
    submitLabel?: string;
}

const PREDEFINED_TYPES = ['Canil', 'Gatera', 'cuarentena', 'Rehabilitación'];

export default function SpaceForm({ defaultValues, onSubmit, submitLabel = 'Guardar' }: Props) {
    const [isPending, startTransition] = useTransition();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CreateSpaceInput>({
        defaultValues: {
            name: defaultValues?.name ?? '',
            type: defaultValues?.type ?? 'Canil',
            capacity: defaultValues?.capacity ?? 1,
        },
    });

    const selectedType = watch('type');

    const handleFormSubmit = (values: CreateSpaceInput) => {
        setServerError(null);
        startTransition(async () => {
            const res = await onSubmit(values);
            if (!res.success) {
                setServerError(res.error ?? 'Error inesperado');
            }
        });
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div>
                <label className="text-sm font-medium">Nombre</label>
                <input
                    {...register('name')}
                    className="w-full border rounded px-3 py-2"
                    disabled={isPending}
                />
                {errors.name && (
                    <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                )}
            </div>

            <div>
                <label className="text-sm font-medium">Tipo</label>
                <select
                    {...register('type')}
                    className="w-full border rounded px-3 py-2"
                    disabled={isPending}
                >
                    {PREDEFINED_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                    <option value="Otro">Otro</option>
                </select>
            </div>

            {selectedType === 'Otro' && (
                <div>
                    <label className="text-sm font-medium">Tipo personalizado</label>
                    <input
                        {...register('type')}
                        className="w-full border rounded px-3 py-2"
                        disabled={isPending}
                    />
                </div>
            )}

            <div>
                <label className="text-sm font-medium">Capacidad</label>
                <input
                    type="number"
                    {...register('capacity', {
                        valueAsNumber: true,
                        validate: (value) => {
                            if (isNaN(value)) return 'Debe ingresar un número';
                            if (value <= 0) return 'Debe ser un número positivo';
                            return true;
                        }
                    })}
                    className="w-full border rounded px-3 py-2"
                    disabled={isPending}
                />
            </div>

            {serverError && (
                <p className="text-red-600 text-sm">{serverError}</p>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="bg-primary text-primary-foreground px-4 py-2 rounded disabled:opacity-50"
            >
                {isPending ? 'Guardando...' : submitLabel}
            </button>
        </form>
    );
}