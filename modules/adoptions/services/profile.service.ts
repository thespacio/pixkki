import type { AuthenticatedUser } from "@/modules/auth/types";
import { isSuperadmin } from "@/modules/auth/authorization";
import { ADOPTION_PERMISSIONS } from "../access";
import { RolSinPermisoError } from "../errors";
import { AdoptionProfileRepository } from "../repositories/profile.repository";
import {
    UpsertPerfilAdopcionBodySchema,
    type UpsertPerfilAdopcionBody,
} from "../validators/public-profile.validators";

export class AdoptionProfileService {
    constructor(private readonly repository: AdoptionProfileRepository) {}

    private require(user: AuthenticatedUser, permission: string) {
        if (!user.permissions.includes(permission)) throw new RolSinPermisoError();
    }

    private scope(user: AuthenticatedUser): number | null {
        return isSuperadmin(user) ? null : (user.shelterId ?? 0);
    }

    async get(idAnimal: number, user: AuthenticatedUser) {
        this.require(user, ADOPTION_PERMISSIONS.view);
        return this.repository.getByAnimal(idAnimal, this.scope(user));
    }

    async upsert(idAnimal: number, body: unknown, user: AuthenticatedUser) {
        this.require(user, ADOPTION_PERMISSIONS.publish);
        const data: UpsertPerfilAdopcionBody = UpsertPerfilAdopcionBodySchema.parse(body);
        return this.repository.upsert(idAnimal, data, user.id);
    }
}