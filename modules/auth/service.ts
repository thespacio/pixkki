import {AuthRepository, AuthUser} from './repository';
import {AuthenticatedUser, UserRole} from './types';
import {EmailNotVerifiedError, InactiveUserError} from './errors';
import {AuthAdminRepository} from "@/modules/auth/admin-repository";
import {ResetPasswordDTO} from "@/modules/auth/schemas";

export class AuthService {
    constructor(
        private readonly repository: AuthRepository,
        private readonly adminRepository: AuthAdminRepository
    ) {}

    /**
     * Obtener el usuario atuenticado de Supabase
     */
    async getAuthUser() : Promise <AuthUser>{
        // Obtener usuario de Auth de Supabase
        return await this.repository.getAuthUser();
    }
    /**
     * Obtiene el usuario actual autenticado
     */
    async getCurrentUser(): Promise<AuthenticatedUser> {
        // 1. Obtener usuario de auth
        const authUser = await this.getAuthUser();

        // 2. Obtener contexto del usuario
        const context = await this.repository.findUserContext(authUser.id);


        // 3. Validaciones de negocio
        if (!authUser.emailConfirmed) {
            throw new EmailNotVerifiedError();
        }

        if (!context.activo) {
            throw new InactiveUserError();
        }

        // 4. Obtener permisos del usuario
        const roleName = await this.repository.findRoleNameById(context.rol) as UserRole;
        const permissions = await this.repository.findPermissionsByRole(context.rol);

        // 6. Construir objeto de usuario autenticado
        return {
            id: context.idUsuario,
            shelterId: context.idRefugio,
            fullName: context.nombreCompleto,
            email: context.correo,
            role: roleName,
            permissions: permissions,
            active: context.activo,
            emailVerified: authUser.emailConfirmed,
            lastLogin: context.ultimoLogin ? context.ultimoLogin : null,
        };
    }
    /**
     * Crea un usuario autenticado
     */
    async createAuthUser(email: string, password: string): Promise<AuthUser> {
        return this.adminRepository.createAuthUser(email, password);
    }
    /**
     * Borra un usuario autenticado
     */
    async deleteUser(authUserId: string): Promise<void> {
        return this.adminRepository.deleteAuthUser(authUserId);
    }
    /**
     * Obtiene los permisos del usuario actual
     */
    async getPermissions(): Promise<string[]> {
        const user = await this.getCurrentUser();
        return user.permissions;
    }
    /**
     * Cierra sesión del usuario
     */
    async logout(): Promise<void> {
        await this.repository.signOut();
    }
    /**
     * Envía correo de recuperación de contraseña
     */
    async sendPasswordReset(email: string): Promise<void> {
        await this.adminRepository.sendPasswordReset(email);
    }
    /**
    * Resetar contraseña de un usuario
    */
    async resetPassword(dto: ResetPasswordDTO) {
        await this.repository.updatePassword(dto.password);
    }
    /**
    * Obtener usuario por ID de refugio
     **/
    async getUsersByShelterId(shelterId: number): Promise<AuthenticatedUser[]> {
        // Obtener los usuarios del refugio con rol = 1
        const users = await this.repository.findUsersByShelterId(shelterId);

        if (users.length === 0) {
            return [];
        }

        return Promise.all(
            users.map(async (user) => {
                // Obtener nombre del rol
                const roleName = await this.repository.findRoleNameById(user.rol) as UserRole;

                // Obtener permisos del rol
                const permissions = await this.repository.findPermissionsByRole(user.rol);

                return {
                    id: user.idUsuario,
                    shelterId: user.idRefugio,
                    fullName: user.nombreCompleto,
                    email: user.correo,
                    role: roleName,
                    permissions,
                    active: user.activo,
                    // No tenemos acceso al Auth de Supabase aquí
                    emailVerified: true, // o false, o eliminar este campo si no aplica
                    lastLogin: user.ultimoLogin ?? null,
                };
            })
        );
    }

}