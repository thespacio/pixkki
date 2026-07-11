// modules/use-cases/createShelterWithAdmin.ts

import { ShelterRepository } from '@/modules/shelters/repository';
import { UserRepository } from '@/modules/users/repository';
import { CreateUserInput } from '@/modules/users/types';
import {AuthService} from "@/modules/auth/service";
import {CreateShelterWithAdminInput, CreateShelterWithAdminOutput} from "@/modules/shelters/schemas";
import {randomBytes} from "node:crypto";

function generateTemporaryPassword(): string {
    return randomBytes(16).toString("base64url");
}

export class CreateShelterWithAdminUseCase {
    constructor(
        private readonly authAdminService: AuthService,
        private readonly shelterRepository: ShelterRepository,
        private readonly userRepository: UserRepository
    ) {}

    async execute(input: CreateShelterWithAdminInput): Promise<CreateShelterWithAdminOutput> {
        let authUserId: string | null = null;
        let shelterId: number | null = null;
        let userId: number | null = null;

        try {
            // 1. Crear usuario en Auth
            const temporaryPassword = generateTemporaryPassword();
            const authUser = await this.authAdminService.createAuthUser(
                input.shelter.correo_contacto,
                temporaryPassword
            );
            authUserId = authUser.id;

            // 2. Crear refugio
            const shelter = await this.shelterRepository.create(input.shelter);
            shelterId = shelter.id;

            // 3. Crear usuario en BD
            const userData: CreateUserInput = {
                authUserId: authUser.id,
                nombreCompleto: input.shelter.nombre,
                correo: input.shelter.correo_contacto,
                rol: 1, //Admin
                idRefugio: shelter.id,
                activo: true,
            };
            const user = await this.userRepository.create(userData);
            userId = user.id;

            return {
                shelter: {
                    id: shelter.id,
                    nombre: shelter.nombre,
                },
                admin: {
                    id: user.id,
                    authUserId: user.authUserId,
                    email: user.correo,
                    nombreCompleto: user.nombreCompleto,
                },
            };

        } catch (error) {
            // Compensación (ROLLBACK)
            if (authUserId) {
                await this.authAdminService.deleteUser(authUserId);
            }
            if (shelterId) {
                await this.shelterRepository.delete(shelterId);
            }
            if (userId) {
                await this.userRepository.delete(userId);
            }

            throw error;
        }
    }
}