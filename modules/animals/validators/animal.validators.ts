import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema del DTO — contrato final con Service/Action
// ---------------------------------------------------------------------------
//
// Aquí viven las reglas estructurales del dato que entra al dominio.
// Es la única fuente de verdad para:
//   - tipos (number, string, boolean)
//   - campos requeridos
//   - rangos (min/max, int, positive)
//   - enums (especie, sexo)
//
// La Server Action vuelve a parsear con este schema antes de llamar al Service.

export const CreateAnimalSchema = z.object({
    nombre: z.string().min(1).max(100).optional(),
    especie: z.enum(["Perro", "Gato"]),
    raza: z.string().max(80).optional(),
    sexo: z.enum(["M", "H"]).optional(),
    edadEstimada: z.number().int().min(0).max(100).optional(),
    peso: z.number().positive().max(500).optional(),
    procedencia: z.string().min(2).max(200),
    rasgosFisicos: z.string().min(2).max(500),
    estadoInicial: z.string().min(2).max(100),
    idEstado: z.number().int().positive(),
    idEspacio: z.number().int().positive(),
    enCuarentena: z.boolean().default(false),
    esterilizado: z.boolean().default(false),
    disponibleAdopcion: z.boolean().default(false),
    activo: z.boolean().default(true),
});

export type CreateAnimalInput = z.infer<typeof CreateAnimalSchema>;

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

export const CreateAnimalFormSchema = z.object({
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
    enCuarentena: z.boolean(),
    esterilizado: z.boolean(),
    disponibleAdopcion: z.boolean(),
    activo: z.boolean(),
});

export type CreateAnimalFormValues = z.infer<typeof CreateAnimalFormSchema>;

// ---------------------------------------------------------------------------
// Transformación Form → DTO
// ---------------------------------------------------------------------------
//
// Esta función NO valida: asume que CreateAnimalFormSchema ya pasó. Convierte
// strings a los tipos que espera CreateAnimalInput. La validación de dominio
// la hará CreateAnimalSchema.parse en la Server Action.

export function toCreateAnimalInput(
    values: CreateAnimalFormValues,
): CreateAnimalInput {
    return {
        nombre: values.nombre.trim() === "" ? undefined : values.nombre.trim(),
        especie: values.especie,
        raza: values.raza.trim() === "" ? undefined : values.raza.trim(),
        sexo: values.sexo === "" ? undefined : values.sexo,
        edadEstimada:
            values.edadEstimada === "" ? undefined : Number(values.edadEstimada),
        peso: values.peso === "" ? undefined : Number(values.peso),
        procedencia: values.procedencia.trim(),
        rasgosFisicos: values.rasgosFisicos.trim(),
        estadoInicial: values.estadoInicial.trim(),
        idEstado: Number(values.idEstado),
        idEspacio: Number(values.idEspacio),
        enCuarentena: values.enCuarentena,
        esterilizado: values.esterilizado,
        disponibleAdopcion: values.disponibleAdopcion,
        activo: values.activo,
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
        enCuarentena: input?.enCuarentena ?? false,
        esterilizado: input?.esterilizado ?? false,
        disponibleAdopcion: input?.disponibleAdopcion ?? false,
        activo: input?.activo ?? true,
    };
}