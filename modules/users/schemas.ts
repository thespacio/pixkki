// modules/users/schemas.ts

import { z } from 'zod';

// ===== ESQUEMAS BASE =====
export const UserIdSchema = z.number().int().positive();
export const AuthUserIdSchema = z.string().uuid();
export const UserNameSchema = z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder los 100 caracteres');
export const UserEmailSchema = z.string()
    .email('Debe ser un correo electrónico válido')
    .max(100, 'El correo no puede exceder los 100 caracteres');
export const UserRoleSchema = z.number().int().min(0).max(10);
export const ShelterIdSchema = z.number().int().positive();

// ===== ESQUEMAS DE DOMINIO =====
export const UserSchema = z.object({
    id: UserIdSchema,
    authUserId: AuthUserIdSchema,
    nombreCompleto: UserNameSchema,
    correo: UserEmailSchema,
    rol: UserRoleSchema,
    idRefugio: ShelterIdSchema,
    activo: z.boolean().default(true),
    fechaCreacion: z.date(),
    ultimoLogin: z.date().nullable(),
});

// ===== ESQUEMAS DE INPUT =====
export const CreateUserSchema = z.object({
    authUserId: AuthUserIdSchema,
    nombreCompleto: UserNameSchema,
    correo: UserEmailSchema,
    rol: UserRoleSchema,
    idRefugio: ShelterIdSchema,
    activo: z.boolean().default(true),
});

export const UpdateUserSchema = z.object({
    nombreCompleto: UserNameSchema.optional(),
    correo: UserEmailSchema.optional(),
    rol: UserRoleSchema.optional(),
    idRefugio: ShelterIdSchema.optional(),
    activo: z.boolean().optional(),
    ultimoLogin: z.date().nullable().optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: 'Debe proporcionar al menos un campo para actualizar'
});

// ===== ESQUEMAS DE FILTROS =====
export const UserFiltersSchema = z.object({
    refugioId: ShelterIdSchema.optional(),
    rol: UserRoleSchema.optional(),
    activo: z.boolean().optional(),
    search: z.string().max(100).optional(),
    limit: z.number().int().positive().max(100).default(20),
    offset: z.number().int().min(0).default(0)
});

// ===== ESQUEMAS DE PARAMS =====
export const UserParamsSchema = z.object({
    userId: UserIdSchema
});