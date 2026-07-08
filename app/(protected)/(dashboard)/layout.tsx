import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/modules/auth/service";
import DashboardLayout from "@/modules/dashboard/components/DashboardLayout";


interface Props {
    children: ReactNode;
}

export default async function Layout({
                                         children,
                                     }: Props) {

    /*if (user.firstLogin) {
        redirect("/onboarding");
    }

    if (!user.active) {
        redirect("/login");
    }
*/
    return (
        <DashboardLayout>
            {children}
        </DashboardLayout>
    );

}