import type { AnimalAccess } from "../access";
import { AnimalClinicalForbiddenError } from "../errors";
import { puedeEjecutarOperacionClinica } from "../types/animales.types";
import {
    CreateTrasladoSchema,
    type CreateTrasladoInput,
} from "../validators/animal-transfer.validators";
import type {
    AnimalTransfer,
    AnimalTransferRepository,
} from "../repositories/animal-transfer.repository";

type StaffUser = { id: number; role: string };

export class AnimalTransferService {
    constructor(private readonly repository: AnimalTransferRepository) {}

    async create(
        idAnimal: number,
        access: AnimalAccess,
        body: unknown,
        user: StaffUser,
    ): Promise<AnimalTransfer> {
        const data: CreateTrasladoInput = CreateTrasladoSchema.parse(body);

        // La UI oculta el alta médica; aquí se revalida antes de cualquier efecto.
        if (data.alta_medica && !puedeEjecutarOperacionClinica(user.role)) {
            throw new AnimalClinicalForbiddenError();
        }

        return this.repository.create(idAnimal, access, data, user.id);
    }

    async list(idAnimal: number, access: AnimalAccess): Promise<AnimalTransfer[]> {
        return this.repository.listByAnimal(idAnimal, access);
    }
}
