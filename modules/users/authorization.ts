import { supabaseAdmin } from "@/lib/supabase/admin-client";
const SUPER_ADMIN_EMAIL = "pixkki@pixkki.es";

export async function ensureIsAdministrator(idUsuario: number) {
    const { data } = await supabaseAdmin
        .from("usuario_rol")
        .select("rol(nombre_rol)")
        .eq("id_usuario", idUsuario)
        .single();

    // Idealmente tipar la respuesta para evitar `any`.
    const nombreRol = (data as { rol?: { nombre_rol?: string } })?.rol?.nombre_rol;

    if (nombreRol !== "Administrador") {
        throw new Error("No autorizado");
    }
}

export async function ensureIsSuperAdmin(email: string) {
    if (email.toLowerCase() !== SUPER_ADMIN_EMAIL) {
        throw new Error("No autorizado");
    }
}