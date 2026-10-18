// modules/spaces/validators/space.validators.ts
import { z } from 'zod';


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
    type: z.string({
        error: 'El tipo es requerido',
    })
        .min(1, 'El tipo es requerido')
        .max(50, 'El tipo no puede tener más de 50 caracteres'),
    available: z.boolean().optional().default(true),
});
export const SpaceSchema = SpaceFieldsSchema.extend({
    id: z.coerce.number().int().positive(),
    shelterId: z.coerce.number().int().positive()
});

export const CreateSpaceSchema = SpaceFieldsSchema;

export const UpdateSpaceSchema = SpaceFieldsSchema;

export const SpaceFiltersSchema = z.object({
    shelterId: z.number().optional(),
    available: z.boolean().optional(),
    type: z.string().optional(),
    searchTerm: z.string().optional(),
});

