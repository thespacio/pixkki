import { redirect } from "next/navigation";

import { getCurrentUser } from "@/modules/auth";
import ChangePasswordForm from "./ChangePasswordForm";

/**
 * Cambio obligatorio de contraseña en primer login (F-AUTH-03).
 * Página de servidor: resuelve las flags de sesión y las pasa al formulario
 * para mostrar el stepper y decidir el siguiente paso tras el éxito.
 */
export default async function ChangePasswordPage() {
    let user;
    try {
        user = await getCurrentUser();
    } catch (error) {
        const statusCode =
            error instanceof Error && "statusCode" in error && typeof error.statusCode === "number"
                ? error.statusCode
                : undefined;
        if (statusCode === 401 || statusCode === 403) redirect("/login");
        throw error;
    }

    return (
        <ChangePasswordForm
            requiresPasswordChange={user.requiresPasswordChange}
            requiresOnboarding={user.requiresOnboarding}
            termsAccepted={user.termsAccepted}
        />
    );
}
