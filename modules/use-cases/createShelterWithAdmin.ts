// modules/use-cases/createShelterWithAdmin.ts

import { ShelterRepository } from '@/modules/shelters/repository';
import { ShelterService } from '@/modules/shelters/service';
import { UserRepository } from '@/modules/users/repository';
import { CreateUserInput } from '@/modules/users/types';
import {AuthService} from "@/modules/auth/service";

import {randomBytes} from "node:crypto";
import {
    CreateShelterWithAdminInput,
    CreateShelterWithAdminOutput
} from "@/modules/shelters/types";
import {AuthenticatedUser} from "@/modules/auth/types";
import {ShelterAuthorization} from "@/modules/shelters/authorization";

function generateTemporaryPassword(): string {
    // Contraseña aleatoria de alta entropía; Supabase Auth se encarga
    // de hashearla internamente (bcrypt) antes de persistirla.
    return randomBytes(16).toString("base64url");
}

export class CreateShelterWithAdminUseCase {
    constructor(
        private readonly authAdminService: AuthService,
        private readonly shelterService: ShelterService,
        private readonly shelterRepository: ShelterRepository,
        private readonly userRepository: UserRepository
    ) {}

    async execute(
        input: CreateShelterWithAdminInput,
        authContext: AuthenticatedUser
    ): Promise<CreateShelterWithAdminOutput> {
        let authUserId: string | null = null;
        let shelterId: number | null = null;
        let userId: number | null = null;

        try {
            // 0. Autorización (F-SHELTER-02): Solo superadmin — falla rápido
            //    antes de crear cualquier recurso.
            ShelterAuthorization.ensureCanCreate(authContext);

            // 1. Crear usuario en Auth (credenciales temporales)
            const temporaryPassword = generateTemporaryPassword();
            const authUser = await this.authAdminService.createAuthUser(
                input.shelter.correo_contacto,
                temporaryPassword
            );
            authUserId = authUser.id;

            // 2. Crear refugio pasando por el service (autorización,
            //    unicidad de nombre y validación de ubicación)
            const { shelter } = await this.shelterService.create(
                input.shelter,
                authContext
            );
            shelterId = shelter.id;

            // 3. Crear usuario administrador en BD
            // (nombre_admin está garantizado por el refine de Zod en la action)
            const userData: CreateUserInput = {
                authUserId: authUser.id,
                nombreCompleto: input.shelter.nombre_admin ?? "",
                correo: input.shelter.correo_contacto,
                rol: 1, //Admin
                idRefugio: shelter.id,
                activo: true,
            };
            const user = await this.userRepository.create(userData);
            userId = user.id;

            // 4. Enviar correo de bienvenida con enlace para establecer
            //    la contraseña temporal (F-SHELTER-02)
            await this.authAdminService.sendPasswordReset(input.shelter.correo_contacto);

            return {
                shelter: {
                    id: shelter.id,
                    nombre: shelter.nombre_albergue,
                },
                admin: {
                    id: user.id,
                    email: user.correo,
                    nombreCompleto: user.nombreCompleto,
                },
            };

        } catch (error) {
            // Compensación (ROLLBACK)
            if (userId) {
                await this.userRepository.delete(userId);
            }
            if (shelterId) {
                await this.shelterRepository.delete(shelterId);
            }
            if (authUserId) {
                await this.authAdminService.deleteUser(authUserId);
            }
            throw error;
        }
    }
}