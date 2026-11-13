// modules/use-cases/createShelterWithAdmin.ts

import { ShelterRepository } from '@/modules/shelters/repository';
import { UserRepository } from '@/modules/users/repository';
import { CreateUserInput } from '@/modules/users/types';
import { AuthService } from "@/modules/auth/service";
import { ShelterBusinessError } from "@/modules/shelters/errors";

import { randomBytes } from "node:crypto";
import { CreateShelterWithAdminInput, CreateShelterWithAdminOutput } from "@/modules/shelters/types";

/** Rol del administrador del refugio en la tabla `rol` (se resuelve por nombre). */
const ADMIN_ROLE_NAME = "Administrador";

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
            const adminEmail = input.shelter.correo_admin;

            // 1. Unicidad global del correo del administrador: una cuenta de
            //    acceso no puede pertenecer a dos refugios.
            const existingUser = await this.userRepository.findGlobalByEmail(adminEmail);
            if (existingUser) {
                throw new ShelterBusinessError(
                    `Ya existe una cuenta con el correo "${adminEmail}"`,
                    "DUPLICATE_EMAIL",
                    { correo: adminEmail },
                );
            }

            // 2. Rol por nombre (la base define "Administrador" = id 1).
            const adminRoleId = await this.authAdminService.getRoleIdByName(
                ADMIN_ROLE_NAME,
            );

            // 3. Crear usuario en Auth con contraseña temporal gestionada por
            //    Supabase. El primer acceso obliga a cambiarla.
            const temporaryPassword = generateTemporaryPassword();
            const authUser = await this.authAdminService.createAuthUser(
                adminEmail,
                temporaryPassword
            );
            authUserId = authUser.id;

            // 4. Crear refugio
            const shelter = await this.shelterRepository.create(input.shelter);
            shelterId = shelter.id;

            // 5. Crear usuario en BD
            const userData: CreateUserInput = {
                authUserId: authUser.id,
                nombreCompleto: input.shelter.nombre_admin,
                correo: adminEmail,
                rol: adminRoleId,
                idRefugio: shelter.id,
                activo: true,
            };
            const user = await this.userRepository.create(userData);
            userId = user.id;

            // 6. Marcar contraseña temporal y onboarding pendientes.
            await this.userRepository.setInitialAccessState(user.id, {
                requiresPasswordChange: true,
                requiresOnboarding: true,
            });

            // 7. Correo de bienvenida: Supabase gestiona el enlace para que el
            //    administrador establezca su contraseña definitiva.
            await this.authAdminService.sendPasswordReset(adminEmail);

            return {
                shelter: {
                    id: shelter.id,
                    nombre: shelter.nombre_albergue,
                },
                admin: {
                    id: user.id,
                    //authUserId: user.authUserId,
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
