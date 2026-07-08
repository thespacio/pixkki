import {
    createAuthUser,
    createRole,
    createShelterProfile,
    deleteAuthUser,
    findRoleByName
} from "@/modules/users/repository";
import { CreateShelterInput} from "@/modules/auth/types";
import {createSupabaseServerClient} from "@/lib/supabase/server-client";
import {ensureIsSuperAdmin} from "@/modules/users/authorization";

export async function createShelter(
    input: CreateShelterInput
) {

    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
        throw new Error("No autorizado");
    }

    await ensureIsSuperAdmin(user.email);

    const authUser = await createAuthUser(...);

    try {

        let role = await findRoleByName("Administrador");

        if (!role) {
            role = await createRole(...);
        }

        const user = await createInternalUser(...);

        await assignRoleToUser(
            user.id_usuario,
            role.id_rol
        );

    }
    catch (error) {

        await deleteAuthUser(authUser.id);

        throw error;

    }

}