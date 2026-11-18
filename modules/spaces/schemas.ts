// modules/spaces/validators/space.validators.ts
import { z } from 'zod';

/**
 * RF3.1 / regla 1: `espacio.tipo` solo admite valores canónicos. El formulario
 * legacy envía variantes como `Canil` o `Rehabilitación`; se normalizan antes
 * de validar para no romper la UI existente, pero cualquier valor fuera del
 * conjunto canónico se rechaza.
 */
export const SPACE_TYPES = [
    'canil',
    'gatera',
    'cuarentena',
    'rehabilitacion',
    'otro',
] as const;

export const SpaceTypeSchema = z
    .string({
        error: 'El tipo es requerido',
    })
    .transform((value) =>
        value
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, ''),
    )
    .refine(
        (value) => (SPACE_TYPES as readonly string[]).includes(value),
        {
            error: 'El tipo debe ser canil, gatera, cuarentena, rehabilitación u otro',
        },
    );

export const SpaceFieldsSchema = z.object({
    name: z.string({
        error: 'El nombre del espacio es requerido',
    })
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(100, 'El nombre no puede tener más de 100 caracteres'),
    description: z.string()
        .max(500, 'La descripción no puede tener más de 500 caracteres')
        .nullable()
        .optional(),
    capacity: z.number({
        error: 'La capacidad es requerida'
    })
        .min(1, 'La capacidad debe ser al menos 1')
        .max(9999, 'La capacidad no puede ser mayor a 9999'),
    type: SpaceTypeSchema,
    available: z.boolean().optional().default(true),
});
export const SpaceSchema = SpaceFieldsSchema.extend({
    id: z.coerce.number().int().positive(),
    shelterId: z.coerce.number().int().positive()
});

export const CreateSpaceSchema = SpaceFieldsSchema;

export const UpdateSpaceSchema = SpaceFieldsSchema;

/**
 * Variantes para la API v1. Se derivan de los esquemas anteriores (sin
 * duplicar campos):
 * - `CreateSpaceApiSchema` admite `shelterId` para que el superadmin cree
 *   espacios en cualquier refugio.
 * - `UpdateSpaceApiSchema` permite actualizaciones parciales (PATCH).
 */
export const CreateSpaceApiSchema = CreateSpaceSchema.extend({
    shelterId: z.number().int().positive().optional(),
});

export const UpdateSpaceApiSchema = UpdateSpaceSchema.partial();

export const SpaceFiltersSchema = z.object({
    shelterId: z.number().optional(),
    available: z.boolean().optional(),
    type: SpaceTypeSchema.optional(),
    searchTerm: z.string().optional(),
});

