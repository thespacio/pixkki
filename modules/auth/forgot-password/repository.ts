
import { UnableToSendResetEmailError } from "./errors";
import {createClient} from "@supabase/supabase-js";
import {getSupabaseBrowserClient} from "@/lib/supabase/browser-client";

export interface ForgotPasswordRepository {
    sendResetEmail(email: string): Promise<void>;
}

export class SupabaseForgotPasswordRepository
    implements ForgotPasswordRepository
{
    async sendResetEmail(email: string): Promise<void> {
        const supabase = await getSupabaseBrowserClient();

        const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`;

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo,
        });

        if (error) {
            throw new UnableToSendResetEmailError(error.message);
        }
    }
}