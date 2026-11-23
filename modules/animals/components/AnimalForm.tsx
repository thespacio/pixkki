"use client";

import { useId, useMemo, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Save } from "lucide-react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { SpaceWithOptionalOccupancy } from "@/modules/spaces/ports/space-occupancy.port";
import {
    SITUACIONES_RESCATE,
    TAMANOS,
    TEMPERAMENTOS,
} from "@/modules/animals/types/animales.types";
import {
    createAnimalFormSchema,
    CreateAnimalFormValues,
    CreateAnimalInput,
    hoyLocalISO,
    toFormValues,
} from "@/modules/animals/validators/animal.validators";
import type { ShelterOption } from "@/modules/animals/components/AnimalFilterBar";

type Props = {
    espacios: SpaceWithOptionalOccupancy[];
    /**
     * Albergues entre los que se puede elegir. Solo lo recibe el superadmin; si
     * está vacío, el animal se asocia automáticamente al albergue del usuario y
     * el selector no se muestra.
     */
    refugios?: ShelterOption[];
    defaultValues?: Partial<CreateAnimalInput>;
    /**
     * Presentacional: entrega los valores del formulario y quien lo usa decide
     * si los convierte a alta (`toCreateAnimalInput`) o a edición
     * (`toUpdateAnimalInput`).
     */
    onSubmit: (values: CreateAnimalFormValues) => Promise<void>;
    submitLabel: string;
    saving: boolean;
    onCancel: () => void;
    /** En edición: oculta el estado del paciente y los campos con flujo propio. */
    mode?: "create" | "edit";
    /** RF2.4: mientras esté en cuarentena, solo puede alojarse en cuarentena. */
    enCuarentena?: boolean;
};

const INPUT_CLS =
    "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";
const LABEL_CLS = "block text-xs font-medium text-foreground mb-1";
const ERROR_CLS = "mt-1 text-xs text-red-600";
const CHECK_CLS = "flex items-center gap-2 cursor-pointer text-sm text-foreground";

function Section({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <fieldset className="space-y-3 rounded-2xl border border-border p-4">
            <legend className="px-2 text-xs font-bold uppercase tracking-widest text-primary">
                {title}
            </legend>
            {description && (
                <p className="text-xs text-muted-foreground -mt-1">{description}</p>
            )}
            {children}
        </fieldset>
    );
}

function Field({
    id,
    label,
    error,
    hint,
    children,
}: {
    id: string;
    label: string;
    error?: string;
    hint?: string;
    children: ReactNode;
}) {
    return (
        <div>
            <label htmlFor={id} className={LABEL_CLS}>
                {label}
            </label>
            {children}
            {hint && !error && (
                <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
            )}
            {error && (
                <p id={`${id}-error`} role="alert" className={ERROR_CLS}>
                    {error}
                </p>
            )}
        </div>
    );
}

