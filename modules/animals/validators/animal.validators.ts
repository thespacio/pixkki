import { z } from "zod";
import {
    SITUACIONES_RESCATE,
    TAMANOS,
    TEMPERAMENTOS,
} from "@/modules/animals/types/animales.types";

// ---------------------------------------------------------------------------
// Schema del DTO — contrato final con Service/Action
// ---------------------------------------------------------------------------
//
// Aquí viven las reglas estructurales del dato que entra al dominio.
// Es la única fuente de verdad para:
//   - tipos (number, string, boolean)
//   - campos requeridos
//   - rangos (min/max, int, positive)
//   - enums (especie, sexo, tamaño, temperamento, situación de rescate)
//
// La Server Action vuelve a parsear con este schema antes de llamar al Service.

const MICROCHIP_REGEX = /^[A-Za-z0-9-]{9,20}$/;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const UN_DIA_MS = 24 * 60 * 60 * 1000;

/**
 * Fecha ISO (YYYY-MM-DD) válida y no futura.
 * Se admite un día de margen porque el servidor y el navegador pueden estar en
 * zonas horarias distintas (la fecha "de hoy" no coincide cerca de medianoche).
 */
const isoDateNotFuture = z
    .string()
    .regex(ISO_DATE_REGEX, "Fecha inválida")
    .refine((v) => !Number.isNaN(Date.parse(`${v}T00:00:00Z`)), "Fecha inválida")
    .refine(
        (v) => Date.parse(`${v}T00:00:00Z`) <= Date.now() + UN_DIA_MS,
        "La fecha no puede ser futura",
    );

// Campos sin ningún valor por defecto. Es la base tanto de la creación (que le
// agrega defaults a los flags) como de la actualización parcial: en Zod 4 un
// `.default()` dentro de `.partial()` SE APLICA aunque el campo no venga, lo que
// pisaría datos existentes en cada update. Por eso los defaults no viven acá.
const AnimalFieldsSchema = z.object({
    nombre: z.string().trim().min(1).max(100).optional(),
    especie: z.enum(["Perro", "Gato"]),
    raza: z.string().trim().max(80).optional(),
    sexo: z.enum(["M", "H"]).optional(),
    edadEstimada: z.number().int().min(0).max(300).optional(),
    peso: z.number().positive().max(500).optional(),
    procedencia: z.string().trim().min(2).max(200),
    rasgosFisicos: z.string().trim().min(2).max(500),
    estadoInicial: z.string().trim().min(2).max(100),
    idEstado: z.number().int().positive(),
    idEspacio: z.number().int().positive(),

    // Albergue al que se asocia. Solo lo respeta la Action si el usuario es
    // superadmin; para el resto se usa siempre el albergue del propio usuario.
    idRefugio: z.number().int().positive().optional(),

    // Ficha completa / datos de rescate
    color: z.string().trim().min(1).max(50).optional(),
    tamano: z.enum(TAMANOS).optional(),
    microchip: z
        .string()
        .trim()
        .regex(MICROCHIP_REGEX, "El microchip debe tener entre 9 y 20 caracteres alfanuméricos")
        .optional(),
    temperamento: z.enum(TEMPERAMENTOS).optional(),
    lugarRescate: z.string().trim().min(2).max(200).optional(),
    fechaRescate: isoDateNotFuture.optional(),
    situacionRescate: z.enum(SITUACIONES_RESCATE).optional(),
    rescatistaNombre: z.string().trim().min(2).max(100).optional(),
    rescatistaContacto: z.string().trim().min(3).max(100).optional(),
    observaciones: z.string().trim().min(1).max(1000).optional(),
});

const AnimalFlagsSchema = z.object({
    enCuarentena: z.boolean(),
    esterilizado: z.boolean(),
    disponibleAdopcion: z.boolean(),
    activo: z.boolean(),
    vacunado: z.boolean(),
    desparasitado: z.boolean(),
});

export const CreateAnimalSchema = AnimalFieldsSchema.extend({
    enCuarentena: AnimalFlagsSchema.shape.enCuarentena.default(false),
    esterilizado: AnimalFlagsSchema.shape.esterilizado.default(false),
    disponibleAdopcion: AnimalFlagsSchema.shape.disponibleAdopcion.default(false),
    activo: AnimalFlagsSchema.shape.activo.default(true),
    vacunado: AnimalFlagsSchema.shape.vacunado.default(false),
    desparasitado: AnimalFlagsSchema.shape.desparasitado.default(false),
});

