import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth";
import { TERMINOS_VERSION } from "@/modules/auth/constants";
import AcceptTermsForm from "./AcceptTermsForm";

/**
 * Aceptación de Términos y Condiciones (F-AUTH-05 / US27).
 * Página de servidor: verifica si ya se aceptó la versión vigente y resuelve
 * el siguiente paso de la compuerta post-login.
 */
export default async function AcceptTermsPage() {
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

    // Si ya aceptó los términos y no hay otras compuertas pendientes, ir al panel.
    if (user.termsAccepted && !user.requiresOnboarding && !user.requiresPasswordChange) {
        redirect("/dashboard");
    }

    return <AcceptTermsForm terminosVersion={TERMINOS_VERSION} />;
}
