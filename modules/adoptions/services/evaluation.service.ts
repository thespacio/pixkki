import type { AuthenticatedUser } from "@/modules/auth/types";
import { isSuperadmin } from "@/modules/auth/authorization";
import { ADOPTION_PERMISSIONS } from "../access";
import { RolSinPermisoError } from "../errors";
import { AdoptionEvaluationRepository } from "../repositories/evaluation.repository";
import { CreateEvaluacionBodySchema } from "../validators/evaluation.validators";

export class AdoptionEvaluationService {
    constructor(private readonly repository: AdoptionEvaluationRepository) {}

    private require(user: AuthenticatedUser, permission: string) {
        if (!user.permissions.includes(permission)) throw new RolSinPermisoError();
    }
    private scope(user: AuthenticatedUser): number | null {
        return isSuperadmin(user) ? null : (user.shelterId ?? 0);
    }

    async create(idSolicitud: number, body: unknown, user: AuthenticatedUser) {
        this.require(user, ADOPTION_PERMISSIONS.evaluate);
        const parsed = CreateEvaluacionBodySchema.parse(body);
        return this.repository.create(idSolicitud, parsed, user.id, this.scope(user));
    }

    async list(idSolicitud: number, user: AuthenticatedUser) {
        this.require(user, ADOPTION_PERMISSIONS.view);
        return this.repository.listBySolicitud(idSolicitud, this.scope(user));
    }
}