import {Shelter, ShelterWithAdminOutput} from "@/modules/shelters/types";
import {AuthenticatedUser} from "@/modules/auth/types";


export function mapShelterWithAdmin(
    shelter: Shelter,
    admin: AuthenticatedUser
): ShelterWithAdminOutput {
    return {
        shelter: {
            ...shelter
        },
        nombreCompleto: admin.fullName,
    };
}