export function AnimalForm({
    espacios,
    refugios = [],
    defaultValues,
    onSubmit,
    submitLabel,
    saving,
    onCancel,
    mode = "create",
    enCuarentena = false,
}: Props) {
    const uid = useId();
    const id = (name: string) => `${uid}-${name}`;
    const isEdit = mode === "edit";
    // En edición el albergue no se mueve: solo se ofrecen espacios del propio.
    const chooseShelter = !isEdit && refugios.length > 0;

    const schema = useMemo(
        () => createAnimalFormSchema({ requireShelter: chooseShelter }),
        [chooseShelter],
    );

    const initialValues = toFormValues(defaultValues);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CreateAnimalFormValues>({
        resolver: zodResolver(schema),
        // El estado del paciente ya no se elige en el alta. Se mantiene un
        // valor oculto para conservar el contrato del formulario; el servidor
        // lo descarta y resuelve "Cuarentena" desde el catálogo. En edición se
        // conserva el actual, que tampoco se envía en el DTO parcial.
        defaultValues: {
            ...initialValues,
            idEstado: isEdit ? initialValues.idEstado : "1",
        },
    });

    // Un espacio pertenece a un solo albergue: al elegir albergue solo se ofrecen
    // sus espacios. Sin selector (usuario no superadmin) ya llegan filtrados.
    // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form watch es API esperada
    const idRefugio = watch("idRefugio");

    // RF1.1/RF2.4/RF3.1: todo ingreso nace en cuarentena, y un paciente que ya
    // está en cuarentena solo puede alojarse en un espacio designado para ello.
    // Se ocultan los espacios sin cupo; el actual siempre se ofrece en edición
    // para no dejar un select vacío cuando el espacio está lleno.
    const requiereCuarentena = !isEdit || enCuarentena;
    const idEspacioActual = initialValues.idEspacio;
    const espaciosDisponibles = espacios.filter((espacio) => {
        if (chooseShelter && String(espacio.shelterId) !== idRefugio) return false;
        if (isEdit && idEspacioActual !== "" && String(espacio.id) === idEspacioActual) {
            return true;
        }
        // Sin datos de ocupación se asume capacidad completa (consumidores
        // antiguos); el servidor sigue siendo la fuente de verdad del cupo.
        const capacidadLibre =
            espacio.capacidadLibre ?? espacio.capacity - (espacio.ocupacion ?? 0);
        if (!espacio.available || capacidadLibre <= 0) return false;
        return !requiereCuarentena || espacio.type === "cuarentena";
    });

    async function submit(values: CreateAnimalFormValues) {
        await onSubmit(values);
    }

    return (
        <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
            <input type="hidden" {...register("idEstado")} />

            <Section
                title={isEdit ? "Datos del expediente" : "Datos del ingreso"}
                description={
                    isEdit
                        ? "Puedes corregir la información registrada. Los campos vacíos se guardan sin valor."
                        : "Lo mínimo para abrir el expediente. El resto es opcional."
                }
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {chooseShelter && (
                        <Field
                            id={id("idRefugio")}
                            label="Albergue *"
                            error={errors.idRefugio?.message}
                        >
                            <select
                                id={id("idRefugio")}
                                {...register("idRefugio", {
                                    // Al cambiar de albergue el espacio elegido deja de ser válido.
                                    onChange: () => setValue("idEspacio", ""),
                                })}
                                className={INPUT_CLS}
                            >
                                <option value="">Seleccionar...</option>
                                {refugios.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.nombre}
                                    </option>
                                ))}
                            </select>
                        </Field>
                    )}

                    <Field
                        id={id("idEspacio")}
                        label="Espacio / Lugar *"
                        error={errors.idEspacio?.message}
                        hint={
                            chooseShelter && idRefugio === ""
                                ? "Primero elige un albergue"
                                : espaciosDisponibles.length === 0
                                  ? requiereCuarentena
                                      ? "No hay espacios de cuarentena con cupo. Designa uno en la página Espacios (Tipo: Cuarentena)."
                                      : "No hay espacios disponibles con cupo en este albergue"
                                  : requiereCuarentena
                                    ? "Solo espacios de cuarentena con cupo"
                                    : undefined
                        }
                    >
                        <select
                            id={id("idEspacio")}
                            {...register("idEspacio")}
                            disabled={chooseShelter && idRefugio === ""}
                            className={`${INPUT_CLS} disabled:opacity-60`}
                        >
                            <option value="">Seleccionar...</option>
                            {espaciosDisponibles.map((e) => (
                                <option key={e.id} value={e.id}>
                                    {e.name}
                                    {e.type === "cuarentena" ? " (cuarentena)" : ""}
                                    {!isEdit && e.capacidadLibre !== undefined && e.capacidadLibre > 0
                                        ? ` · ${e.capacidadLibre} plazas libres`
                                        : ""}
                                </option>
                            ))}
                        </select>
                    </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field
                        id={id("especie")}
                        label="Especie *"
                        error={errors.especie?.message}
                    >
                        <select
                            id={id("especie")}
                            {...register("especie")}
                            className={INPUT_CLS}
                        >
                            <option value="Perro">Perro</option>
                            <option value="Gato">Gato</option>
                        </select>
                    </Field>

                    <Field
                        id={id("nombre")}
                        label="Nombre (opcional)"
                        error={errors.nombre?.message}
                    >
                        <input
                            id={id("nombre")}
                            {...register("nombre")}
                            placeholder="Ej. Firulais"
                            className={INPUT_CLS}
                        />
                    </Field>
                </div>

                <Field
                    id={id("procedencia")}
                    label="Procedencia *"
                    error={errors.procedencia?.message}
                >
                    <input
                        id={id("procedencia")}
                        {...register("procedencia")}
                        placeholder="Ej. Calle, vecino, entrega voluntaria"
                        className={INPUT_CLS}
                    />
                </Field>

                <Field
                    id={id("rasgosFisicos")}
                    label="Rasgos físicos *"
                    error={errors.rasgosFisicos?.message}
                >
                    <textarea
                        id={id("rasgosFisicos")}
                        {...register("rasgosFisicos")}
                        placeholder="Marcas, cicatrices, orejas, cola..."
                        rows={2}
                        className={`${INPUT_CLS} resize-none`}
                    />
                </Field>

                <Field
                    id={id("estadoInicial")}
                    label="Estado inicial de salud *"
                    error={errors.estadoInicial?.message}
                >
                    <textarea
                        id={id("estadoInicial")}
                        {...register("estadoInicial")}
                        placeholder="Condición de salud al momento de ingreso..."
                        rows={2}
                        className={`${INPUT_CLS} resize-none`}
                    />
                </Field>

                {!isEdit && (
                    <Field
                        id={id("estadoPaciente")}
                        label="Estado del paciente"
                        hint="Se asigna automáticamente y no se puede cambiar."
                    >
                        <input
                            id={id("estadoPaciente")}
                            value="Cuarentena"
                            readOnly
                            aria-readonly="true"
                            className={`${INPUT_CLS} cursor-not-allowed bg-secondary/50 text-foreground`}
                        />
                    </Field>
                )}
            </Section>

            <Collapsible
                className="rounded-2xl border border-border"
                defaultOpen={isEdit}
            >
                <CollapsibleTrigger className="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
                    <span>
                        <span className="block text-xs font-bold uppercase tracking-widest text-primary">
                            Más datos (opcional)
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                            Identificación, rescate y salud.
                        </span>
                    </span>
                    <ChevronDown
                        size={16}
                        className="shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
                        aria-hidden="true"
                    />
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-4 border-t border-border p-4">
                    <Section title="Identificación">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Field
                                id={id("raza")}
                                label="Raza"
                                error={errors.raza?.message}
                            >
                                <input
                                    id={id("raza")}
                                    {...register("raza")}
                                    placeholder="Ej. Labrador o mestizo"
                                    className={INPUT_CLS}
                                />
                            </Field>
                            <Field
                                id={id("sexo")}
                                label="Sexo"
                                error={errors.sexo?.message}
                            >
                                <select
                                    id={id("sexo")}
                                    {...register("sexo")}
                                    className={INPUT_CLS}
                                >
                                    <option value="">No determinado</option>
                                    <option value="M">Macho</option>
                                    <option value="H">Hembra</option>
                                </select>
                            </Field>
                            <Field
                                id={id("edadEstimada")}
                                label="Edad estimada (meses)"
                                error={errors.edadEstimada?.message}
                                hint="Ej. 18 = año y medio"
                            >
                                <input
                                    id={id("edadEstimada")}
                                    type="number"
                                    min="0"
                                    inputMode="numeric"
                                    {...register("edadEstimada")}
                                    placeholder="Ej. 12"
                                    className={INPUT_CLS}
                                />
                            </Field>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Field
                                id={id("peso")}
                                label="Peso (kg)"
                                error={errors.peso?.message}
                            >
                                <input
                                    id={id("peso")}
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    inputMode="decimal"
                                    {...register("peso")}
                                    placeholder="Ej. 5.5"
                                    className={INPUT_CLS}
                                />
                            </Field>
                            <Field
                                id={id("tamano")}
                                label="Tamaño"
                                error={errors.tamano?.message}
                            >
                                <select
                                    id={id("tamano")}
                                    {...register("tamano")}
                                    className={INPUT_CLS}
                                >
                                    <option value="">Sin especificar</option>
                                    {TAMANOS.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field
                                id={id("color")}
                                label="Color / pelaje"
                                error={errors.color?.message}
                            >
                                <input
                                    id={id("color")}
                                    {...register("color")}
                                    placeholder="Ej. Café con blanco"
                                    className={INPUT_CLS}
                                />
                            </Field>
                        </div>

                        <Field
                            id={id("microchip")}
                            label="Microchip"
                            error={errors.microchip?.message}
                            hint="Opcional. 9 a 20 letras o números; no puede repetirse."
                        >
                            <input
                                id={id("microchip")}
                                {...register("microchip")}
                                placeholder="Ej. 985112345678901"
                                className={INPUT_CLS}
                                autoComplete="off"
                            />
                        </Field>
                    </Section>

                    <Section
                        title="Rescate"
                        description="Datos de cómo y dónde se encontró al animal."
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Field
                                id={id("situacionRescate")}
                                label="Situación del rescate"
                                error={errors.situacionRescate?.message}
                            >
                                <select
                                    id={id("situacionRescate")}
                                    {...register("situacionRescate")}
                                    className={INPUT_CLS}
                                >
                                    <option value="">Sin especificar</option>
                                    {SITUACIONES_RESCATE.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field
                                id={id("lugarRescate")}
                                label="Lugar del rescate"
                                error={errors.lugarRescate?.message}
                            >
                                <input
                                    id={id("lugarRescate")}
                                    {...register("lugarRescate")}
                                    placeholder="Calle, colonia o referencia"
                                    className={INPUT_CLS}
                                />
                            </Field>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Field
                                id={id("fechaRescate")}
                                label="Fecha del rescate"
                                error={errors.fechaRescate?.message}
                            >
                                <input
                                    id={id("fechaRescate")}
                                    type="date"
                                    max={hoyLocalISO()}
                                    {...register("fechaRescate")}
                                    className={INPUT_CLS}
                                />
                            </Field>
                            <Field
                                id={id("rescatistaNombre")}
                                label="Reportado por"
                                error={errors.rescatistaNombre?.message}
                            >
                                <input
                                    id={id("rescatistaNombre")}
                                    {...register("rescatistaNombre")}
                                    placeholder="Nombre de quien lo encontró"
                                    className={INPUT_CLS}
                                />
                            </Field>
                            <Field
                                id={id("rescatistaContacto")}
                                label="Contacto"
                                error={errors.rescatistaContacto?.message}
                            >
                                <input
                                    id={id("rescatistaContacto")}
                                    {...register("rescatistaContacto")}
                                    placeholder="Teléfono o correo"
                                    className={INPUT_CLS}
                                />
                            </Field>
                        </div>
                    </Section>

                    <Section title="Salud y comportamiento">
                        <Field
                            id={id("temperamento")}
                            label="Temperamento"
                            error={errors.temperamento?.message}
                        >
                            <select
                                id={id("temperamento")}
                                {...register("temperamento")}
                                className={INPUT_CLS}
                            >
                                <option value="">Sin evaluar</option>
                                {TEMPERAMENTOS.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 pt-1">
                            <label className={CHECK_CLS}>
                                <input
                                    type="checkbox"
                                    {...register("vacunado")}
                                    className="w-4 h-4 rounded accent-primary"
                                />
                                Vacunado
                            </label>
                            <label className={CHECK_CLS}>
                                <input
                                    type="checkbox"
                                    {...register("desparasitado")}
                                    className="w-4 h-4 rounded accent-primary"
                                />
                                Desparasitado
                            </label>
                            {!isEdit && (
                                <label className={CHECK_CLS}>
                                    <input
                                        type="checkbox"
                                        {...register("esterilizado")}
                                        className="w-4 h-4 rounded accent-primary"
                                    />
                                    Esterilizado
                                </label>
                            )}
                        </div>

                        <p className="text-[11px] text-muted-foreground">
                            {isEdit
                                ? "La esterilización, la cuarentena y la disponibilidad de adopción se gestionan con sus flujos clínicos; no se editan aquí."
                                : "La disponibilidad de adopción se gestiona desde la ficha clínica, no desde el alta."}
                        </p>
                    </Section>

                    <Section title="Observaciones">
                        <Field
                            id={id("observaciones")}
                            label="Notas adicionales"
                            error={errors.observaciones?.message}
                        >
                            <textarea
                                id={id("observaciones")}
                                {...register("observaciones")}
                                placeholder="Cualquier dato extra que ayude a cuidarlo o a darlo en adopción..."
                                rows={3}
                                className={`${INPUT_CLS} resize-none`}
                            />
                        </Field>
                    </Section>
                </CollapsibleContent>
            </Collapsible>

            {/* Las imágenes se gestionan después del alta desde la galería del
                expediente, con progreso de subida por archivo (RF1.2). */}
            <p className="text-xs text-muted-foreground">
                Las imágenes del expediente se agregan después del registro, desde la
                ficha del animal.
            </p>

            <div className="flex gap-3 pt-1">
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
                    <Save size={14} aria-hidden="true" />
                    {saving ? "Guardando..." : submitLabel}
                </button>
            </div>
        </form>
    );
}
