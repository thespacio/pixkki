import * as authClient from "../client";

import * as mfaClient from "../mfa/client";
import {LoginResult} from "@/modules/auth/types";


export async function login(
    email: string,
    password: string,
): Promise<LoginResult> {

    await authClient.login(
        email,
        password,
    );

    const aal =
        await mfaClient.getAuthenticatorAssuranceLevel();

    if (
        aal.nextLevel === "aal2"
    ) {

        const factors =
            await mfaClient.listFactors();

        const factor =
            factors.find(
                factor =>
                    factor.status === "verified"
            );

        if (!factor) {
            throw new Error(
                "No existe un factor MFA."
            );
        }

        const challengeId =
            await mfaClient.challenge(
                factor.factorId
            );

        return {
            step: "mfa",
            factorId: factor.factorId,
            challengeId,
        };

    }

    return {
        step: "success",
    };

}

export async function verifyMfa(
    factorId: string,
    challengeId: string,
    code: string,
): Promise<LoginResult> {

    await mfaClient.verify(

        factorId,

        challengeId,

        code,

    );

    return {

        step: "success",

    };

}