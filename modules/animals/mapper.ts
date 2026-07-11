import {Database} from "@/types/database";

import {AnimalInsert, AnimalRow, AnimalWithRelations} from "@/modules/animals/repository";
import {Animal, CreateAnimalInput, Especie, ESPECIES, Sexo, SEXOS, UpdateAnimalInput} from "@/modules/animals/types";

export function toAnimal(row: AnimalWithRelations): Animal {
    return {
        idRefugio: row.id_refugio,
        activo: row.activo,
        cuarentena: row.en_cuarentena,
        disponibleAdopcion: row.disponible_adopcion,
        edadEstimada: row.edad_estimada,
        especie: toEspecie(row.especie),
        estadoInicial: row.estado_inicial,
        esterilizado: row.esterilizado,
        fechaIngreso: new Date(row.fecha_ingreso),
        nombre: row.nombre,
        peso: row.peso,
        procedencia: row.procedencia,
        rasgosFisicos: row.rasgos_fisicos,
        raza: row.raza,
        sexo: toSexo(row.sexo?row.sexo:""),
        id: row.id_animal,
        estado: {
            id: row.id_estado,
            nombre: row.animal_estado?.nombre_estado ?? "",
        },
        espacio: {
            id: row.id_espacio,
            nombre: row.espacio?.nombre_espacio ?? "",
        }
    };
}

function toEspecie(value: string): Especie {
    if (ESPECIES.includes(value as Especie)) return value as Especie;
    throw new Error(`Especie inválida: ${value}`);
}

function toSexo(value: string): Sexo {
    if (SEXOS.includes(value as Sexo)) return value as Sexo;
    throw new Error(`Sexo inválida: ${value}`);
}


export function toAnimalInsert(
    input: CreateAnimalInput,
    refugioId: number
): AnimalInsert {

    return {
        id_refugio: refugioId,
        nombre: input.nombre ?? null,
        especie: input.especie? input.especie : '',
        raza: input.raza ?? null,
        sexo: input.sexo ?? null,
        edad_estimada: input.edadEstimada ?? null,
        peso: input.peso ?? null,
        procedencia: input.procedencia,
        rasgos_fisicos: input.rasgosFisicos,
        estado_inicial : input.estadoInicial,
        id_estado: input.estado?.id ? input.estado.id : 1,
        id_espacio: input.espacio?.id? input.espacio.id : 1,
        esterilizado: input.esterilizado
    };

}

export function toAnimalUpdate(
    input: UpdateAnimalInput
): Partial<AnimalRow>  {

    const db: Partial<AnimalRow>  = {};

    if (input.nombre !== undefined)
        db.nombre = input.nombre;

    if (input.raza !== undefined)
        db.raza = input.raza;

    if (input.estado?.id !== undefined)
        db.id_estado = input.estado.id;

    if (input.espacio?.id !== undefined)
        db.id_espacio = input.espacio.id;

    if (input.especie !== undefined)
        db.especie = input.especie;

    if (input.sexo !== undefined)
        db.sexo = input.sexo;

    if (input.edadEstimada !== undefined)
        db.edad_estimada = input.edadEstimada;

    if (input.esterilizado !== undefined)
        db.esterilizado = input.esterilizado;

    if (input.peso !== undefined)
        db.peso = input.peso;

    if (input.procedencia !== undefined)
        db.procedencia = input.procedencia;

    if (input.rasgosFisicos !== undefined)
        db.rasgos_fisicos = input.rasgosFisicos;

    return db;
}