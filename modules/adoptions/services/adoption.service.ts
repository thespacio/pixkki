import type { AuthenticatedUser } from "@/modules/auth/types";
import { ADOPTION_PERMISSIONS } from "../access";
import { FechaFuturaError, RolSinPermisoError } from "../errors";
import { AdoptionStateRepository } from "../repositories/adoption.repository";
import {
    ChangeSolicitudEstadoBodySchema,
    CompletarAdopcionBodySchema,
} from "../validators/state.validators";

export class AdoptionStateService {
    constructor(private readonly repository: AdoptionStateRepository) {}

    private require(user: AuthenticatedUser, permission: string) {
        if (!user.permissions.includes(permission)) throw new RolSinPermisoError();
    }

    async changeState(idSolicitud: number, body: unknown, user: AuthenticatedUser) {
        this.require(user, ADOPTION_PERMISSIONS.manage);
        const parsed = ChangeSolicitudEstadoBodySchema.parse(body);
        return this.repository.changeState(
            idSolicitud,
            parsed.estado_solicitud,
            parsed.motivo ?? null,
            user.id,
        );
    }

    async complete(idSolicitud: number, body: unknown, user: AuthenticatedUser) {
        this.require(user, ADOPTION_PERMISSIONS.complete);
        const parsed = CompletarAdopcionBodySchema.parse(body);
        const today = new Date().toISOString().slice(0, 10);
        if (parsed.fecha_adopcion > today) throw new FechaFuturaError();
        return this.repository.complete(
            idSolicitud,
            parsed.fecha_adopcion,
            parsed.observaciones ?? null,
            user.id,
        );
    }
}