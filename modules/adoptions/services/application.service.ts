import type { AuthenticatedUser } from "@/modules/auth/types";
import { isSuperadmin } from "@/modules/auth/authorization";
import { ADOPTION_PERMISSIONS } from "../access";
import { RolSinPermisoError } from "../errors";
import { AdoptionApplicationRepository } from "../repositories/application.repository";
import {
    ListSolicitudesQuerySchema,
    type ListSolicitudesQuery,
} from "../validators/application.validators";

export class AdoptionApplicationService {
    constructor(private readonly repository: AdoptionApplicationRepository) {}

    private require(user: AuthenticatedUser, permission: string) {
        if (!user.permissions.includes(permission)) throw new RolSinPermisoError();
    }
    private scope(user: AuthenticatedUser): number | null {
        return isSuperadmin(user) ? null : (user.shelterId ?? 0);
    }

    async list(query: unknown, user: AuthenticatedUser) {
        this.require(user, ADOPTION_PERMISSIONS.view);
        const parsed = ListSolicitudesQuerySchema.parse(query) as ListSolicitudesQuery;
        return this.repository.list(parsed, this.scope(user));
    }

    async getById(idSolicitud: number, user: AuthenticatedUser) {
        this.require(user, ADOPTION_PERMISSIONS.view);
        return this.repository.getById(idSolicitud, this.scope(user));
    }
}