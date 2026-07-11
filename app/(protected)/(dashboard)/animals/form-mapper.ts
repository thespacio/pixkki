import {
    CreateAnimalSchema
} from "@/modules/animals/schemas";

import {
    CreateAnimalInput
} from "@/modules/animals/types";

import {
    AnimalFormData
} from "./types";

export function toCreateAnimalInput(
    form: AnimalFormData
): CreateAnimalInput {

    return CreateAnimalSchema.parse({
        nombre: form.nombre,
        especie: form.especie,
        raza: form.raza || null,
        sexo: form.sexo,
        estado: {
            id: Number(form.idEstado)
        },
        espacio: {
            id: Number(form.idEspacio)
        },
        edadEstimada:
            form.edadEstimada === ""
                ? null
                : form.edadEstimada,
        peso:
            form.peso === ""
                ? null
                : form.peso,
        procedencia: form.procedencia,
        rasgosFisicos: form.rasgosFisicos,
        esterilizado: form.esterilizado
    });
}