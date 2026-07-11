// modules/users/types.ts

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