import {AuthUser} from "@/modules/auth/repository";
import {SupabaseClient} from "@supabase/supabase-js";

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