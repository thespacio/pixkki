
import { UnableToSendResetEmailError } from "./errors";
import {getSupabaseBrowserClient} from "@/lib/supabase/browser-client";

export interface ForgotPasswordRepository {
    sendResetEmail(email: string): Promise<void>;
}

export class SupabaseForgotPasswordRepository
    implements ForgotPasswordRepository
{
    async sendResetEmail(email: string): Promise<void> {
        const supabase = getSupabaseBrowserClient();

        const redirectTo = `${process.env.APP_URL}/reset-password`;

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo,
        });

        if (error) {
            throw new UnableToSendResetEmailError(error.message);
        }
    }
}