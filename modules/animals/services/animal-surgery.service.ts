import type { AnimalAccess } from "../access";
import { AnimalClinicalForbiddenError } from "../errors";
import { puedeEjecutarOperacionClinica } from "../types/animales.types";
import {
    CreateCirugiaBodySchema,
    type CreateCirugiaBody,
} from "../validators/animal-surgery.validators";
import type {
    AnimalSurgery,
    AnimalSurgeryHistoryItem,
    AnimalSurgeryRepository,
} from "../repositories/animal-surgery.repository";

type StaffUser = { id: number; role: string };

export class AnimalSurgeryService {
    constructor(private readonly repository: AnimalSurgeryRepository) {}

    async create(
        idAnimal: number,
        access: AnimalAccess,
        body: unknown,
        user: StaffUser,
    ): Promise<AnimalSurgery> {
        const data: CreateCirugiaBody = CreateCirugiaBodySchema.parse(body);

        // RF4.1 (regla 7): solo Veterinario/Administrador registran cirugías.
        if (!puedeEjecutarOperacionClinica(user.role)) {
            throw new AnimalClinicalForbiddenError();
        }

        return this.repository.create(idAnimal, access, data, user.id);
    }

    async list(
        idAnimal: number,
        access: AnimalAccess,
    ): Promise<AnimalSurgeryHistoryItem[]> {
        return this.repository.listByAnimal(idAnimal, access);
    }
}
