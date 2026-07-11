// modules/auth/service.ts

import {AuthRepository, AuthUser} from './repository';
import {AuthenticatedUser, UserRole} from './types';
import {
    AuthError,
    UnauthorizedError,
    EmailNotVerifiedError,
    InactiveUserError
} from './errors';

export class AuthService {
    constructor(private readonly repository: AuthRepository) {}

    /**
     * Obtiene el usuario actual autenticado
     */
    async getCurrentUser(): Promise<AuthenticatedUser> {
        // 1. Obtener usuario de Auth
        const authUser = await this.repository.getAuthUser();

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

        // 5. Actualizar último login (en background, sin bloquear)
        this.repository.updateLastLogin(context.idUsuario).catch(console.error);

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
        return this.repository.createAuthUser(email, password);
    }

    /**
     * Borra un usuario autenticado
     */
    async deleteUser(authUserId: string): Promise<void> {
        return this.repository.deleteAuthUser(authUserId);
    }

    /**
     * Refresca el usuario actual
     */
    async refreshCurrentUser(): Promise<AuthenticatedUser> {
        return this.getCurrentUser();
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
     * Verifica si el usuario tiene un permiso específico
     */
    async hasPermission(permission: string): Promise<boolean> {
        const user = await this.getCurrentUser();
        return user.permissions.includes(permission);
    }

    /**
     * Verifica si el usuario tiene alguno de los permisos especificados
     */
    async hasAnyPermission(permissions: string[]): Promise<boolean> {
        const user = await this.getCurrentUser();
        return permissions.some(p => user.permissions.includes(p));
    }

    /**
     * Verifica si el usuario tiene todos los permisos especificados
     */
    async hasAllPermissions(permissions: string[]): Promise<boolean> {
        const user = await this.getCurrentUser();
        return permissions.every(p => user.permissions.includes(p));
    }
}