import {AuthRepository, AuthUser} from './repository';
import {AuthenticatedUser, LoginRequirements, UserRole} from './types';
import {
    EmailNotVerifiedError,
    InactiveShelterError,
    InactiveUserError,
} from './errors';
import {isSuperadminRole} from './authorization';
import {AuthAdminRepository} from "@/modules/auth/admin-repository";
import {
    AuthUserMetadataDTO,
    ChangePasswordDTO,
    ResetPasswordDTO,
    authUserMetadataSchema,
} from "@/modules/auth/schemas";
import {TERMINOS_VERSION} from "@/modules/auth/constants";

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

        // 4. Obtener rol y permisos del usuario
        const roleName = await this.repository.findRoleNameById(context.rol);
        const permissions = await this.repository.findPermissionsByRole(context.rol);

        // F-SHELTER-03: un refugio desactivado bloquea el acceso.
        // Exención: el superadmin nunca se bloquea por estado de refugio.
        if (!isSuperadminRole(roleName)) {
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
    * Resetar contraseña de un usuario (flujo de recuperación — F-AUTH-02).
    * Al establecer una contraseña propia se limpia la bandera de
    * cambio obligatorio (F-AUTH-03).
    */
    async resetPassword(dto: ResetPasswordDTO): Promise<void> {
        await this.repository.updatePassword(dto.password, {
            password_change_required: false,
        });
    }
    /**
     * Requisitos pendientes tras el login (F-AUTH-03 / F-AUTH-05).
     * Deben resolverse antes de acceder al dashboard.
     */
    async getLoginRequirements(): Promise<LoginRequirements> {
        const authUser = await this.repository.getAuthUser();

        const parsed = authUserMetadataSchema.safeParse(authUser.metadata);
        const metadata: AuthUserMetadataDTO = parsed.success
            ? parsed.data
            : {};

        return {
            mustChangePassword: metadata.password_change_required === true,
            mustAcceptTerms: metadata.terminos_aceptados !== true,
        };
    }
    /**
     * Cambio obligatorio de contraseña en primer login (F-AUTH-03).
     * Valida fortaleza (Zod) y limpia la bandera en la misma operación.
     */
    async changePassword(dto: ChangePasswordDTO): Promise<void> {
        await this.repository.updatePassword(dto.password, {
            password_change_required: false,
        });
    }
    /**
     * Aceptación auditable de Términos y Condiciones (F-AUTH-05):
     * registra versión + timestamp de la aceptación.
     */
    async acceptTerms(): Promise<void> {
        await this.repository.updateUserMetadata({
            terminos_aceptados: true,
            terminos_version: TERMINOS_VERSION,
            terminos_aceptado_en: new Date().toISOString(),
        });
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