// modules/shelters/schemas.ts

import { z } from 'zod';
import {CreateShelterInput} from "@/modules/shelters/types";

// ===== ESQUEMAS BASE =====
// Validación de campos individuales para reutilización
export const ShelterIdSchema = z.coerce.number().int().positive()

export const ShelterNameSchema = z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder los 100 caracteres')
    .regex(/^[a-zA-ZáéíóúñÑ\s]+$/, 'El nombre solo puede contener letras y espacios');

export const CitySchema = z.string()
    .min(2, 'La ciudad debe tener al menos 2 caracteres')
    .max(50, 'La ciudad no puede exceder los 50 caracteres');

export const StateSchema = z.string()
    .min(2, 'El estado debe tener al menos 2 caracteres')
    .max(50, 'El estado no puede exceder los 50 caracteres');

export const ContactEmailSchema = z.string()
    .email('Debe ser un correo electrónico válido')
    .max(100, 'El correo no puede exceder los 100 caracteres');

export const PhoneSchema = z.string()
    .regex(/^\+?[0-9\s\-()]{10,15}$/, 'Formato de teléfono inválido').nullable();

// ===== ESQUEMAS DE DOMINIO =====
// Shelter completo (para respuestas de API)
export const ShelterSchema = z.object({
    id: ShelterIdSchema,
    nombre: ShelterNameSchema,
    ciudad: CitySchema,
    estado: StateSchema,
    correo_contacto: ContactEmailSchema,
    telefono: PhoneSchema,
    fecha_registro: z.date(),
    activo: z.boolean().default(true)
});

// ===== ESQUEMAS DE INPUT =====
// Para creación de refugio
export const CreateShelterSchema = z.object({
    nombre: ShelterNameSchema,
    ciudad: CitySchema,
    estado: StateSchema,
    correo_contacto: ContactEmailSchema,
    telefono: PhoneSchema
});

// Para actualización de refugio (todos los campos opcionales)
export const UpdateShelterSchema = z.object({
    nombre: ShelterNameSchema.optional(),
    ciudad: CitySchema.optional(),
    estado: StateSchema.optional(),
    correo_contacto: ContactEmailSchema.optional(),
    telefono: PhoneSchema.optional(),
    activo: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
    message: 'Debe proporcionar al menos un campo para actualizar'
});

export interface CreateShelterWithAdminInput {
    shelter: CreateShelterInput;
}

export interface CreateShelterWithAdminOutput {
    shelter: {
        id: number;
        nombre: string;
    };
    admin: {
        id: number;
        authUserId: string;
        email: string;
        nombreCompleto: string;
    };
}


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