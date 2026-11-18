import type { AnimalAccess } from "../access";
import {
    UpdateDisponibilidadAdopcionBodySchema,
    type UpdateDisponibilidadAdopcionBody,
} from "../validators/animal-adoption-aptitude.validators";
import type {
    AdoptionAptitude,
    AdoptionPublication,
    AnimalAdoptionRepository,
} from "../repositories/animal-adoption.repository";

type StaffUser = { id: number; role: string };

export class AnimalAdoptionService {
    constructor(private readonly repository: AnimalAdoptionRepository) {}

    async evaluate(
        idAnimal: number,
        access: AnimalAccess,
    ): Promise<AdoptionAptitude> {
        return this.repository.evaluate(idAnimal, access);
    }

    /**
     * Publica o despublica al paciente. El RBAC de `animals.edit` lo exige el
     * Route Handler; la autorización de la excepción se revalida en la RPC.
     */
    async setDisponibility(
        idAnimal: number,
        access: AnimalAccess,
        body: unknown,
        user: StaffUser,
    ): Promise<AdoptionPublication> {
        const data: UpdateDisponibilidadAdopcionBody =
            UpdateDisponibilidadAdopcionBodySchema.parse(body);

        return this.repository.setDisponibility(idAnimal, access, data, user.id);
    }
}
