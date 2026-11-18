import type { AnimalAccess } from "../access";
import { AnimalClinicalForbiddenError } from "../errors";
import { puedeRegistrarSocializacion } from "../types/animales.types";
import {
    CreateEvaluacionTemperamentoSchema,
    type CreateEvaluacionTemperamentoInput,
} from "../validators/animal-temperament.validators";
import type {
    AnimalTemperamentRepository,
    TemperamentEvaluation,
} from "../repositories/animal-temperament.repository";

type StaffUser = { id: number; role: string };

export class AnimalTemperamentService {
    constructor(private readonly repository: AnimalTemperamentRepository) {}

    async create(
        idAnimal: number,
        access: AnimalAccess,
        body: unknown,
        user: StaffUser,
    ): Promise<TemperamentEvaluation> {
        if (!puedeRegistrarSocializacion(user.role)) {
            throw new AnimalClinicalForbiddenError();
        }
        const data: CreateEvaluacionTemperamentoInput =
            CreateEvaluacionTemperamentoSchema.parse(body);
        return this.repository.create(idAnimal, access, data, user.id);
    }

    async list(idAnimal: number, access: AnimalAccess): Promise<TemperamentEvaluation[]> {
        return this.repository.listByAnimal(idAnimal, access);
    }
}
