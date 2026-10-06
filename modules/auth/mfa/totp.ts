// modules/auth/totp.ts
import { authRepository } from './repository';
import {UnauthorizedError} from "@/modules/auth/errors";

/**
 * Habilita TOTP (genera QR y secret)
 */
export async function enableTotp() {
    const user = await authRepository.getAuthUser();
    if (!user) throw new UnauthorizedError();

    const result = await authRepository.enrollTotpFactor();

    return {
        qrCode: result.totp?.qr_code,
        secret: result.totp?.secret,
        factorId: result.id
    };
}

/**
 * Verifica y activa TOTP
 */
export async function verifyTotp(factorId: string, code: string) {
    const user = await authRepository.getAuthUser();
    if (!user) throw new UnauthorizedError();

    return await authRepository.verifyTotpFactor(factorId, code);
}

/**
 * Deshabilita TOTP
 */
export async function disableTotp(factorId: string) {
    const user = await authRepository.getAuthUser();
    if (!user) throw new UnauthorizedError();

    return await authRepository.unenrollFactor(factorId);
}

/**
 * Lista factores TOTP
 */
export async function listFactors() {
    const user = await authRepository.getAuthUser();
    if (!user) throw new UnauthorizedError();

    const factors = await authRepository.listMfaFactors();
    return {
        totp: factors.totp,
        phone: factors.phone,
        all: factors.all
    };
}