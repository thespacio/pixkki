// modules/users/animales.types.ts

import { z } from 'zod';
import {
    UserSchema,
    CreateUserSchema,
    UpdateUserSchema,
    UserFiltersSchema, StaffRole
} from './schemas';

// ===== ENTIDADES DEL DOMINIO =====
export type User = z.infer<typeof UserSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type UserFilters = z.infer<typeof UserFiltersSchema>;

// ===== DTOs =====
export type UserListItem = Pick<
    User,
    'id' | 'nombreCompleto' | 'correo' | 'rol' | 'activo'
>;

export type UserDetails = User;

// ===== TIPOS COMPARTIDOS =====
export type UserRecord = {
    id_usuario: number;
    auth_user_id: string;
    nombre_completo: string;
    correo: string;
    rol: number;
    id_refugio: number;
    activo: boolean;
    fecha_creacion: Date;
    ultimo_login: Date | null;
};

export type UserQueryParams = {
    refugioId?: number;
    rol?: number;
    activo?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
};

export type UserCreationResult = {
    user: User;
    message: string;
};

/**
 * Mapa rol lógico -> id numérico en tabla `rol`.
 * Debe coincidir con los IDs reales de tu base de datos.
 */
export const ROLE_NAME_TO_ID: Record<StaffRole, number> = {
    veterinarian: 1,
    operator: 2,
    coordinator: 3,
    evaluator: 4,
};

export const ROLE_ID_TO_NAME: Record<number, StaffRole> = {
    1: "veterinarian",
    2: "operator",
    3: "coordinator",
    4: "evaluator",
};

export const roleConfig: Record<
    StaffRole,
    { label: string; color: string; bg: string }
> = {
    veterinarian: { label: "Veterinario", color: "#43AE6D", bg: "#EBF7F1" },
    operator: { label: "Operador", color: "#6B9FAE", bg: "#EAF3F6" },
    coordinator: { label: "Coordinador", color: "#E8A87C", bg: "#FDF2EA" },
    evaluator: { label: "Evaluador", color: "#7A7670", bg: "#EDE9E1" },
};

/**
 * Item de la vista global de usuarios (F-USERS-03): usuario + nombre de su refugio.
 */
export type GlobalUserItem = User & {
    shelterNombre: string | null;
};