// modules/users/user.service.ts

import {UserRepository} from './repository';
import {AuthAdminRepository} from '@/modules/auth/admin-repository';
import {User, UserQueryParams, GlobalUserItem, ROLE_NAME_TO_ID} from './types';
import {UserNotFoundError, EmailAlreadyInUseError} from './errors';
import {CreateStaffSchema, StaffRole} from './schemas';
import {CreateStaffDTO} from './dtos';

export class UserServiceError extends Error {
    constructor(
        message: string,
        public readonly code?: string,
        public readonly details?: unknown,
    ) {
        super(message);
        this.name = 'UserServiceError';
    }
}

export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly authAdminRepository: AuthAdminRepository,
    ) {}

    /**
     * Crea un miembro del personal (staff) en el refugio actual (F-USERS-01).
     * El `shelterId` llega en el DTO: lo inyecta la Action desde el contexto
     * autenticado, nunca desde el cliente.
     * La contraseña temporal se genera en el servidor (RF0.4 regla 6) y se
     * devuelve una única vez para que el administrador la comparta.
     */
    async createStaff(
        input: CreateStaffDTO,
    ): Promise<{ user: User; tempPassword: string; message: string }> {
        try {
            // 1. Validar la entrada con el esquema del formulario (Zod como
            //    fuente única de verdad; el shelterId del DTO no se valida aquí
            //    porque proviene del contexto servidor).
            const parsed = CreateStaffSchema.parse(input);

            // 2. Verificar unicidad global del correo (F-USERS-04).
            const existing = await this.userRepository.findGlobalByEmail(
                parsed.email,
            );
            if (existing) {
                throw new EmailAlreadyInUseError(parsed.email);
            }

            // 3. Mapear rol lógico a ID numérico.
            const roleId = this.resolveRoleId(parsed.role);

            // 4. Crear usuario en Supabase Auth con contraseña temporal.
            const tempPassword = this.generateTempPassword();
            const authUser = await this.authAdminRepository.createAuthUser(
                parsed.email,
                tempPassword,
            );

            // 5. Crear registro en tabla usuario (multitenant por idRefugio).
            const user = await this.userRepository.create({
                authUserId: authUser.id,
                nombreCompleto: parsed.fullName,
                correo: parsed.email,
                rol: roleId,
                idRefugio: input.shelterId,
                activo: true,
            });

            return {
                user,
                tempPassword,
                message: `Miembro "${parsed.fullName}" creado exitosamente`,
            };
        } catch (error) {
            if (
                error instanceof UserServiceError ||
                error instanceof EmailAlreadyInUseError
            ) {
                throw error;
            }
            throw new UserServiceError(
                `Error inesperado al crear miembro: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                'UNEXPECTED_ERROR',
                error,
            );
        }
    }

    /**
     * Obtiene el personal de un refugio.
     */
    async listStaff(shelterId: number): Promise<User[]> {
        try {
            return await this.userRepository.findByShelter(shelterId);
        } catch (error) {
            throw new UserServiceError(
                `Error inesperado al listar personal: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                'UNEXPECTED_ERROR',
                error,
            );
        }
    }

    /**
     * Obtiene todos los usuarios de la plataforma (superadmin, F-USERS-03)
     * con filtros y paginación.
     */
    async listGlobalUsers(
        params: UserQueryParams,
    ): Promise<{ data: GlobalUserItem[]; total: number }> {
        try {
            return await this.userRepository.findAllGlobal(params);
        } catch (error) {
            throw new UserServiceError(
                `Error inesperado al listar usuarios globales: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                'UNEXPECTED_ERROR',
                error,
            );
        }
    }

    /**
     * Obtiene un usuario por ID (filtrado por refugio).
     */
    async getStaffById(id: number, shelterId: number): Promise<User> {
        try {
            const user = await this.userRepository.findById(id, shelterId);
            if (!user) {
                throw new UserNotFoundError(id);
            }
            return user;
        } catch (error) {
            if (error instanceof UserServiceError || error instanceof UserNotFoundError) {
                throw error;
            }
            throw new UserServiceError(
                `Error inesperado al obtener miembro: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                'UNEXPECTED_ERROR',
                error,
            );
        }
    }

    /**
     * Actualiza el estado activo de un miembro del personal.
     */
    async toggleStaffStatus(id: number, shelterId: number, activo: boolean): Promise<User> {
        try {
            const user = await this.userRepository.findById(id, shelterId);
            if (!user) {
                throw new UserNotFoundError(id);
            }
            return await this.userRepository.updateStatus(id, activo);
        } catch (error) {
            if (error instanceof UserServiceError || error instanceof UserNotFoundError) {
                throw error;
            }
            throw new UserServiceError(
                `Error inesperado al actualizar estado: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                'UNEXPECTED_ERROR',
                error,
            );
        }
    }

    /**
     * Elimina un miembro del personal.
     */
    async deleteStaff(id: number, shelterId: number): Promise<void> {
        try {
            const user = await this.userRepository.findById(id, shelterId);
            if (!user) {
                throw new UserNotFoundError(id);
            }
            await this.userRepository.delete(id);
        } catch (error) {
            if (error instanceof UserServiceError || error instanceof UserNotFoundError) {
                throw error;
            }
            throw new UserServiceError(
                `Error inesperado al eliminar miembro: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                'UNEXPECTED_ERROR',
                error,
            );
        }
    }

    /**
     * Resuelve el rol lógico a su ID numérico en la tabla `rol`.
     */
    private resolveRoleId(role: StaffRole): number {
        const id = ROLE_NAME_TO_ID[role];
        if (id === undefined) {
            throw new UserServiceError(
                `Rol desconocido: ${role}`,
                'INVALID_ROLE',
            );
        }
        return id;
    }

    /**
     * Genera una contraseña temporal segura de 12 caracteres.
     * Se devuelve una única vez al usuario para que pueda iniciar sesión
     * y debe cambiarla inmediatamente (F-AUTH-03 / F-USERS-01).
     */
    private generateTempPassword(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        const array = new Uint32Array(12);
        crypto.getRandomValues(array);
        return Array.from(array, (n) => chars[n % chars.length]).join('');
    }
}
