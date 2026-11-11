import { NextRequest } from "next/server";

import { getCurrentUser } from "@/modules/auth";
import { createLoginService } from "@/modules/auth/factories/create-login-service";
import { loginSchema } from "@/modules/auth/schemas";
import { toAuthUserResponse } from "@/modules/auth/dtos/auth-user.dto";
import { apiSuccess, apiValidationError, handleApiError } from "@/lib/api/responses";
import { readJsonBody } from "@/lib/api/request";
import { rateLimit, RateLimitError } from "@/lib/rate-limit";

// RF0.5: rate limit del login por IP y por correo (ventana de 15 minutos).
// Limitación conocida: contador en memoria por instancia (ver lib/rate-limit.ts).
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_IP_LIMIT = 10;
const LOGIN_EMAIL_LIMIT = 5;

export async function POST(request: NextRequest) {
    try {
        // 1. Rate limit por IP (antes de tocar el cuerpo)
        const ip = clientIp(request);
        const ipLimit = rateLimit(`login:ip:${ip}`, {
            limit: LOGIN_IP_LIMIT,
            windowMs: LOGIN_WINDOW_MS,
        });

        if (!ipLimit.allowed) {
            throw new RateLimitError(ipLimit.retryAfterSeconds);
        }

        // 2. Frontera servidor: validación estructural (Zod)
        const parsed = loginSchema.safeParse(
            await readJsonBody(request)
        );

        if (!parsed.success) {
            return apiValidationError(parsed.error);
        }

        // 3. Rate limit por correo
        const emailLimit = rateLimit(`login:email:${parsed.data.email}`, {
            limit: LOGIN_EMAIL_LIMIT,
            windowMs: LOGIN_WINDOW_MS,
        });

        if (!emailLimit.allowed) {
            throw new RateLimitError(emailLimit.retryAfterSeconds);
        }

        // 4. Lógica de login (valida correo, contexto multitenant,
        //    estado del usuario y del refugio, y MFA)
        const service = await createLoginService();
        const result = await service.login(parsed.data);

        if (result.step === "mfa") {
            return apiSuccess({
                step: "mfa",
                factorId: result.factorId,
                challengeId: result.challengeId,
            });
        }

        // 5. Payload del usuario autenticado
        const user = await getCurrentUser();

        return apiSuccess({
            step: "success",
            user: toAuthUserResponse(user),
        });
    } catch (error) {
        return handleApiError(error);
    }
}

/** IP de origen (detrás de proxy/CDN); vacía en local. */
function clientIp(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-for");
    return forwarded?.split(",")[0]?.trim() || "unknown";
}
