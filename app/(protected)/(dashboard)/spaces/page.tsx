import { getCurrentUser } from '@/modules/auth';
import {getSpacesByShelterAction} from "@/modules/spaces/actions";
import SpaceClient from "@/app/(protected)/(dashboard)/spaces/SpaceClient";

export default async function NewShelterPage() {
    const user = await getCurrentUser();

    const res = await getSpacesByShelterAction(user.shelterId);

    const spaces =
        res.success && res.data
            ? res.data
            : [];

    return (
        <SpaceClient
            shelterId={user.shelterId}
            spaces={spaces}
        />
    );
}