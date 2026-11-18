import { getCurrentUser } from "@/modules/auth";
import { isSuperadmin } from "@/modules/auth/authorization";
import { getStaffAction } from "@/modules/users/actions/user.actions";
import { getSheltersAction } from "@/modules/shelters/actions";
import StaffList from "@/modules/users/components/StaffList";

/**
 * Server Component: resuelve el contexto autenticado y delega la interacción
 * a un componente cliente delgado. No contiene lógica de negocio ni acceso
 * directo a Supabase (AGENTS.md §7 y §9).
 */
export default async function StaffPage() {
    const currentUser = await getCurrentUser();
    const esSuperadmin = currentUser ? isSuperadmin(currentUser) : false;

    const [staffResult, sheltersResult] = await Promise.all([
        getStaffAction(),
        esSuperadmin
            ? getSheltersAction({ limit: 1000, offset: 0 })
            : Promise.resolve(null),
    ]);

    const shelters = sheltersResult?.success
        ? sheltersResult.data.map((shelter) => ({
            id: shelter.id,
            nombre: shelter.nombre_albergue,
        }))
        : [];

    return (
        <StaffList
            initialStaff={staffResult.success ? staffResult.data : []}
            loadError={staffResult.success ? undefined : staffResult.error}
            shelters={shelters}
            isSuperadmin={esSuperadmin}
        />
    );
}
