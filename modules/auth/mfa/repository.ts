import {getSupabaseBrowserClient} from "@/lib/supabase/browser-client";


export const authRepository = {
    /**
     * Obtiene el usuario autenticado de Supabase
     */
    async getAuthUser() {
        const supabase = getSupabaseBrowserClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    },

    /**
     * Obtiene la sesión actual
     */
    async getSession() {
        const supabase = getSupabaseBrowserClient();
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
    },

    /**
     * Lista factores MFA del usuario
     */
    async listMfaFactors() {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (error) throw error;
        return data;
    },

    /**
     * Enrolla un nuevo factor TOTP
     */
    async enrollTotpFactor(friendlyName: string = 'Google Authenticator') {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase.auth.mfa.enroll({
            factorType: 'totp',
            friendlyName
        });
        if (error) throw error;
        return data;
    },

    /**
     * Verifica y activa un factor TOTP
     */
    async verifyTotpFactor(factorId: string, code: string) {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase.auth.mfa.challengeAndVerify({
            factorId,
            code
        });
        if (error) throw error;
        return data;
    },

    /**
     * Deshabilita un factor TOTP
     */
    async unenrollFactor(factorId: string) {
        const supabase = getSupabaseBrowserClient();
        const {error} = await supabase.auth.mfa.unenroll({factorId});
        if (error) throw error;
        return {success: true};
    }
}