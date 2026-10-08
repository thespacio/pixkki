import { UserRepository } from './repository';
import { AuthAdminRepository } from '@/modules/auth/admin-repository';
import {
    User,
    UserNotFoundError,
    EmailAlreadyInUseError,
} from './types';
import {
    CreateStaffFormSchema,
    CreateStaffFormInput,
    CreateUserInput,
    mapCreateStaffFormToUserInput,
} from './schemas';
import { AuthenticatedUser } from '@/modules/auth/types';

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
     * Crea un miembro del personal (staff) en el refugio actual.
     * No recibe idRefugio del cliente: se inyecta desde el contexto autenticado.
     */
    async createStaff(
        input: CreateStaffFormInput,
        shelterId: number,
    ): Promise<{ user: User; tempPassword: string; message: string }> {
        try {
            // 0. Mapear la entrada del formulario a la entrada de dominio.
            const domainInput: CreateUserInput = mapCreateStaffFormToUserInput(
                parsed,
                shelterId,
            );

            // 1. Validar la entrada con el esquema de formulario.
            const parsed = CreateStaffFormSchema.parse(input);

            // 2. Verificar unicidad global del correo (F-USERS-04).
            const existing = await this.userRepository.findGlobalByEmail(
                parsed.email,
            );
            if (existing) {
                throw new EmailAlreadyInUseError(parsed.email);
            }

            // 3. Crear usuario en Supabase Auth con contraseña temporal.
            const authUser = await this.authAdminRepository.createAuthUser(
                parsed.email,
                this.generateTempPassword(),
            );

            // 4. Asignar el authUserId al input de dominio.
            domainInput.authUserId = authUser.id;

            // 3. Mapear rol lógico a ID numérico
             const roleId = this.resolveRoleId(parsed.role);

            // 3. Crear registro en tabla usuario
            const user = await this.userRepository.create({
                ...domainInput,
                rol: roleId,
            });

            return {
                user,
                tempPassword: this.generateTempPassword(),
                message: `Miembro "${parsed.fullName}" creado exitosamente`,
            };
        } catch (error) {
            if (error instanceof UserServiceError) {
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
            if (error instanceof UserServiceError) {
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
            if (error instanceof UserServiceError) {
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
            if (error instanceof UserServiceError) {
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
    private resolveRoleId(role: string): number {
        const roleMap: Record<string, number> = {
            veterinarian: 1,
            operator: 2,
            coordinator: 3,
            evaluator: 4,
        };
        const id = roleMap[role];
        if (id === undefined) {
            throw new UserServiceError(
                `Rol desconocido: ${role}`,
                'INVALID_ROLE',
            );
        }
        return id;
    }

    /**\n     * Genera una contraseña temporal segura de 12 caracteres.\n     * Se devuelve una única vez al usuario para que pueda iniciar sesión\n     * y debe cambiarla inmediatamente (F-AUTH-03 / F-USERS-01).\n     */\n    private generateTempPassword(): string {\n        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';\n        const array = new Uint32Array(12);\n        crypto.getRandomValues(array);\n        return Array.from(array, (n) => chars[n % chars.length]).join('');\n    }
}
