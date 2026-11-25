export interface CreateUserInput {
    correo: string;
    password: string;
    nombre_completo: string;
    nombre_rol: string;
}

export interface RoleReference {
    id_rol: number;
}

/**
 * Catálogo canónico de roles (RF00): Administrador (1), Veterinario (2) y
 * Superadmin (3). La base guarda los nombres en español ("Administrador"),
 * mientras que este tipo usa identificadores lógicos; las funciones de
 * autorización normalizan ambos antes de comparar.
 */
export type UserRole =
    | "admin"
    | "veterinario"
    | "superadmin";

export interface AuthenticatedUser {
    id: number;
    shelterId: number | null;
    fullName: string;
    email: string;
    role: UserRole;
    permissions: string[];
    active: boolean;
    emailVerified: boolean;
    lastLogin: string | null;
    requiresPasswordChange: boolean;
    requiresOnboarding: boolean;
    termsAccepted: boolean;
}

export interface TotpEnrollment {
    factorId: string;
    uri: string;
    secret: string;
}

export interface TotpFactor {
    factorId: string;
    friendlyName: string;
    status: string;
}

export type LoginStep =
    | "credentials"
    | "mfa"
    | "success";

export interface LoginResult {

    step: LoginStep;

    factorId?: string;

    challengeId?: string;

}