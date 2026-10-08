// modules/shelters/schemas.ts

import { z } from 'zod';

// ===== ESQUEMAS BASE =====
// Validación de campos individuales para reutilización
export const ShelterIdSchema = z.coerce.number().int().positive()
export const ShelterNameSchema = z.string({
    error: "El nombre es obligatorio"
})
    .trim()
    .min(1, "El nombre es obligatorio")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras y espacios");
export const CitySchema = z.string({
    error: "La ciudad es obligatoria"
})
    .min(2, 'La ciudad debe tener al menos 2 caracteres')
    .max(50, 'La ciudad no puede exceder los 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "La ciudad solo puede contener letras y espacios");
export const StateSchema = z.string({
    error: "El Estado es obligatorio"
})
    .min(2, 'El estado debe tener al menos 2 caracteres')
    .max(50, 'El estado no puede exceder los 50 caracteres');
export const ContactEmailSchema = z.string({
    error: "El correo es obligatorio"
})
    .email('Debe ser un correo electrónico válido')
    .max(100, 'El correo no puede exceder los 100 caracteres');
export const PhoneSchema = z.string({
    error: "El número de teléfono es obligatorio"
})
    // El teléfono es opcional: acepta vacío (formularios) o null (persistencia)
    .regex(/^(\+?[0-9\s\-()]{10})?$/, 'Formato de teléfono inválido').nullable();

// ===== ESQUEMAS DE DIRECCIÓN (F-SHELTER-04) =====
export const StreetSchema = z.string({
    error: "La calle es obligatoria"
})
    .trim()
    .min(3, "La calle debe tener al menos 3 caracteres")
    .max(100, "La calle no puede exceder los 100 caracteres");
export const StreetNumberSchema = z.string({
    error: "El número es obligatorio"
})
    .trim()
    .min(1, "El número es obligatorio")
    .max(10, "El número no puede exceder los 10 caracteres")
    .regex(/^[0-9A-Za-z\s.\-]+$/, "El número solo puede contener letras, números, espacios, puntos o guiones");
export const ColoniaSchema = z.string({
    error: "La colonia es obligatoria"
})
    .trim()
    .min(2, "La colonia debe tener al menos 2 caracteres")
    .max(100, "La colonia no puede exceder los 100 caracteres");
export const PostalCodeSchema = z.string({
    error: "El código postal es obligatorio"
})
    .trim()
    .regex(/^\d{5}$/, "El código postal debe tener 5 dígitos");
// ===== ESQUEMAS DE DOMINIO =====
// Shelter completo (para respuestas de API)
export const ShelterFieldsSchema = z.object({
    nombre_albergue: ShelterNameSchema,
    ciudad: CitySchema,
    estado: StateSchema,
    correo_contacto: ContactEmailSchema,
    telefono: PhoneSchema,
    calle: StreetSchema.optional(),
    numero: StreetNumberSchema.optional(),
    colonia: ColoniaSchema.optional(),
    codigo_postal: PostalCodeSchema.optional(),
});
export const ShelterSchema = ShelterFieldsSchema.extend({
    id: ShelterIdSchema,
    fecha_registro: z.date(),
    activo: z.boolean().default(true),
    // En dominio/persistencia los campos de dirección pueden ser null (registros previos)
    calle: StreetSchema.nullable().optional(),
    numero: StreetNumberSchema.nullable().optional(),
    colonia: ColoniaSchema.nullable().optional(),
    codigo_postal: PostalCodeSchema.nullable().optional(),
});
// ===== ESQUEMAS DE INPUT =====
// Para creación de refugio
/*export const CreateShelterSchema = z.object({
    nombre_albergue: ShelterNameSchema,
    nombre_admin: ShelterNameSchema,
    ciudad: CitySchema,
    estado: StateSchema,
    correo_contacto: ContactEmailSchema,
    telefono: PhoneSchema
});*/
export const CreateShelterSchema = ShelterFieldsSchema.extend({
    // Obligatorios en altas nuevas (se refuerzan con refine más abajo);
    // el tipo del formulario compartido necesita campos opcionales.
    nombre_admin: ShelterNameSchema.optional(),
}).refine(
    // F-SHELTER-04: la dirección completa es obligatoria en altas nuevas
    (data) =>
        Boolean(data.calle && data.numero && data.colonia && data.codigo_postal),
    {
        message: "La dirección completa es obligatoria (calle, número, colonia y código postal)",
        path: ["calle"],
    }
).refine(
    // F-SHELTER-02: el nombre del administrador es obligatorio
    (data) => Boolean(data.nombre_admin),
    {
        message: "El nombre del administrador es obligatorio",
        path: ["nombre_admin"],
    }
);

/**
 * Envoltorio para la Server Action de creación (F-SHELTER-02).
 * Zod como fuente única de verdad del contrato de entrada.
 */
export const CreateShelterWithAdminSchema = z.object({
    shelter: CreateShelterSchema,
});
/*
export const CreateShelterSchema = ShelterSchema.extend({
});
* */
// Para actualización de refugio (todos los campos opcionales)
/*export const UpdateShelterSchema = z.object({
    nombre_albergue: ShelterNameSchema.optional(),
    ciudad: CitySchema.optional(),
    estado: StateSchema.optional(),
    correo_contacto: ContactEmailSchema.optional(),
    telefono: PhoneSchema.optional(),
    activo: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
    message: 'Debe proporcionar al menos un campo para actualizar'
});*/
export const UpdateShelterSchema = ShelterFieldsSchema;

// ===== ESQUEMAS DE FILTROS =====
// Para búsqueda y filtrado
export const ShelterFiltersSchema = z.object({
    ciudad: CitySchema.optional(),
    estado: StateSchema.optional(),
    activo: z.boolean().optional(),
    search: z.string().max(100).optional(),
    limit: z.number().int().positive().max(100).default(20),
    offset: z.number().int().min(0).default(0)
});
// ===== ESQUEMAS DE PARAMS =====
// Para parámetros de ruta
export const ShelterParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});
// ===== ESQUEMAS DE AUTORIZACIÓN =====
// Para operaciones de autorización
export const ShelterAuthorizationSchema = z.object({
    shelterId: ShelterIdSchema,
    userId: z.string().uuid('ID de usuario inválido'),
    action: z.enum(['view', 'edit', 'delete', 'manage_animals'])
});
// ===== ESQUEMAS DE RESPUESTA =====
// Para respuestas estandarizadas de API
export const ShelterResponseSchema = z.object({
    success: z.boolean(),
    data: ShelterSchema.optional(),
    error: z.object({
        code: z.string(),
        message: z.string()
    }).optional(),
    metadata: z.object({
        timestamp: z.string().datetime(),
        path: z.string().optional()
    }).optional()
});
// ===== ESQUEMAS DE LISTA =====
// Para respuestas de listado con paginación
export const ShelterListResponseSchema = z.object({
    data: z.array(ShelterSchema),
    pagination: z.object({
        total: z.number().int().nonnegative(),
        limit: z.number().int().positive(),
        offset: z.number().int().min(0),
        hasMore: z.boolean()
    })
});