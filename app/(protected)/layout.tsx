
import {getCurrentUser} from "@/modules/auth";
import {Props} from "next/script";
import DashboardLayout from "@/modules/dashboard/components/DashboardLayout";
import {notFound, usePathname, useRouter} from "next/navigation";
import {getShelterDetailsByIdAction} from "@/modules/shelters/actions";


export default async function Layout({
                                         children,
                                     }: Props) {
    const user = await getCurrentUser();
    const albergue = await getShelterDetailsByIdAction(user.shelterId);

    if (!albergue.success) {
        return (
            <DashboardLayout
                user={user}
                albergue="Pixkki">
                {children}
            </DashboardLayout>
        );
        notFound();
    }

    return (
        <DashboardLayout
            user={user}
            albergue={albergue.data.nombre_albergue}>
            {children}
        </DashboardLayout>
    );
}