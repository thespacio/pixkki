"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import {AnimalState} from "@/modules/animals/types/animal-state.types";
import {Space} from "@/modules/spaces/types/types";
import {
    CreateAnimalFormSchema,
    CreateAnimalFormValues,
    CreateAnimalInput, toCreateAnimalInput, toFormValues
} from "@/modules/animals/validators/animal.validators";

type Props = {
    estados: AnimalState[];
    espacios: Space[];
    defaultValues?: Partial<CreateAnimalInput>;
    onSubmit: (data: CreateAnimalInput) => Promise<void>;
    submitLabel: string;
    saving: boolean;
    onCancel: () => void;
};

const INPUT_CLS =
    "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";
const LABEL_CLS = "block text-xs font-medium text-foreground mb-1";
const ERROR_CLS = "mt-1 text-xs text-red-600";

export function AnimalForm({
                               estados,
                               espacios,
                               defaultValues,
                               onSubmit,
                               submitLabel,
                               saving,
                               onCancel,
                           }: Props) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateAnimalFormValues>({
        resolver: zodResolver(CreateAnimalFormSchema),
        defaultValues: toFormValues(defaultValues),
    });

    async function submit(values: CreateAnimalFormValues) {
        // Frontera Form → DTO. La Action volverá a validar con CreateAnimalSchema.
        const input = toCreateAnimalInput(values);
        await onSubmit(input);
    }

    return (
        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
            {/* Fila 1: nombre + especie */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={LABEL_CLS}>Nombre (opcional)</label>
                    <input
                        {...register("nombre")}
                        placeholder="Ej. Firulais"
                        className={INPUT_CLS}
                    />
                    {errors.nombre && (
                        <p className={ERROR_CLS}>{errors.nombre.message}</p>
                    )}
                </div>
                <div>
                    <label className={LABEL_CLS}>Especie *</label>
                    <select {...register("especie")} className={INPUT_CLS}>
                        <option value="Perro">Perro</option>
                        <option value="Gato">Gato</option>
                    </select>
                    {errors.especie && (
                        <p className={ERROR_CLS}>{errors.especie.message}</p>
                    )}
                </div>
            </div>

            {/* Fila 2: raza + sexo + edad */}
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className={LABEL_CLS}>Raza</label>
                    <input
                        {...register("raza")}
                        placeholder="Ej. Labrador"
                        className={INPUT_CLS}
                    />
                    {errors.raza && <p className={ERROR_CLS}>{errors.raza.message}</p>}
                </div>
                <div>
                    <label className={LABEL_CLS}>Sexo *</label>
                    <select {...register("sexo")} className={INPUT_CLS}>
                        <option value="">Seleccionar...</option>
                        <option value="M">Macho</option>
                        <option value="H">Hembra</option>
                    </select>
                    {errors.sexo && <p className={ERROR_CLS}>{errors.sexo.message}</p>}
                </div>
                <div>
                    <label className={LABEL_CLS}>Edad estimada (meses)</label>
                    <input
                        type="number"
                        min="0"
                        {...register("edadEstimada")}
                        placeholder="Ej. 12"
                        className={INPUT_CLS}
                    />
                    {errors.edadEstimada && (
                        <p className={ERROR_CLS}>{errors.edadEstimada.message}</p>
                    )}
                </div>
            </div>

            {/* Fila 3: peso + procedencia */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={LABEL_CLS}>Peso (kg)</label>
                    <input
                        type="number"
                        step="0.1"
                        min="0"
                        {...register("peso")}
                        placeholder="Ej. 5.5"
                        className={INPUT_CLS}
                    />
                    {errors.peso && <p className={ERROR_CLS}>{errors.peso.message}</p>}
                </div>
                <div>
                    <label className={LABEL_CLS}>Procedencia *</label>
                    <input
                        {...register("procedencia")}
                        placeholder="Ej. Avenida, aguas sucias..."
                        className={INPUT_CLS}
                    />
                    {errors.procedencia && (
                        <p className={ERROR_CLS}>{errors.procedencia.message}</p>
                    )}
                </div>
            </div>

            {/* Estado y espacio */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={LABEL_CLS}>Estado *</label>
                    <select {...register("idEstado")} className={INPUT_CLS}>
                        <option value="">Seleccionar...</option>
                        {estados.map((e) => (
                            <option key={e.idEstado} value={e.idEstado}>
                                {e.nombreEstado}
                            </option>
                        ))}
                    </select>
                    {errors.idEstado && (
                        <p className={ERROR_CLS}>{errors.idEstado.message}</p>
                    )}
                </div>
                <div>
                    <label className={LABEL_CLS}>Espacio / Lugar *</label>
                    <select {...register("idEspacio")} className={INPUT_CLS}>
                        <option value="">Seleccionar...</option>
                        {espacios.map((e) => (
                            <option key={e.id} value={e.id}>
                                {e.name}
                            </option>
                        ))}
                    </select>
                    {errors.idEspacio && (
                        <p className={ERROR_CLS}>{errors.idEspacio.message}</p>
                    )}
                </div>
            </div>

            {/* Textos largos */}
            <div>
                <label className={LABEL_CLS}>Rasgos físicos *</label>
                <textarea
                    {...register("rasgosFisicos")}
                    placeholder="Color, marcas, tamaño..."
                    rows={2}
                    className={`${INPUT_CLS} resize-none`}
                />
                {errors.rasgosFisicos && (
                    <p className={ERROR_CLS}>{errors.rasgosFisicos.message}</p>
                )}
            </div>
            <div>
                <label className={LABEL_CLS}>Estado inicial al ingreso *</label>
                <textarea
                    {...register("estadoInicial")}
                    placeholder="Condición de salud al momento de ingreso..."
                    rows={2}
                    className={`${INPUT_CLS} resize-none`}
                />
                {errors.estadoInicial && (
                    <p className={ERROR_CLS}>{errors.estadoInicial.message}</p>
                )}
            </div>

            {/* Checkboxes */}
            <div className="flex items-center gap-6 pt-1 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                    <input
                        type="checkbox"
                        {...register("enCuarentena")}
                        className="w-4 h-4 rounded accent-primary"
                    />
                    En cuarentena
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                    <input
                        type="checkbox"
                        {...register("esterilizado")}
                        className="w-4 h-4 rounded accent-primary"
                    />
                    Esterilizado
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                    <input
                        type="checkbox"
                        {...register("disponibleAdopcion")}
                        className="w-4 h-4 rounded accent-primary"
                    />
                    Disponible para adopción
                </label>
            </div>

            {/* Acciones */}
            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-60"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition flex items-center justify-center gap-2"
                    style={{ backgroundColor: "#43AE6D" }}
                >
                    <Save size={14} />
                    {saving ? "Guardando..." : submitLabel}
                </button>
            </div>
        </form>
    );
}