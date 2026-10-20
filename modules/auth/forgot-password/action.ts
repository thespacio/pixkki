"use server";

import { ForgotPasswordSchema } from "./schemas";
import {createAuthService} from "@/modules/auth";


export async function forgotPasswordAction(formData: FormData) {
    const dto = ForgotPasswordSchema.parse({
        email: formData.get("email"),
    });

    const service = await createAuthService();

    await service.sendPasswordReset(dto);
}