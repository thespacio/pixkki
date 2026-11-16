import type { AnimalAccess } from "../access";
import { puedeEjecutarOperacionClinica } from "../types/animales.types";
import { AnimalClinicalForbiddenError } from "../errors";
import { CreateChequeoSchema, type CreateChequeoInput } from "../validators/animal.validators";
import type { AnimalCheckup, AnimalCheckupRepository } from "../repositories/animal-checkup.repository";

type ClinicalUser = { id: number; role: string };

export class AnimalCheckupService {
    constructor(private readonly repository: AnimalCheckupRepository) {}

    async create(
        idAnimal: number,
        access: AnimalAccess,
        body: unknown,
        user: ClinicalUser,
    ): Promise<AnimalCheckup> {
        if (!puedeEjecutarOperacionClinica(user.role)) {
            throw new AnimalClinicalForbiddenError();
        }
        const data: CreateChequeoInput = CreateChequeoSchema.parse(body);
        return this.repository.create(idAnimal, access, data, user.id);
    }

    async list(idAnimal: number, access: AnimalAccess): Promise<AnimalCheckup[]> {
        return this.repository.listByAnimal(idAnimal, access);
    }
}
