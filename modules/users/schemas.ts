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

export const STAFF_ROLES = [
    "veterinarian",
    "operator",
    "coordinator",
    "evaluator",
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

/**
 * Alta de personal (F-USERS-01): la contraseña temporal se auto-genera
 * y se envía por correo; el formulario ya no la recibe.
 */
export const CreateStaffFormSchema = z.object({
    fullName: z.string().trim().min(3, "El nombre debe tener al menos 3 caracteres").max(120),
    email: z.string().trim().toLowerCase().email("Ingresa un email válido"),
    role: z.enum(STAFF_ROLES, { message: "Selecciona un rol válido" }),
});

export type CreateStaffFormInput = z.infer<typeof CreateStaffFormSchema>;

/**
 * Mapea la entrada del formulario (CreateStaffFormInput) a la entrada
 * de dominio (CreateUserInput), fijando idRefugio desde el contexto.
 */
export function mapCreateStaffFormToUserInput(
    input: CreateStaffFormInput,
    idRefugio: number,
): CreateUserInput {
    return {
        authUserId: '', // El authUserId se asigna en el Service (createAuthUser)
        nombreCompleto: input.fullName,
        correo: input.email,
        rol: ROLE_NAME_TO_ID[input.role],
        idRefugio,
        activo: true,
    };
}

/**
 * Filtros server-side del personal (F-USERS-02) y de la vista global (F-USERS-03).
 */
export const StaffQuerySchema = z.object({
    search: z.string().trim().max(100).optional(),
    role: z.enum(STAFF_ROLES).optional(),
    activo: z.boolean().optional(),
    refugioId: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(200).optional(),
    offset: z.number().int().min(0).optional(),
});

export type StaffQueryInput = z.infer<typeof StaffQuerySchema>;