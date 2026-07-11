// modules/animals/schemas.ts

import { z } from 'zod';

/**
 * Validación para especie
 */
const EspecieSchema = z.enum(['perro', 'gato', 'conejo', 'ave', 'otro']);

/**
 * Validación para estado del animal
 */
const EstadoAnimalSchema = z.enum([
    'disponible',
    'en_proceso',
    'adoptado',
    'no_disponible',
    'fallecido'
]);

/**
 * Validación para sexo
 */
const SexoSchema = z.enum(['M', 'H', '']);

/**
 * Schema para crear un animal
 */
export const CreateAnimalSchema = z.object({
    idRefugio: z.number().int().positive(),
    nombre: z.string().nullable().optional(),
    especie: z.enum(['Perro', 'Gato']), // Ajusta según tu enum Especie
    raza: z.string().nullable().optional(),
    estado: z.object({
        id: z.number().int().positive(),
        nombre: z.string()
    }),
    espacio: z.object({
        id: z.number().int().positive(),
        nombre: z.string()
    }),
    sexo: z.enum(['M', 'H']), // Ajusta según tu enum Sexo
    edadEstimada: z.number().int().nonnegative().nullable().optional(), // en meses
    peso: z.number().nonnegative().nullable().optional(), // en kilos
    procedencia: z.string().min(1, 'La procedencia es requerida'),
    rasgosFisicos: z.string().min(1, 'Los rasgos físicos son requeridos'),
    estadoInicial: z.string().min(1, 'El estado inicial es requerido'),
    esterilizado: z.boolean().default(false),
    cuarentena: z.boolean().default(false),
    disponibleAdopcion: z.boolean().default(true),
    fechaIngreso: z.date().default(() => new Date()),
    activo: z.boolean().default(true),
    deletedAt: z.date().nullable().optional()
});

/**
 * Schema para actualizar un animal
 * Todos los campos son opcionales
 */
export const UpdateAnimalSchema = z.object({
    nombre: z.string().nullable().optional(),
    especie: z.enum(['Perro', 'Gato']).optional(),
    raza: z.string().nullable().optional(),
    sexo: z.enum(['M', 'H']).optional(),
    estado: z.object({
        id: z.number().int().positive()
    }).optional(),
    espacio: z.object({
        id: z.number().int().positive()
    }).optional(),
    edadEstimada: z.number().int().nonnegative().nullable().optional(),
    peso: z.number().nonnegative().nullable().optional(),
    procedencia: z.string().optional(),
    rasgosFisicos: z.string().optional(),
    esterilizado: z.boolean().optional(),
    deletedAt: z.date().nullable().optional()
});

/**
 * Schema para filtros de animales
 */
export const AnimalFiltersSchema = z.object({
    especie: z.enum(['Perro', 'Gato']).optional(),
    estadoId: z.number().int().positive().optional(),
    esterilizado: z.boolean().optional(),
    refugioId: z.number().int().positive(),
    search: z.string().optional(),
    activo: z.boolean().optional(),
    limit: z.number().int().positive().default(10),
    offset: z.number().int().nonnegative().optional().default(0)
});

/**
 * Schema para validar ID de animal en parámetros de ruta
 */
export const AnimalIdSchema = z.object({
    id: z.string().uuid('ID de animal inválido')
});