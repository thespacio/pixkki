// modules/auth/repository.ts

import {Database} from "@/types/database";
import {UserRole} from "@/modules/auth/types";
import {SupabaseClient} from "@supabase/supabase-js";

export type UsuarioRow = Database["public"]["Tables"]["usuario"]["Row"];
export type UsuarioInsert = Database["public"]["Tables"]["usuario"]["Insert"];
export type UsuarioUpdate = Database["public"]["Tables"]["usuario"]["Update"];
export type RolRow = Database["public"]["Tables"]["rol"]["Row"];
export type PermissionRow = {
    permiso: {
        nombre_permiso: string;
    };
};

export interface AuthUser {
    id: string;
    email: string;
    emailConfirmed: boolean;
    createdAt: string;
    metadata: Record<string, unknown>;
}

export interface UserContext {
    idUsuario: number;
    idRefugio: number;
    nombreCompleto: string;
    correo: string;
    rol: number;
    activo: boolean;
    ultimoLogin: string | null;
    authUserId: string | null;
}

export class AuthRepository {
    constructor(
        private readonly supabase: SupabaseClient
    ) {}

    /**
     * Obtiene el usuario autenticado de Supabase Auth
     */
    async getAuthUser(): Promise<AuthUser> {
        const { data, error } = await this.supabase.auth.getUser();

        if (error || !data.user) {
            throw new Error('Usuario no autenticado');
        }

        return {
            id: data.user.id,
            email: data.user.email!,
            emailConfirmed: !!data.user.email_confirmed_at,
            createdAt: data.user.created_at!,
            metadata: data.user.user_metadata ?? {},
        };
    }

    /**
     * Busca el contexto de un usuario por auth_user_id
     */
    async findUserContext(authUserId: string): Promise<UserContext> {
        const { data, error } = await this.supabase
            .from("usuario")
            .select(`
                id_usuario,
                id_refugio,
                nombre_completo,
                correo,
                activo,
                ultimo_login,
                rol,
                auth_user_id
            `)
            .eq("auth_user_id", authUserId)
            .single();

        if (error || !data) {
            throw new Error('Usuario no encontrado');
        }

        return {
            idUsuario: data.id_usuario,
            idRefugio: data.id_refugio,
            nombreCompleto: data.nombre_completo,
            correo: data.correo,
            rol: data.rol,
            activo: data.activo,
            ultimoLogin: data.ultimo_login,
            authUserId: data.auth_user_id,
        };
    }

    async findUserContextById(userId: number): Promise<UserContext> {
        const { data, error } = await this.supabase
            .from("usuario")
            .select(`
            id_usuario,
            id_refugio,
            nombre_completo,
            correo,
            activo,
            ultimo_login,
            rol,
            auth_user_id
        `)
            .eq("id_usuario", userId)
            .single();

        if (error || !data) {
            throw new Error('Usuario no encontrado');
        }

        return {
            idUsuario: data.id_usuario,
            idRefugio: data.id_refugio,
            nombreCompleto: data.nombre_completo,
            correo: data.correo,
            rol: data.rol,
            activo: data.activo,
            ultimoLogin: data.ultimo_login,
            authUserId: data.auth_user_id,
        };
    }

    /**
     * Busca el nombre de un rol por ID
     */
    async findRoleNameById(roleId: number): Promise<UserRole> {
        const { data, error } = await this.supabase
            .from("rol")
            .select("nombre_rol")
            .eq("id_rol", roleId)
            .single();

        if (error) {
            throw new Error(`Error al buscar rol: ${error.message}`);
        }

        return data.nombre_rol as UserRole;
    }

    /**
     * Busca los permisos de un rol
     */
    async findPermissionsByRole(roleId: number): Promise<string[]> {
        const { data, error } = await this.supabase
            .from("rol_permiso")
            .select(`
                permiso:id_permiso(
                    nombre_permiso
                )
            `)
            .eq("id_rol", roleId)
            .returns<PermissionRow[]>();

        if (error) {
            throw new Error(`Error al buscar permisos: ${error.message}`);
        }

        return data.map((permission) => permission.permiso.nombre_permiso);
    }

    /**
     * Actualiza el último login de un usuario
     */
    async updateLastLogin(idUsuario: number): Promise<void> {
        const { error } = await this.supabase
            .from("usuario")
            .update({
                ultimo_login: new Date().toISOString(),
            })
            .eq("id_usuario", idUsuario);

        if (error) {
            throw new Error(`Error al actualizar último login: ${error.message}`);
        }
    }

    /**
     * Cierra sesión del usuario
     */
    async signOut(): Promise<void> {
        const { error } = await this.supabase.auth.signOut();

        if (error) {
            throw new Error(`Error al cerrar sesión: ${error.message}`);
        }
    }

    /**
     * Verifica si un usuario está activo
     */
    async isUserActive(authUserId: string): Promise<boolean> {
        const { data, error } = await this.supabase
            .from("usuario")
            .select("activo")
            .eq("auth_user_id", authUserId)
            .single();

        if (error) {
            throw new Error(`Error al verificar estado del usuario: ${error.message}`);
        }

        return data?.activo ?? false;
    }

    /**
     * Verifica si un refugio está activo (F-SHELTER-03).
     * Un refugio inactivo bloquea el login de sus usuarios.
     * Nota: lectura puntual del dominio de shelters desde el repositorio
     * de auth para mantener el flujo de login en una sola consulta de contexto.
     */
    async isShelterActive(shelterId: number): Promise<boolean> {
        const { data, error } = await this.supabase
            .from("refugio")
            .select("activo")
            .eq("id_refugio", shelterId)
            .single();

        if (error || !data) {
            throw new Error("El refugio asociado a la cuenta no existe.");
        }

        return data.activo;
    }

    /**
     * Actualizar la contraseña de un usuario.
     * Permite actualizar banderas de `user_metadata` en la misma operación
     * (ej. limpiar `password_change_required` tras el cambio — F-AUTH-03).
     */
    async updatePassword(
        password: string,
        metadata?: Record<string, unknown>
    ): Promise<void> {
        const { error } = await this.supabase.auth.updateUser({
            password,
            ...(metadata ? { data: metadata } : {}),
        });

        if (error) {
            throw error;
        }
    }

    /**
     * Actualiza banderas del usuario en `user_metadata`
     * (F-AUTH-03 / F-AUTH-05).
     */
    async updateUserMetadata(
        metadata: Record<string, unknown>
    ): Promise<void> {
        const { error } = await this.supabase.auth.updateUser({
            data: metadata,
        });

        if (error) {
            throw error;
        }
    }

    /**
     * Buscar usuarios por ID de refugio con rol = 1
     */
    async findUsersByShelterId(shelterId: number): Promise<UserContext[]> {
        const { data, error } = await this.supabase
            .from("usuario")
            .select(`
            id_usuario,
            id_refugio,
            nombre_completo,
            correo,
            activo,
            ultimo_login,
            rol,
            auth_user_id
        `)
            .eq("id_refugio", shelterId)
            .eq("rol", 1);

        if (error) {
            throw new Error(error.message);
        }

        return (data ?? []).map(user => ({
            idUsuario: user.id_usuario,
            idRefugio: user.id_refugio,
            nombreCompleto: user.nombre_completo,
            correo: user.correo,
            rol: user.rol,
            activo: user.activo,
            ultimoLogin: user.ultimo_login,
            authUserId: user.auth_user_id,
        }));
    }
}