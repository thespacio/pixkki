export interface CreateUserInput {
    correo: string;
    password: string;
    nombre_completo: string;
    nombre_rol: string;
}

export interface RoleReference {
    id_rol: number;
}

export type UserRole =
    | "superadmin"
    | "admin"
    | "veterinario"
    | "operador"
    | "coordinador"
    | "evaluador";

export interface AuthenticatedUser {
    id: number;
    shelterId: number;
    fullName: string;
    email: string;
    role: UserRole;
    permissions: string[];
    active: boolean;
    emailVerified: boolean;
    lastLogin: string | null;
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

/**
 * Requisitos posteriores al login que deben resolverse
 * antes de acceder al dashboard (F-AUTH-03 / F-AUTH-05).
 */
export type LoginRequirements = {
    mustChangePassword: boolean;
    mustAcceptTerms: boolean;
};

export interface LoginResult {

    step: LoginStep;

    factorId?: string;

    challengeId?: string;

}