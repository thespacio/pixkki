import { authRepository } from './repository';
import { UnauthorizedError } from '@/modules/auth/errors';

/**
 * Verifica si el usuario tiene MFA habilitado
 */
export async function isMfaEnabled(): Promise<boolean> {
    const user = await authRepository.getAuthUser();
    if (!user) throw new UnauthorizedError();

    const factors = await authRepository.listMfaFactors();
    return factors.totp.some(f => f.status === 'verified');
}

/**
 * Verifica si el usuario requiere MFA
 */
export async function requiresMfa(): Promise<boolean> {
    const user = await authRepository.getAuthUser();
    if (!user) throw new UnauthorizedError();

    const factors = await authRepository.listMfaFactors();
    const hasVerifiedTotp = factors.totp.some(f => f.status === 'verified');

    if (!hasVerifiedTotp) return false;

    const session = await authRepository.getSession();
    return session?.user?.factors?.some(
        f => f.status === 'verified' && f.friendly_name
    ) || false;
}

/**
 * Verifica si el usuario puede deshabilitar MFA
 */
export async function canDisableMfa(): Promise<boolean> {
    const user = await authRepository.getAuthUser();
    if (!user) throw new UnauthorizedError();

    const factors = await authRepository.listMfaFactors();
    const hasVerifiedTotp = factors.totp.some(f => f.status === 'verified');

    if (!hasVerifiedTotp) return false;

    // Solo puede deshabilitar si tiene email o teléfono
    return !!(user.email || user.phone);
}

/**
 * Obtiene el usuario autenticado
 */
/*
export async function getCurrentUser(): Promise<AuthenticatedUser> {
    const authUser = await authRepository.getAuthUser();
    if (!authUser) throw new UnauthorizedError();

    // Verificar email
    if (!authUser.email_confirmed_at) {
        throw new EmailNotVerifiedError();
    }

    // Verificar MFA
    const hasMfa = await isMfaEnabled();
    if (hasMfa && await requiresMfa()) {
        throw new MfaRequiredError();
    }

    // Obtener contexto del usuario
    const context = await authRepository.findUserContext(authUser.id);
    if (!context) {
        throw new Error('Usuario no encontrado en la base de datos');
    }

    // Obtener rol y permisos
    const [role, permissions] = await Promise.all([
        authRepository.findRoleNameById(context.rol),
        authRepository.findPermissionsByRole(context.rol)
    ]);

    return {
        id: context.id_usuario,
        shelterId: context.id_refugio ?? null,
        fullName: context.nombre_completo,
        email: context.correo,
        role: role,
        permissions: permissions,
        active: context.activo,
        emailVerified: true,
        lastLogin: context.ultimo_login,
        mfaEnabled: hasMfa
    };
}*/
