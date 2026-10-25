// modules/auth/client-index.ts
// Fachada pública de auth segura para componentes "use client".
// (modules/auth/index.ts no sirve para esto: usa createSupabaseServerClient,
// que depende de next/headers y no puede correr en el cliente).
export { login, logout, resetPassword } from "@/modules/auth/client";
export {
    hasPermission,
    ensureAuthenticated,
    ensurePermission,
    ensureAnyPermission,
    ensureAllPermissions,
    ensureRole,
    ensureAnyRole,
    ensureSuperAdmin,
    isSuperadmin,
} from "@/modules/auth/authorization";
