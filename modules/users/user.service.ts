// modules/users/user.service.ts

import {UserRepository} from './repository';
import {AuthAdminRepository} from '@/modules/auth/admin-repository';
import {AuthEmailAlreadyInUseError} from '@/modules/auth/errors';
import type {AuthUser} from '@/modules/auth/repository';
import {User, UserQueryParams, GlobalUserItem, ROLE_NAME_TO_ID, StaffListItem} from './types';
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
     * La contraseña temporal la define el administrador en el formulario, se
     * valida con Zod y se envía tal cual a Supabase Auth.
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

            // 4. Crear usuario en Supabase Auth con contraseña temporal. Si el
            //    correo quedó huérfano en Auth tras un borrado, se reaprovecha
            //    la cuenta existente sin tocar la de otro usuario.
            const tempPassword = parsed.password;
            const authUser = await this.createOrReuseAuthUser(
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
     * Obtiene el personal de un refugio. Con `shelterId = null` (superadmin)
     * devuelve el personal de todos los refugios con el nombre del refugio.
     */
    async listStaff(shelterId: number | null): Promise<StaffListItem[]> {
        try {
            if (shelterId === null) {
                const result = await this.userRepository.findAllGlobal({ limit: 100 });
                return result.data;
            }
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
    async getStaffById(id: number, shelterId: number | null): Promise<User> {
        try {
            const user = shelterId === null
                ? await this.userRepository.findByIdGlobal(id)
                : await this.userRepository.findById(id, shelterId);
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
     * Con `shelterId = null` el superadmin opera con alcance global.
     */
    async toggleStaffStatus(id: number, shelterId: number | null, activo: boolean): Promise<User> {
        try {
            const user = shelterId === null
                ? await this.userRepository.findByIdGlobal(id)
                : await this.userRepository.findById(id, shelterId);
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
    async deleteStaff(id: number, shelterId: number | null): Promise<void> {
        try {
            const user = shelterId === null
                ? await this.userRepository.findByIdGlobal(id)
                : await this.userRepository.findById(id, shelterId);
            if (!user) {
                throw new UserNotFoundError(id);
            }
            await this.userRepository.delete(id);

            // La FK usuario.auth_user_id -> auth.users.id no tiene ON DELETE
            // CASCADE: primero se borra la fila y luego la cuenta Auth. Si este
            // segundo paso falla, la baja ya quedó aplicada y solo se registra
            // el motivo (sin exponer stack traces al cliente).
            try {
                await this.authAdminRepository.deleteAuthUser(user.authUserId);
            } catch (error) {
                console.error(
                    `[user.service] No se pudo eliminar la cuenta Auth del miembro ${id}:`,
                    error instanceof Error ? error.message : "Unknown error",
                );
            }
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
     * Crea la cuenta Auth o, si el correo ya existe allí pero no tiene fila en
     * `usuario`, recupera esa cuenta huérfana y le asigna la contraseña nueva.
     */
    private async createOrReuseAuthUser(
        email: string,
        password: string,
    ): Promise<AuthUser> {
        try {
            return await this.authAdminRepository.createAuthUser(email, password);
        } catch (error) {
            if (!(error instanceof AuthEmailAlreadyInUseError)) {
                throw error;
            }

            const orphan = await this.authAdminRepository.findAuthUserByEmail(email);
            if (!orphan) {
                throw error;
            }

            const owner = await this.userRepository.findByAuthUserId(orphan.id);
            if (owner) {
                throw new EmailAlreadyInUseError(email);
            }

            return await this.authAdminRepository.updateAuthUserPassword(
                orphan.id,
                password,
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
}