export type CreateAnimalInput = z.infer<typeof CreateAnimalSchema>;

export const UpdateAnimalSchema = AnimalFieldsSchema.extend(AnimalFlagsSchema.shape)
    .partial()
    .extend({
        id: z.number().int().positive(),
    });

export type UpdateAnimalInput = z.infer<typeof UpdateAnimalSchema>;

// ---------------------------------------------------------------------------
// Schema del formulario — representación del DOM
// ---------------------------------------------------------------------------
//
// El DOM solo produce strings en inputs y selects. Este schema valida esa
// representación sin duplicar las reglas de negocio del DTO.
//
// NO define rangos de dominio como .int().positive() sobre numbers: solo
// verifica que el string sea convertible a un entero/decimal válido. La
// validación semántica (>= 0, > 0, etc.) sigue viviendo en CreateAnimalSchema,
// que se aplica al construir el DTO.

const numericString = (message: string, integer = false) =>
    z
        .string()
        .refine(
            (v) =>
                v === "" ||
                (integer ? /^\d+$/.test(v) : /^\d+(\.\d+)?$/.test(v)),
            { message },
        );

/** Fecha "de hoy" en horario local, formato YYYY-MM-DD (lo que usa <input type="date">). */
export function hoyLocalISO(now: Date = new Date()): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
    z.enum(["", ...values] as [string, ...string[]]);

/**
 * `requireShelter`: el superadmin debe elegir el albergue; el resto no ve ese
 * campo (se usa su propio albergue en el servidor).
 */
export function createAnimalFormSchema({ requireShelter = false } = {}) {
    return z
        .object({
            nombre: z.string().max(100),
            especie: z.enum(["Perro", "Gato"]),
            raza: z.string().max(80),
            sexo: z.enum(["", "M", "H"]),
            edadEstimada: numericString("Debe ser un número entero", true),
            peso: numericString("Debe ser un número positivo"),
            procedencia: z.string().min(2, "Mínimo 2 caracteres").max(200),
            rasgosFisicos: z.string().min(2, "Mínimo 2 caracteres").max(500),
            estadoInicial: z.string().min(2, "Mínimo 2 caracteres").max(100),
            idEstado: z.string().min(1, "Selecciona un estado"),
            idEspacio: z.string().min(1, "Selecciona un espacio"),
            idRefugio: z.string(),
            enCuarentena: z.boolean(),
            esterilizado: z.boolean(),
            disponibleAdopcion: z.boolean(),
            activo: z.boolean(),

            color: z.string().max(50, "Máximo 50 caracteres"),
            tamano: optionalEnum(TAMANOS),
            microchip: z
                .string()
                .refine(
                    (v) => v.trim() === "" || MICROCHIP_REGEX.test(v.trim()),
                    "Debe tener entre 9 y 20 caracteres alfanuméricos",
                ),
            temperamento: optionalEnum(TEMPERAMENTOS),
            vacunado: z.boolean(),
            desparasitado: z.boolean(),
            lugarRescate: z.string().max(200, "Máximo 200 caracteres"),
            fechaRescate: z
                .string()
                .refine((v) => v === "" || ISO_DATE_REGEX.test(v), "Fecha inválida")
                .refine((v) => v === "" || v <= hoyLocalISO(), "La fecha no puede ser futura"),
            situacionRescate: optionalEnum(SITUACIONES_RESCATE),
            rescatistaNombre: z.string().max(100, "Máximo 100 caracteres"),
            rescatistaContacto: z.string().max(100, "Máximo 100 caracteres"),
            observaciones: z.string().max(1000, "Máximo 1000 caracteres"),
        })
        .superRefine((values, ctx) => {
            if (requireShelter && values.idRefugio === "") {
                ctx.addIssue({
                    code: "custom",
                    path: ["idRefugio"],
                    message: "Selecciona un albergue",
                });
            }
        });
}

export const CreateAnimalFormSchema = createAnimalFormSchema();

export type CreateAnimalFormValues = z.infer<typeof CreateAnimalFormSchema>;

