import {redirect} from "next/navigation";

import {getCurrentUser, getLoginRequirements} from "@/modules/auth";
import {AuthError} from "@/modules/auth/errors";
import type {AuthenticatedUser} from "@/modules/auth/types";
import SessionInvalidNotice from "@/modules/auth/components/session-invalid-notice";
import DashboardLayout from "@/modules/dashboard/components/DashboardLayout";
import {getShelterDetailsByIdAction} from "@/modules/shelters/actions";


type LayoutUserResult =
    | { ok: true; user: AuthenticatedUser }
    | { ok: false; message: string };

async function loadLayoutUser(): Promise<LayoutUserResult> {
    try {
        const user = await getCurrentUser();

        // F-AUTH-03 / F-AUTH-05: bloquear el dashboard hasta
        // resolver los requisitos del primer login
        const requirements = await getLoginRequirements();

        if (requirements.mustChangePassword) {
            redirect("/change-password");
        }

        if (requirements.mustAcceptTerms) {
            redirect("/accept-terms");
        }

        return { ok: true, user };
    } catch (error) {
        // redirect() lanza NEXT_REDIRECT (no es AuthError) y se propaga
        if (error instanceof AuthError) {
            return { ok: false, message: error.message };
        }
        throw error;
    }
}

export default async function Layout({
                                         children,
                                     }: {
    children: React.ReactNode;
}) {
    const result = await loadLayoutUser();

    if (!result.ok) {
        return <SessionInvalidNotice message={result.message} />;
    }

    const {user} = result;
    const albergue = await getShelterDetailsByIdAction(user.shelterId);

    if (!albergue.success) {
        return (
            <DashboardLayout
                user={user}
                albergue="Pixkki">
                {children}
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            user={user}
            albergue={albergue.data.nombre_albergue}>
            {children}
        </DashboardLayout>
    );
}