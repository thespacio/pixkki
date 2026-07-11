// modules/animals/types.ts
import { z } from "zod";
import {AnimalFiltersSchema, AnimalIdSchema, CreateAnimalSchema, UpdateAnimalSchema} from "@/modules/animals/schemas";

/**
 * Especies soportadas en el sistema
 */
export const ESPECIES = ['Perro', 'Gato'] as const;
export type Especie = typeof ESPECIES[number];

/**
 * Sexo biológico del animal
 */
export const SEXOS = ['M', 'H'] as const;
export type Sexo = typeof SEXOS[number];

/**
 * Entidad principal del dominio Animal
 * Representa el modelo de negocio, no la tabla de la base de datos
 */
export interface Animal {
    id: number;
    idRefugio: number;
    //uuid
    nombre: string | null;
    especie: Especie;
    raza: string | null;
    estado: {
        id: number;
        nombre: string;
    };
    espacio: {
        id: number;
        nombre: string;
    };
    sexo: Sexo | null;
    edadEstimada: number | null; // en meses
    peso: number | null; // en kilos
    procedencia: string;
    rasgosFisicos: string;
    estadoInicial: string;
    esterilizado: boolean;
    cuarentena: boolean;
    disponibleAdopcion: boolean;
    fechaIngreso: Date;
    activo: boolean; // Soft delete flag
    //createdAt: Date;
    //updatedAt: Date;
    deletedAt?: Date | null;
}

// Tipos inferidos para usar en el resto del código
export type CreateAnimalInput = z.infer<typeof CreateAnimalSchema>;
export type UpdateAnimalInput = z.infer<typeof UpdateAnimalSchema>;
export type AnimalFilters = z.infer<typeof AnimalFiltersSchema>;
export type AnimalIdParams = z.infer<typeof AnimalIdSchema>;

/**
 * Respuesta paginada para listados
 */
export interface PaginatedAnimals {
    data: Animal[];
    total: number;
    limit: number;
    offset: number;
}