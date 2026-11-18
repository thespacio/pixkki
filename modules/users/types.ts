// modules/users/animales.types.ts

import { z } from 'zod';
import {
    UserSchema,
    CreateUserSchema,
    UpdateUserSchema,
    UserFiltersSchema
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
 * DTO de solo lectura para la vista global de usuarios (F-USERS-03):
 * un usuario del dominio + el nombre del refugio al que pertenece.
 * No hay schema Zod: es un modelo de lectura derivado de `User`, no una
 * entrada validable.
 */
export type GlobalUserItem = User & {
    shelterNombre: string | null;
};

/**
 * Catálogo canónico de roles (RF00 / migración 20261112000000):
 * 1 Administrador, 2 Veterinario, 3 Superadmin.
 * No existen Operador, Coordinador ni Evaluador en la base de datos.
 */
export const ROLE_CATALOG = {
    administrador: { id: 1, label: "Administrador", color: "#43AE6D", bg: "#EBF7F1" },
    veterinario: { id: 2, label: "Veterinario", color: "#6B9FAE", bg: "#EAF3F6" },
    superadmin: { id: 3, label: "Superadmin", color: "#7A7670", bg: "#EDE9E1" },
} as const;

export type RoleName = keyof typeof ROLE_CATALOG;

export const ROLE_NAME_TO_ID: Record<RoleName, number> = {
    administrador: ROLE_CATALOG.administrador.id,
    veterinario: ROLE_CATALOG.veterinario.id,
    superadmin: ROLE_CATALOG.superadmin.id,
};

export const ROLE_ID_TO_NAME: Record<number, RoleName> = {
    [ROLE_CATALOG.administrador.id]: "administrador",
    [ROLE_CATALOG.veterinario.id]: "veterinario",
    [ROLE_CATALOG.superadmin.id]: "superadmin",
};

export const roleConfig: Record<
    RoleName,
    { label: string; color: string; bg: string }
> = {
    administrador: { label: ROLE_CATALOG.administrador.label, color: ROLE_CATALOG.administrador.color, bg: ROLE_CATALOG.administrador.bg },
    veterinario: { label: ROLE_CATALOG.veterinario.label, color: ROLE_CATALOG.veterinario.color, bg: ROLE_CATALOG.veterinario.bg },
    superadmin: { label: ROLE_CATALOG.superadmin.label, color: ROLE_CATALOG.superadmin.color, bg: ROLE_CATALOG.superadmin.bg },
};

/** Modelo de lectura de la vista `/staff`; `shelterNombre` solo para superadmin. */
export type StaffListItem = User & { shelterNombre?: string | null };