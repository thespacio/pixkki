import { createSupabaseServerClient } from "@/lib/supabase/server-client";

import {
    assignRole,
    createAuthUser,
    createRole,
    createUserProfile,
    deleteAuthUser,
    findRoleByName,
    getAdminByEmail,
} from "@/modules/users/repository";

import { ensureIsAdministrator } from "@/modules/users/authorization";
import type { CreateUserInput } from "@/modules/auth/types";

export async function createUser(input: CreateUserInput) {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
        throw new Error("No autorizado");
    }

    const admin = await getAdminByEmail(user.email);

    if (!admin) {
        throw new Error("Administrador no encontrado");
    }

    await ensureIsAdministrator(admin.id_usuario);

    const authUser = await createAuthUser(
        input.correo,
        input.password
    );

    try {
        let role = await findRoleByName(input.nombre_rol);

        if (!role) {
            role = await createRole(input.nombre_rol);
        }

        const profile = await createUserProfile({
            id_refugio: admin.id_refugio,
            correo: input.correo,
            nombre_completo: input.nombre_completo,
        });

        await assignRole(profile.id_usuario, role.id_rol);

        return {
            ok: true,
        };
    } catch (error) {
        await deleteAuthUser(authUser.id);
        throw error;
    }
}