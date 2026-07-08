import { redirect } from "next/navigation";

import { getCurrentUser } from "@/modules/auth/service";

import {
    EmailNotVerifiedError,
    InactiveShelterError,
    InactiveUserError,
    UnauthorizedError,
} from "@/modules/auth/errors";

export default async function ProtectedLayout({
                                                  children,
                                              }: {
    children: React.ReactNode;
}) {

/*    try {

        const user = await getCurrentUser();

    }

    catch (error) {

        if (
            error instanceof UnauthorizedError
        ) {
            redirect("/login");
        }

        if (
            error instanceof EmailNotVerifiedError
        ) {
            redirect("/verify-email");
        }

        if (
            error instanceof InactiveUserError
        ) {
            redirect("/inactive-account");
        }

        if (
            error instanceof InactiveShelterError
        ) {
            redirect("/inactive-shelter");
        }

        throw error;

    }*/

    return <>{children}</>;

}