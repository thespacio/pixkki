import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import {TotpEnrollment, TotpFactor} from "@/modules/auth/types";
import {AuthApiError} from "@supabase/auth-js";
import {InvalidTotpCodeError, MfaChallengeExpiredError, MfaEnrollmentError} from "@/modules/auth/errors";


export async function enrollTOTP(): Promise<TotpEnrollment> {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Google Authenticator",
    });

    if (error) {
        throw error;
    }

    return {
        factorId: data.id,
        uri: data.totp.uri,
        secret: data.totp.secret,
    };
}

export async function listFactors(): Promise<TotpFactor[]> {
    const supabase = getSupabaseBrowserClient();

    const { data, error } =
        await supabase.auth.mfa.listFactors();

    if (error) {
        throw error;
    }

    return data.totp.map((factor) => ({
        factorId: factor.id,
        friendlyName: factor.friendly_name ?? "Google Authenticator",
        status: factor.status,
    }));
}

export async function challenge(
    factorId: string
) {
    const supabase =
        getSupabaseBrowserClient();

    const { data, error } =
        await supabase.auth.mfa.challenge({
            factorId,
        });

    if (error) {
        throw error;
    }

    return data.id;
}

export async function verify(
    factorId: string,
    challengeId: string,
    code: string
) {
    const supabase =
        getSupabaseBrowserClient();

    const { error } = await supabase.auth.mfa.verify({
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

export async function unenroll(
    factorId: string
) {
    const supabase =
        getSupabaseBrowserClient();

    const { error } =
        await supabase.auth.mfa.unenroll({
            factorId,
        });

    if (error) {
        throw error;
    }
}

export async function getAuthenticatorAssuranceLevel() {
    const supabase = getSupabaseBrowserClient();

    const { data, error } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (error) {
        throw error;
    }

    return data;
}