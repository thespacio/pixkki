'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
import { createSpaceAction } from '@/modules/spaces/actions';
import { Button } from '@/components/ui/button';

// Definir el tipo del formulario
type SpaceFormValues = {
    name: string;
    capacity: number;
    description: string | null;
    type: string;
    available: boolean;
};

// Definir el tipo para el modal
interface CreateSpaceModalProps {
    shelterId: number;
    onSuccess?: () => void;
}

// Hook personalizado para manejar el formulario
function useCreateSpaceForm() {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<SpaceFormValues>({
        mode: "onBlur",
        defaultValues: {
            name: "",
            capacity: 1,
            description: null,
            type: "canera",
            available: true,
        },
    });

    return { form, isLoading, setIsLoading };
}

export default function CreateSpaceModal({
                                             onSuccess,
                                         }: CreateSpaceModalProps) {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);

    const { form, isLoading, setIsLoading } = useCreateSpaceForm();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setError,
    } = form;

    async function onSubmit(data: SpaceFormValues) {
        setIsLoading(true);

        try {
            const result = await createSpaceAction(data);

            if (result.success) {
                setShowModal(false);
                reset();

                if (onSuccess) {
                    onSuccess();
                } else {
                    router.refresh();
                }
            } else {
                setError('root', {
                    message: result.error || 'Error al crear el espacio',
                });
            }
        } catch {
            setError('root', {
                message: 'Error inesperado al crear el espacio',
            });
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <>

            <Button
                type="button"
                onClick={() => setShowModal(true)}
            >
                <Plus size={18} />
                Agregar Espacio
            </Button>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-lg bg-background rounded-2xl shadow-xl border border-border">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-border p-5">
                            <h3 className="text-lg font-semibold">Nuevo Espacio</h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowModal(false);
                                    reset();
                                    setError("root", { message: "" });
                                }}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-5">
                            {/* Tipo de espacio */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Tipo de espacio
                                </label>
                                <select
                                    {...register("type")}
                                    className="w-full rounded-xl border border-border px-4 py-3 bg-background"
                                >
                                    <option value="">Seleccionar tipo</option>
                                    <option value="Canil">Canil</option>
                                    <option value="Gatera">Gatera</option>
                                    <option value="Cuarentena">Cuarentena</option>
                                    <option value="Rehabilitación">Rehabilitación</option>
                                    <option value="Otro">Otro</option>
                                </select>
                                {errors.type && (
                                    <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
                                )}
                            </div>

                            {/* Nombre del espacio */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Nombre del espacio <span className="text-red-500">*</span>
                                </label>
                                <input
                                    {...register("name")}
                                    placeholder="Ej. Canil A"
                                    className={`w-full rounded-xl border px-4 py-3 bg-background ${
                                        errors.name ? 'border-red-500' : 'border-border'
                                    }`}
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                                )}
                            </div>

                            {/* Capacidad */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Capacidad <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    {...register("capacity", {
                                        valueAsNumber: true,
                                        required: "La capacidad es requerida",
                                        min: {
                                            value: 1,
                                            message: "La capacidad debe ser mayor a 0"
                                        },
                                        validate: (value) =>
                                            Number.isInteger(value) || "Debe ser un número entero"
                                    })}
                                    onKeyDown={(e) => {
                                        // Bloquea el signo negativo, 'e', '+' y '.'
                                        if (["-", "e", "E", "+", "."].includes(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                    placeholder="20"
                                    className={`w-full rounded-xl border px-4 py-3 bg-background ${
                                        errors.capacity ? 'border-red-500' : 'border-border'
                                    }`}
                                />
                                {errors.capacity && (
                                    <p className="text-red-500 text-sm mt-1">{errors.capacity.message}</p>
                                )}
                            </div>

                            {/* Descripción (opcional) */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Descripción (opcional)
                                </label>
                                <input
                                    {...register("description")}
                                    placeholder="Descripción del espacio"
                                    className="w-full rounded-xl border border-border px-4 py-3 bg-background"
                                />
                                {errors.description && (
                                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                                )}
                            </div>

                            {/* Error general */}
                            {errors.root && (
                                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm">
                                    {errors.root.message}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-border p-5 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowModal(false);
                                    reset();
                                    setError("root", { message: "" });
                                }}
                                className="px-5 py-2 rounded-xl border border-border hover:bg-muted"
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Creando...' : 'Agregar Espacio'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}