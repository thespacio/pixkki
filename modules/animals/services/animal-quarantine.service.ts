import type { AnimalAccess } from "../access";
import { puedeEjecutarOperacionClinica } from "../types/animales.types";
import { AnimalClinicalForbiddenError } from "../errors";
import { CreateAltaCuarentenaSchema } from "../validators/animal.validators";
import type { AnimalQuarantineRepository, QuarantineStatus } from "../repositories/animal-quarantine.repository";

type ClinicalUser = { id: number; role: string };

export class AnimalQuarantineService {
    constructor(private readonly repository: AnimalQuarantineRepository) {}

    async getStatus(idAnimal: number, access: AnimalAccess): Promise<QuarantineStatus> {
        return this.repository.getStatus(idAnimal, access);
    }

    async release(idAnimal: number, access: AnimalAccess, body: unknown, user: ClinicalUser) {
        if (!puedeEjecutarOperacionClinica(user.role)) {
            throw new AnimalClinicalForbiddenError();
        }
        const data = CreateAltaCuarentenaSchema.parse(body);
        return this.repository.release(idAnimal, access, data, user.id);
    }
}
