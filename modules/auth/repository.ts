// modules/auth/repository.ts

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { Database } from "@/types/database";
import {getSupabaseBrowserClient} from "@/lib/supabase/browser-client";
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
    constructor(private readonly supabase = SupabaseClient) {}

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

    /**
     * Busca un usuario por auth_user_id
     */
    async findUserByAuthId(authUserId: string): Promise<UsuarioRow> {
        const { data, error } = await this.supabase
            .from("usuario")
            .select(`
                id_usuario,
                id_refugio,
                nombre_completo,
                fecha_creacion,
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

        return data;
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
     * Crea un usuario en Supabase Auth
     */
    async createAuthUser(email: string, password: string): Promise<AuthUser> {
        const { data, error } = await this.supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: false,
        });

        if (error) {
            throw new Error(`Error al crear usuario en Auth: ${error.message}`);
        }

        if (!data.user) {
            throw new Error('No se pudo crear el usuario en Auth');
        }

        return {
            id: data.user.id,
            email: data.user.email!,
            emailConfirmed: !!data.user.email_confirmed_at,
            createdAt: data.user.created_at!,
        };
    }

    /**
     * Elimina un usuario de Supabase Auth
     */
    async deleteAuthUser(userId: string): Promise<void> {
        const { error } = await this.supabase.auth.admin.deleteUser(userId);

        if (error) {
            throw new Error(`Error al eliminar usuario Auth: ${error.message}`);
        }
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
}