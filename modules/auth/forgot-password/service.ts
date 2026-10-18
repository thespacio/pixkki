import type { ForgotPasswordDTO } from "./types";
import type { ForgotPasswordRepository } from "./repository";
import { ensureForgotPasswordAllowed } from "./authorization";

export class ForgotPasswordService {
    constructor(
        private readonly repository: ForgotPasswordRepository
    ) {}

    async forgotPassword(dto: ForgotPasswordDTO): Promise<void> {
        // No hay reglas de negocio adicionales
        // No verificamos si el usuario existe (previene user enumeration)
        // No hay autorización que aplicar

        ensureForgotPasswordAllowed();

        await this.repository.sendResetEmail(dto.email);
    }
}