import {AuthRepository, AuthUser} from './repository';
import {AuthenticatedUser, UserRole} from './types';
import {EmailNotVerifiedError, InactiveShelterError, InactiveUserError} from './errors';
import {AuthAdminRepository} from "@/modules/auth/admin-repository";
import {ResetPasswordDTO} from "@/modules/auth/schemas";
import {TERMINOS_VERSION} from "@/modules/auth/constants";
import {isSuperadminRole} from "@/modules/auth/authorization";

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

        // 4. Obtener rol, permisos y aceptación de términos. Son consultas
        //    independientes entre sí (solo dependen de context.rol / idUsuario).
        const [roleName, permissions, termsAccepted] = await Promise.all([
            this.repository.findRoleNameById(context.rol) as Promise<UserRole>,
            this.repository.findPermissionsByRole(context.rol),
            this.repository.hasAcceptedTerms(context.idUsuario, TERMINOS_VERSION),
        ]);

        // 5. F-SHELTER-03 / RF0.3: el refugio del usuario debe estar activo.
        //    El superadmin opera a nivel global y está exento.
        if (!isSuperadminRole(roleName) && context.idRefugio !== null) {
            const shelterActive = await this.repository.isShelterActive(context.idRefugio);
            if (!shelterActive) {
                throw new InactiveShelterError();
            }
        }

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
            requiresPasswordChange: context.debeCambiarPassword,
            requiresOnboarding: context.primerInicioSesion,
            termsAccepted,
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
     * Resuelve el ID numérico de un rol por su nombre (tabla `rol`).
     */
    async getRoleIdByName(roleName: string): Promise<number> {
        return this.repository.findRoleIdByName(roleName);
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
     * Cambio de contraseña del usuario autenticado (F-AUTH-03). Si la cuenta
     * venía con contraseña temporal, se marca como cambiada para no volver a
     * forzar el formulario en el siguiente inicio de sesión.
     */
    async changePassword(dto: ResetPasswordDTO): Promise<void> {
        await this.repository.updatePassword(dto.password);

        const authUser = await this.repository.getAuthUser();
        const context = await this.repository.findUserContext(authUser.id);

        if (context.debeCambiarPassword) {
            await this.repository.markPasswordChanged(context.idUsuario);
        }
    }

    /**
     * Registra la aceptación de los Términos y Condiciones (US27).
     */
    async acceptTerms(
        userId: number,
        shelterId: number | null,
        version = TERMINOS_VERSION,
    ): Promise<void> {
        await this.repository.saveTermsAcceptance(userId, shelterId, version);
    }

    /**
     * Marca el onboarding como completado (US30).
     */
    async completeOnboarding(userId: number): Promise<void> {
        await this.repository.completeOnboarding(userId);
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
                // Nombre del rol, permisos y aceptación de términos (en paralelo)
                const [roleName, permissions, termsAccepted] = await Promise.all([
                    this.repository.findRoleNameById(user.rol) as Promise<UserRole>,
                    this.repository.findPermissionsByRole(user.rol),
                    this.repository.hasAcceptedTerms(user.idUsuario, TERMINOS_VERSION),
                ]);

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
                    requiresPasswordChange: user.debeCambiarPassword,
                    requiresOnboarding: user.primerInicioSesion,
                    termsAccepted,
                };
            })
        );
    }

}