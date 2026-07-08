import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import {RoleReference} from "@/modules/auth/types";
import {createSupabaseServerClient} from "@/lib/supabase/server-client";

//Obtener usuario por correo
export async function getAdminByEmail(email: string) {
    const supabase = await createSupabaseServerClient();

    const { data } = await supabase
        .from("usuario")
        .select("id_usuario,id_refugio")
        .eq("correo", email)
        .eq("activo", true)
        .single();

    return data;
}

export async function findRoleByName(
    nombre: string
): Promise<RoleReference | null> {

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("rol")
        .select("id_rol")
        .eq("nombre_rol", nombre)
        .single();

    if (error && error.code !== "PGRST116") {
        throw error;
    }

    return data;
}

export async function createRole(
    nombre: string
): Promise<RoleReference> {

    const supabase = await createSupabaseServerClient();
    const { data,error } = await supabase
        .from("rol")
        .insert({
            nombre_rol: nombre,
            descripcion: nombre,
        })
        .select("id_rol")
        .single();

    if (error || !data) {
        throw error ?? new Error("No se pudo crear el rol.");
    }

    return data;
}

export async function createAuthUser(
    email: string,
    password: string
) {
    const supabase = await createSupabaseServerClient();

    const { data , error} =
        await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        });

    if (error) throw new Error(error.message);

    return data.user;
}

export async function createUserProfile(data: {
    id_refugio: number;
    correo: string;
    nombre_completo: string;
}) {
    const supabase = await createSupabaseServerClient();

    const { data:user , error } = await supabase
        .from("usuario")
        .insert({
            ...data,
            activo: true,
            password_hash: "supabase-auth",
        })
        .select("id_usuario")
        .single();

    if (error) throw new Error(error.message);

    return user;
}

export async function assignRole(
    idUsuario: number,
    idRol: number
) {
    const supabase = await createSupabaseServerClient();
    const { data,error } = await supabase
        .from("usuario_rol")
        .insert({
            id_usuario: idUsuario,
            id_rol: idRol,
        });

    if (error) throw new Error(error.message);
}

export async function deleteAuthUser(id: string) {
    const supabase = await createSupabaseServerClient();

    await supabase.auth.admin.deleteUser(id);
}


export async function createShelterProfile(
    data: {
        id_refugio: number;
        slug: string;
    }
) {

    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
        .from("albergue_perfil")
        .insert({
            id_refugio: data.id_refugio,
            slug: data.slug,
            visible_publico: false,
            color_primario: "#43AE6D",
        });

    if (
        error &&
        !error.message.includes("duplicate")
    ) {
        throw error;
    }

}