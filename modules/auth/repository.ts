// modules/auth/repository.ts

import { Database } from "@/types/database";
import {UserRole} from "@/modules/auth/types";
import {SupabaseClient, type Factor} from "@supabase/supabase-js";
import {AuthApiError} from "@supabase/auth-js";
import {
    AuthError,
    InvalidCredentialsError,
    InvalidTotpCodeError,
    MfaChallengeExpiredError,
    MfaEnrollmentError,
    UnauthorizedError,
    UserNotFoundError,
} from "@/modules/auth/errors";

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

// Usuario de Auth ya consultado, por cliente de Supabase (clave débil: se libera
// sola cuando el cliente —uno por petición— deja de usarse).
const authUserByClient = new WeakMap<object, Promise<AuthUser>>();

export class AuthRepository {
    constructor(
        private readonly supabase: SupabaseClient
    ) {}

    /**
     * Obtiene el usuario autenticado de Supabase Auth
     */
    async getAuthUser(): Promise<AuthUser> {
        // `auth.getUser()` es una llamada de red a Supabase Auth. En una misma petición
        // se pedía varias veces (layout raíz, layout protegido, página...), así que se
        // memoriza por cliente: como el cliente del servidor es uno por petición
        // (ver createSupabaseServerClient), esto equivale a "una vez por petición".
        const key: object = this.supabase;
        const cached = authUserByClient.get(key);
        if (cached) return cached;

        const pending = this.fetchAuthUser();
        authUserByClient.set(key, pending);
        // Un fallo (sin sesión, token vencido) no se memoriza: se reintentará.
        pending.catch(() => authUserByClient.delete(key));
        return pending;
    }

    private async fetchAuthUser(): Promise<AuthUser> {
        const { data, error } = await this.supabase.auth.getUser();

        if (error || !data.user) {
            throw new UnauthorizedError();
        }

        return {
            id: data.user.id,
            email: data.user.email!,
            emailConfirmed: !!data.user.email_confirmed_at,
            createdAt: data.user.created_at!,
        };
    }

    /**
     * Inicia sesión con correo y contraseña (Supabase Auth).
     * Traduce los errores de la API a errores tipados del dominio.
     */
    async signInWithPassword(email: string, password: string): Promise<void> {
        const { error } = await this.supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            switch (error.status) {
                case 400:
                    throw new InvalidCredentialsError();
                case 422:
                    throw new AuthError(
                        "El correo electrónico no es válido",
                        422,
                        "INVALID_EMAIL"
                    );
                default:
                    throw new AuthError(
                        "Ocurrió un error al iniciar sesión",
                        error.status ?? 500
                    );
            }
        }
    }

    /**
     * Nivel de aseguramiento actual (aal1 = contraseña, aal2 = MFA verificada)
     */
    async getAuthenticatorAssuranceLevel() {
        const { data, error } = await this.supabase.auth.mfa.getAuthenticatorAssuranceLevel();

        if (error) {
            throw new AuthError(
                "No fue posible verificar el estado de la autenticación.",
                500
            );
        }

        return data;
    }

    /**
     * Lista los factores MFA de tipo TOTP del usuario autenticado
     */
    async listMfaFactors(): Promise<Factor[]> {
        const { data, error } = await this.supabase.auth.mfa.listFactors();

        if (error) {
            throw new AuthError(
                "No fue posible obtener los factores de autenticación.",
                500
            );
        }

        return data.totp;
    }

    /**
     * Crea un desafío MFA para el factor indicado y devuelve su ID
     */
    async createMfaChallenge(factorId: string): Promise<string> {
        const { data, error } = await this.supabase.auth.mfa.challenge({
            factorId,
        });

        if (error) {
            throw new AuthError(
                "No fue posible iniciar la verificación en dos pasos.",
                500
            );
        }

        return data.id;
    }

    /**
     * Verifica un desafío MFA con el código TOTP recibido.
     * Traduce los errores de la API a errores tipados del dominio.
     */
    async verifyMfaChallenge(
        factorId: string,
        challengeId: string,
        code: string
    ): Promise<void> {
        const { error } = await this.supabase.auth.mfa.verify({
            factorId,
            challengeId,
            code,
        });

        if (!error) {
            return;
        }

        if (error instanceof AuthApiError) {
            switch (error.message) {
                case "Invalid TOTP code entered":
                    throw new InvalidTotpCodeError();
                case "MFA challenge has expired":
                    throw new MfaChallengeExpiredError();
                default:
                    throw new MfaEnrollmentError(error.message);
            }
        }

        throw error;
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
            throw new UserNotFoundError();
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
            throw new UserNotFoundError();
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
        // Tras cerrar sesión el usuario memorizado deja de ser válido.
        authUserByClient.delete(this.supabase);
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
     * Actualizar la contraseña de un usuario
     */
    async updatePassword(password: string) {
        const { error } = await this.supabase.auth.updateUser({
            password,
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

    /**
     * F-SHELTER-03: el refugio del usuario debe estar activo para permitir el
     * acceso de su personal. El superadmin opera a nivel global y no está
     * sujeto a este bloqueo.
     */
    async isShelterActive(idRefugio: number): Promise<boolean> {
        const { data, error } = await this.supabase
            .from("refugio")
            .select("activo")
            .eq("id_refugio", idRefugio)
            .single();

        // No encontrado (PGRST116): el refugio no existe → no está activo.
        if (error?.code === "PGRST116") {
            return false;
        }

        if (error) {
            throw new AuthError(
                "No fue posible verificar el estado del refugio.",
                500
            );
        }

        if (!data) {
            return false;
        }

        return data.activo;
    }
}