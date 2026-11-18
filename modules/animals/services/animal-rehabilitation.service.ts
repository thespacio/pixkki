import type { AnimalAccess } from "../access";
import { AnimalClinicalForbiddenError } from "../errors";
import { puedeRegistrarSocializacion } from "../types/animales.types";
import {
    CreateRehabilitacionSchema,
    type CreateRehabilitacionInput,
} from "../validators/animal-rehabilitation.validators";
import type {
    AnimalRehabilitationRepository,
    RehabilitationEntry,
} from "../repositories/animal-rehabilitation.repository";

type StaffUser = { id: number; role: string };

export class AnimalRehabilitationService {
    constructor(private readonly repository: AnimalRehabilitationRepository) {}

    async create(
        idAnimal: number,
        access: AnimalAccess,
        body: unknown,
        user: StaffUser,
    ): Promise<RehabilitationEntry> {
        if (!puedeRegistrarSocializacion(user.role)) {
            throw new AnimalClinicalForbiddenError();
        }
        const data: CreateRehabilitacionInput = CreateRehabilitacionSchema.parse(body);
        return this.repository.create(idAnimal, access, data, user.id);
    }

    async list(idAnimal: number, access: AnimalAccess): Promise<RehabilitationEntry[]> {
        return this.repository.listByAnimal(idAnimal, access);
    }
}
