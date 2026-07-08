// modules/auth/repository.ts


import {createSupabaseServerClient} from "@/lib/supabase/server-client";
import {Database} from "@/types/database";
import { UnauthorizedError } from "./errors";

type PermissionRow =
    Database["public"]["Tables"]["permiso"]["Row"];

type UsuarioRow =
    Database["public"]["Tables"]["usuario"]["Row"];

export async function getAuthenticatedUser() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
        throw new UnauthorizedError();
    }
    return data.user;
}

export async function getAuthenticatedContext() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
        throw new UnauthorizedError();
    }
    return supabase;
}

export async function findUserContext(authUserId: string) {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("usuario")
        .select(`
            id_usuario,
            id_refugio,
            nombre_completo,
            correo,
            activo,
            ultimo_login,
            rol
        `)
        .eq("auth_user_id", authUserId)
        .single();

    if (error || !data) {
        throw new UnauthorizedError();
    }

    return data;
}

export async function signOut(): Promise<void> {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
        throw error;
    }
}

export async function findRoleNameById(roleId: number) {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("rol")
        .select("nombre_rol")
        .eq("id_rol", roleId)
        .single();

    if (error) {
        throw error;
    }

    return data.nombre_rol;
}

export async function findPermissionsByRole(
    roleId: number
): Promise<string[]> {

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("rol_permiso")
        .select(`
            permiso:id_permiso(
                nombre_permiso
            )
        `)
        .eq("id_rol", roleId)
        .returns<PermissionRow[]>();

    if (error) {
        throw error;
    }

    return data.map(
        (permission) => permission.nombre_permiso
    );

}

export async function updateLastLogin(
    idUsuario: number
) {
    const supabase = await createSupabaseServerClient();

    await supabase
        .from("usuario")
        .update({
            ultimo_inicio_sesion: new Date().toISOString(),
        })
        .eq("id_usuario", idUsuario);
}

export async function findUserByAuthId(
    authUserId: string
): Promise<UsuarioRow> {

    const supabase = await createSupabaseServerClient();

    const {
        data,
        error,
    } = await supabase
        .from("usuario")
        .select(`
            id_usuario,
            id_refugio,
            nombre_completo,
            fecha_creacion,
            correo,
            activo,
            ultimo_login,
            rol,
            ultimo_login,
            auth_user_id
        `)
        .eq("auth_user_id", authUserId)
        .single();

    if (error || !data) {
        throw new UnauthorizedError();
    }

    return data;

}