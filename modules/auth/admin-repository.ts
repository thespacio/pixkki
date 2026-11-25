import {AuthUser} from "@/modules/auth/repository";
import {AuthEmailAlreadyInUseError} from "@/modules/auth/errors";
import {SupabaseClient, type User as SupabaseUser} from "@supabase/supabase-js";

function toAuthUser(user: SupabaseUser): AuthUser {
    return {
        id: user.id,
        email: user.email!,
        emailConfirmed: !!user.email_confirmed_at,
        createdAt: user.created_at!,
    };
}

export class AuthAdminRepository {
    constructor(
        private readonly supabase: SupabaseClient
    ) {}

    /**
     * Crea un usuario en Supabase Auth
     */
    async createAuthUser(email: string, password: string): Promise<AuthUser> {
        const { data, error } = await this.supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        });
        if (error) {
            if (
                error.code === "email_exists" ||
                error.code === "user_already_exists" ||
                error.message.includes("already been registered")
            ) {
                throw new AuthEmailAlreadyInUseError(email);
            }
            throw new Error(`Error al crear usuario en Auth: ${error.message}`);
        }
        if (!data.user) {
            throw new Error('No se pudo crear el usuario en Auth');
        }
        return toAuthUser(data.user);
    }

    /**
     * Busca un usuario por correo en Supabase Auth. El SDK no expone un
     * `getUserByEmail`, así que se recorren las páginas del listado admin.
     */
    async findAuthUserByEmail(email: string): Promise<AuthUser | null> {
        const normalizedEmail = email.trim().toLowerCase();
        let page = 1;

        while (true) {
            const { data, error } = await this.supabase.auth.admin.listUsers({
                page,
                perPage: 1000,
            });
            if (error) {
                throw new Error(`Error al buscar usuario en Auth: ${error.message}`);
            }

            const match = data.users.find(
                (user) => user.email?.toLowerCase() === normalizedEmail
            );
            if (match) {
                return toAuthUser(match);
            }

            if (page >= data.lastPage || data.users.length === 0) {
                return null;
            }
            page += 1;
        }
    }

    /**
     * Reasigna la contraseña de una cuenta Auth huérfana para poder
     * reaprovecharla sin perder el alta del personal.
     */
    async updateAuthUserPassword(userId: string, password: string): Promise<AuthUser> {
        const { data, error } = await this.supabase.auth.admin.updateUserById(userId, {
            password,
            email_confirm: true,
        });
        if (error) {
            throw new Error(`Error al actualizar contraseña en Auth: ${error.message}`);
        }
        if (!data.user) {
            throw new Error('No se pudo actualizar el usuario en Auth');
        }
        return toAuthUser(data.user);
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
     * Envía un correo de invitación personalizado
     */
    async sendInvitationEmail(email: string): Promise<void> {
        try {
            // Opción 1: Usar el método de Supabase para reenviar confirmación
            const { error } = await this.supabase.auth.resend({
                type: 'signup',
                email: email,
            });

            if (error) {
                throw new Error(`Error al enviar invitación: ${error.message}`);
            }
        } catch (error) {
            console.error('Error enviando invitación:', error);
            // No lanzamos error para no bloquear el flujo principal
        }
    }

    /**
     * Reenvía correo de confirmación
     */
    async resendConfirmationEmail(email: string): Promise<void> {
        const { error } = await this.supabase.auth.resend({
            type: 'signup',
            email: email,
        });

        if (error) {
            throw new Error(`Error al reenviar confirmación: ${error.message}`);
        }
    }

    /**
     * Envía correo de recuperación de contraseña
     */
    async sendPasswordReset(email: string): Promise<void> {
        const redirectTo = `${process.env.APP_URL}/reset-password`;

        const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
            redirectTo
        });

        if (error) {
            throw new Error(`Error al enviar recuperación: ${error.message}`);
        }
    }

    /*Futuro...
    *
    * updateAuthEmail
    * resetPassword
    * inviteUser
    * disableUser
    * enableUser
    *
    * */

}