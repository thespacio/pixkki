import { getCurrentUser } from '@/modules/auth';
import { isAdmin, isSuperadmin } from '@/modules/auth/authorization';
import {getSpacesByShelterAction} from "@/modules/spaces/actions";
import SpaceClient from "@/app/(protected)/(dashboard)/espacios/SpaceClient";

export default async function NewShelterPage() {
    const user = await getCurrentUser();
    const shelterId = user.shelterId;

    const res = shelterId !== null
        ? await getSpacesByShelterAction(shelterId)
        : { success: false as const };

    const spaces = res.success && res.data ? res.data : [];
    const canManage = isAdmin(user) || isSuperadmin(user);

    return (
        <SpaceClient
            shelterId={shelterId ?? undefined}
            spaces={spaces}
            canManage={canManage}
        />
    );
}
