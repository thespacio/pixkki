// modules/shelters/authorization.ts

import { ShelterAuthorizationError } from './errors';
import {AuthenticatedUser} from "@/modules/auth/types";

/**
 * Contexto de autorización para operaciones de shelters
 */
export interface AuthorizationContext {
    userId: string;
    userRole: 'admin' | 'shelter_manager' | 'volunteer' | 'user';
    shelterId?: string; // Opcional, para operaciones específicas de un shelter
}

/**
 * Reglas de autorización para el dominio de shelters
 * Todas las funciones son puras, solo verifican reglas y lanzan errores si no se cumplen
 */
export class ShelterAuthorization {
    /**
     * Verifica si un usuario puede ver un refugio
     * Reglas:
     * - Todos los usuarios autenticados pueden ver refugios (público)
     * - Solo usuarios con rol 'admin' o 'shelter_manager' pueden ver todos los detalles
     */
    static ensureCanView(context: AuthenticatedUser): void {
        if (!context.id) {
            throw new ShelterAuthorizationError(
                'Usuario no autenticado para ver refugios',
                { userId: context.id }
            );
        }

        // Todos los usuarios autenticados pueden ver refugios
        // Los roles determinan qué detalles pueden ver (esto se maneja en el service)
        return;
    }

    /**
     * Verifica si un usuario puede crear un refugio
     * Reglas:
     * - Solo usuarios con rol 'admin' pueden crear refugios
     * - Los 'shelter_manager' no pueden crear nuevos refugios (solo administrar existentes)
     */
    static ensureCanCreate(context: AuthenticatedUser): void {
        if (!context.id) {
            throw new ShelterAuthorizationError(
                'Usuario no autenticado para crear refugio',
                { userId: context.id }
            );
        }

        const allowedRoles = ['Superadmin'];
        if (!allowedRoles.includes(context.role)) {
            throw new ShelterAuthorizationError(
                `Usuario con rol "${context.role}" no tiene permisos para crear refugios`,
                {
                    userId: context.id,
                    userRole: context.role,
                    requiredRoles: allowedRoles
                }
            );
        }
    }

    /**
     * Verifica si un usuario puede editar un refugio
     * Reglas:
     * - Usuarios con rol 'admin' pueden editar cualquier refugio
     * - Usuarios con rol 'shelter_manager' pueden editar solo los refugios que gestionan
     * - Otros roles no pueden editar
     */
    static ensureCanEdit(context: AuthorizationContext): void {
        if (!context.userId) {
            throw new ShelterAuthorizationError(
                'Usuario no autenticado para editar refugio',
                { userId: context.userId }
            );
        }

        if (!context.shelterId) {
            throw new ShelterAuthorizationError(
                'Se requiere ID de refugio para verificar permisos de edición',
                { userId: context.userId }
            );
        }

        const adminRoles = ['admin'];
        const managerRoles = ['admin', 'shelter_manager'];

        if (context.userRole === 'admin') {
            return; // Admin puede editar cualquier refugio
        }

        if (context.userRole === 'shelter_manager') {
            // Aquí debería verificarse que el shelter_manager tenga acceso a este shelter específico
            // Esta verificación se delega al service que tiene acceso al repository
            // La función solo verifica el rol, la verificación específica del shelter se hace en el service
            return;
        }

        throw new ShelterAuthorizationError(
            `Usuario con rol "${context.userRole}" no tiene permisos para editar refugios`,
            {
                userId: context.userId,
                userRole: context.userRole,
                shelterId: context.shelterId,
                requiredRoles: managerRoles
            }
        );
    }

    /**
     * Verifica si un usuario puede eliminar un refugio
     * Reglas:
     * - Solo usuarios con rol 'admin' pueden eliminar refugios
     * - Los 'shelter_manager' no pueden eliminar refugios
     */
    static ensureCanDelete(context: AuthorizationContext): void {
        if (!context.userId) {
            throw new ShelterAuthorizationError(
                'Usuario no autenticado para eliminar refugio',
                { userId: context.userId }
            );
        }

        if (!context.shelterId) {
            throw new ShelterAuthorizationError(
                'Se requiere ID de refugio para verificar permisos de eliminación',
                { userId: context.userId }
            );
        }

        const allowedRoles = ['admin'];
        if (!allowedRoles.includes(context.userRole)) {
            throw new ShelterAuthorizationError(
                `Usuario con rol "${context.userRole}" no tiene permisos para eliminar refugios`,
                {
                    userId: context.userId,
                    userRole: context.userRole,
                    shelterId: context.shelterId,
                    requiredRoles: allowedRoles
                }
            );
        }
    }

    /**
     * Verifica si un usuario puede gestionar animales en un refugio
     * Reglas:
     * - Usuarios con rol 'admin' pueden gestionar animales en cualquier refugio
     * - Usuarios con rol 'shelter_manager' pueden gestionar animales en sus refugios
     * - Voluntarios pueden gestionar animales solo con supervisión (se verifica en service)
     */
    static ensureCanManageAnimals(context: AuthorizationContext): void {
        if (!context.userId) {
            throw new ShelterAuthorizationError(
                'Usuario no autenticado para gestionar animales',
                { userId: context.userId }
            );
        }

        if (!context.shelterId) {
            throw new ShelterAuthorizationError(
                'Se requiere ID de refugio para verificar permisos de gestión de animales',
                { userId: context.userId }
            );
        }

        const allowedRoles = ['admin', 'shelter_manager'];
        if (!allowedRoles.includes(context.userRole)) {
            throw new ShelterAuthorizationError(
                `Usuario con rol "${context.userRole}" no tiene permisos para gestionar animales en refugios`,
                {
                    userId: context.userId,
                    userRole: context.userRole,
                    shelterId: context.shelterId,
                    requiredRoles: allowedRoles
                }
            );
        }
    }

    /**
     * Verifica si un usuario tiene permisos específicos para un shelter
     * Esta función se usa en el service para verificar permisos a nivel de shelter
     */
    static async verifyShelterAccess(
        context: AuthorizationContext,
        shelterId: string,
        checkShelterAccess: (userId: string, shelterId: string) => Promise<boolean>
    ): Promise<void> {
        if (!context.userId) {
            throw new ShelterAuthorizationError(
                'Usuario no autenticado',
                { userId: context.userId }
            );
        }

        // Admin tiene acceso a todos los shelters
        if (context.userRole === 'admin') {
            return;
        }

        // Para otros roles, verificar acceso específico
        if (context.userRole === 'shelter_manager') {
            const hasAccess = await checkShelterAccess(context.userId, shelterId);
            if (!hasAccess) {
                throw new ShelterAuthorizationError(
                    'Usuario no tiene acceso a este refugio',
                    {
                        userId: context.userId,
                        userRole: context.userRole,
                        shelterId
                    }
                );
            }
            return;
        }

        throw new ShelterAuthorizationError(
            `Usuario con rol "${context.userRole}" no tiene permisos para acceder a este refugio`,
            {
                userId: context.userId,
                userRole: context.userRole,
                shelterId
            }
        );
    }
}