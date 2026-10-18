// modules/use-cases/createShelterWithAdmin.ts

import { ShelterRepository } from '@/modules/shelters/repository';
import { UserRepository } from '@/modules/users/repository';
import { CreateUserInput } from '@/modules/users/types';
import {AuthService} from "@/modules/auth/service";
<<<<<<< HEAD
import {CreateShelterWithAdminInput, CreateShelterWithAdminOutput} from "@/modules/shelters/schemas";
import {randomBytes} from "node:crypto";
=======

import {randomBytes} from "node:crypto";
import {CreateShelterWithAdminInput, CreateShelterWithAdminOutput} from "@/modules/shelters/types";
>>>>>>> origin/main

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
<<<<<<< HEAD
                nombreCompleto: input.shelter.nombre,
=======
                nombreCompleto: input.shelter.nombre_admin,
>>>>>>> origin/main
                correo: input.shelter.correo_contacto,
                rol: 1, //Admin
                idRefugio: shelter.id,
                activo: true,
            };
            const user = await this.userRepository.create(userData);
            userId = user.id;

<<<<<<< HEAD
            return {
                shelter: {
                    id: shelter.id,
                    nombre: shelter.nombre,
                },
                admin: {
                    id: user.id,
                    authUserId: user.authUserId,
=======
            // Enviar correo de recuperación/confirmación
            await this.authAdminService.sendPasswordReset(input.shelter.correo_contacto);

            return {
                shelter: {
                    id: shelter.id,
                    nombre: shelter.nombre_albergue,
                },
                admin: {
                    id: user.id,
                    //authUserId: user.authUserId,
>>>>>>> origin/main
                    email: user.correo,
                    nombreCompleto: user.nombreCompleto,
                },
            };

        } catch (error) {
            // Compensación (ROLLBACK)
<<<<<<< HEAD
            if (authUserId) {
                await this.authAdminService.deleteUser(authUserId);
=======
            if (userId) {
                await this.userRepository.delete(userId);
>>>>>>> origin/main
            }
            if (shelterId) {
                await this.shelterRepository.delete(shelterId);
            }
<<<<<<< HEAD
            if (userId) {
                await this.userRepository.delete(userId);
            }

=======
            if (authUserId) {
                await this.authAdminService.deleteUser(authUserId);
            }
>>>>>>> origin/main
            throw error;
        }
    }
}