// ---------------------------------------------------------------------------
// Transformación Form → DTO
// ---------------------------------------------------------------------------
//
// Esta función NO valida: asume que CreateAnimalFormSchema ya pasó. Convierte
// strings a los tipos que espera CreateAnimalInput. La validación de dominio
// la hará CreateAnimalSchema.parse en la Server Action.

const textOrUndefined = (v: string) => (v.trim() === "" ? undefined : v.trim());

export function toCreateAnimalInput(
    values: CreateAnimalFormValues,
): CreateAnimalInput {
    return {
        nombre: textOrUndefined(values.nombre),
        especie: values.especie,
        raza: textOrUndefined(values.raza),
        sexo: values.sexo === "" ? undefined : values.sexo,
        edadEstimada:
            values.edadEstimada === "" ? undefined : Number(values.edadEstimada),
        peso: values.peso === "" ? undefined : Number(values.peso),
        procedencia: values.procedencia.trim(),
        rasgosFisicos: values.rasgosFisicos.trim(),
        estadoInicial: values.estadoInicial.trim(),
        idEstado: Number(values.idEstado),
        idEspacio: Number(values.idEspacio),
        idRefugio: values.idRefugio === "" ? undefined : Number(values.idRefugio),
        enCuarentena: values.enCuarentena,
        esterilizado: values.esterilizado,
        disponibleAdopcion: values.disponibleAdopcion,
        activo: values.activo,

        color: textOrUndefined(values.color),
        tamano: values.tamano === "" ? undefined : (values.tamano as CreateAnimalInput["tamano"]),
        microchip: textOrUndefined(values.microchip),
        temperamento:
            values.temperamento === ""
                ? undefined
                : (values.temperamento as CreateAnimalInput["temperamento"]),
        vacunado: values.vacunado,
        desparasitado: values.desparasitado,
        lugarRescate: textOrUndefined(values.lugarRescate),
        fechaRescate: values.fechaRescate === "" ? undefined : values.fechaRescate,
        situacionRescate:
            values.situacionRescate === ""
                ? undefined
                : (values.situacionRescate as CreateAnimalInput["situacionRescate"]),
        rescatistaNombre: textOrUndefined(values.rescatistaNombre),
        rescatistaContacto: textOrUndefined(values.rescatistaContacto),
        observaciones: textOrUndefined(values.observaciones),
    };
}

// ---------------------------------------------------------------------------
// Transformación DTO → Form (para edición)
// ---------------------------------------------------------------------------
//
// Convierte un CreateAnimalInput (o parcial) en los valores del form.
// Tampoco valida: solo traduce tipos.

export function toFormValues(
    input?: Partial<CreateAnimalInput>,
): CreateAnimalFormValues {
    return {
        nombre: input?.nombre ?? "",
        especie: input?.especie ?? "Perro",
        raza: input?.raza ?? "",
        sexo: input?.sexo ?? "",
        edadEstimada:
            input?.edadEstimada !== undefined ? String(input.edadEstimada) : "",
        peso: input?.peso !== undefined ? String(input.peso) : "",
        procedencia: input?.procedencia ?? "",
        rasgosFisicos: input?.rasgosFisicos ?? "",
        estadoInicial: input?.estadoInicial ?? "",
        idEstado: input?.idEstado !== undefined ? String(input.idEstado) : "",
        idEspacio:
            input?.idEspacio !== undefined ? String(input.idEspacio) : "",
        idRefugio:
            input?.idRefugio !== undefined ? String(input.idRefugio) : "",
        enCuarentena: input?.enCuarentena ?? false,
        esterilizado: input?.esterilizado ?? false,
        disponibleAdopcion: input?.disponibleAdopcion ?? false,
        activo: input?.activo ?? true,

        color: input?.color ?? "",
        tamano: input?.tamano ?? "",
        microchip: input?.microchip ?? "",
        temperamento: input?.temperamento ?? "",
        vacunado: input?.vacunado ?? false,
        desparasitado: input?.desparasitado ?? false,
        lugarRescate: input?.lugarRescate ?? "",
        fechaRescate: input?.fechaRescate ?? "",
        situacionRescate: input?.situacionRescate ?? "",
        rescatistaNombre: input?.rescatistaNombre ?? "",
        rescatistaContacto: input?.rescatistaContacto ?? "",
        observaciones: input?.observaciones ?? "",
    };
}
