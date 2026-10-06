// modules/users/mapper.ts

import { User, UserRecord, CreateUserInput, UpdateUserInput } from './types';
import { UserRow, UserInsert, UserUpdate } from './repository';

/**
 * Mapea una fila de Supabase a una entidad de dominio
 */
export function mapUserRowToDomain(row: UserRow): User {
    return {
        id: row.id_usuario,
        authUserId: row.auth_user_id!,
        nombreCompleto: row.nombre_completo,
        correo: row.correo,
        rol: row.rol,
        idRefugio: row.id_refugio,
        activo: row.activo,
        fechaCreacion: new Date(row.fecha_creacion),
        ultimoLogin: row.ultimo_login ? new Date(row.ultimo_login) : null,
    };
}

/**
 * Mapea una entidad de dominio a UserRow
 */
export function mapUserDomainToRow(user: User): UserRow {
    return {
        id_usuario: user.id,
        auth_user_id: user.authUserId,
        nombre_completo: user.nombreCompleto,
        correo: user.correo,
        rol: user.rol,
        id_refugio: user.idRefugio,
        activo: user.activo,
        fecha_creacion: user.fechaCreacion.toISOString(),
        ultimo_login: user.ultimoLogin ? user.ultimoLogin.toISOString() : null,
    };
}

/**
 * Mapea una entidad de dominio a UserInsert
 */
export function mapUserDomainToInsert(
    data: Omit<User, 'id' | 'fechaCreacion' | 'ultimoLogin'>
): UserInsert {
    return {
        auth_user_id: data.authUserId,
        nombre_completo: data.nombreCompleto,
        correo: data.correo,
        rol: data.rol,
        id_refugio: data.idRefugio,
        activo: data.activo !== undefined ? data.activo : true,
        fecha_creacion: new Date().toISOString(),
    };
}

/**
 * Mapea datos de actualización a UserUpdate
 */
export function mapUserDomainToUpdate(
    updates: Partial<Omit<User, 'id' | 'fechaCreacion'>>
): UserUpdate {
    const result: UserUpdate = {};

    if (updates.authUserId !== undefined) {
        result.auth_user_id = updates.authUserId;
    }
    if (updates.nombreCompleto !== undefined) {
        result.nombre_completo = updates.nombreCompleto;
    }
    if (updates.correo !== undefined) {
        result.correo = updates.correo;
    }
    if (updates.rol !== undefined) {
        result.rol = updates.rol;
    }
    if (updates.idRefugio !== undefined) {
        result.id_refugio = updates.idRefugio;
    }
    if (updates.activo !== undefined) {
        result.activo = updates.activo;
    }
    if (updates.ultimoLogin !== undefined) {
        result.ultimo_login = updates.ultimoLogin ? updates.ultimoLogin.toISOString() : null;
    }

    return result;
}

/**
 * Mapea CreateUserInput a UserInsert
 */
export function mapCreateUserInputToInsert(input: CreateUserInput): UserInsert {
    return {
        auth_user_id: input.authUserId,
        nombre_completo: input.nombreCompleto,
        correo: input.correo,
        rol: input.rol,
        id_refugio: input.idRefugio,
        activo: input.activo !== undefined ? input.activo : true,
        fecha_creacion: new Date().toISOString(),
    };
}

/**
 * Mapea UpdateUserInput a UserUpdate
 */
export function mapUpdateUserInputToUpdate(input: UpdateUserInput): UserUpdate {
    const result: UserUpdate = {};

    if (input.nombreCompleto !== undefined) {
        result.nombre_completo = input.nombreCompleto;
    }
    if (input.correo !== undefined) {
        result.correo = input.correo;
    }
    if (input.rol !== undefined) {
        result.rol = input.rol;
    }
    if (input.idRefugio !== undefined) {
        result.id_refugio = input.idRefugio;
    }
    if (input.activo !== undefined) {
        result.activo = input.activo;
    }
    if (input.ultimoLogin !== undefined) {
        result.ultimo_login = input.ultimoLogin ? input.ultimoLogin.toISOString() : null;
    }

    return result;
}

/**
 * Mapea un User a UserRecord
 */
export function mapUserDomainToRecord(user: User): UserRecord {
    return {
        id_usuario: user.id,
        auth_user_id: user.authUserId,
        nombre_completo: user.nombreCompleto,
        correo: user.correo,
        rol: user.rol,
        id_refugio: user.idRefugio,
        activo: user.activo,
        fecha_creacion: user.fechaCreacion,
        ultimo_login: user.ultimoLogin,
    };
}

/**
 * Mapea un UserRecord a User
 */
export function mapUserRecordToDomain(record: UserRecord): User {
    return {
        id: record.id_usuario,
        authUserId: record.auth_user_id,
        nombreCompleto: record.nombre_completo,
        correo: record.correo,
        rol: record.rol,
        idRefugio: record.id_refugio,
        activo: record.activo,
        fechaCreacion: record.fecha_creacion,
        ultimoLogin: record.ultimo_login,
    };
}

/**
 * Mapea un array de UserRow a User[]
 */
export function mapUserRowsToDomain(rows: UserRow[]): User[] {
    return rows.map(mapUserRowToDomain);
}