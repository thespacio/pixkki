import type { AnimalAccess } from "../access";
import { AnimalClinicalForbiddenError } from "../errors";
import { puedeEjecutarOperacionClinica } from "../types/animales.types";
import {
    CreateEventoSanitarioSchema,
    type CreateEventoSanitarioInput,
} from "../validators/animal-sanitary-event.validators";
import type {
    AnimalSanitaryEvent,
    AnimalSanitaryEventRepository,
} from "../repositories/animal-sanitary-event.repository";

type ClinicalUser = { id: number; role: string };

/**
 * Reglas de negocio de US10. El descuento de inventario y la coherencia de
 * fechas ya están garantizados por Zod y por la RPC; aquí solo se revalida el
 * rol clínico antes de cualquier efecto.
 */
export class AnimalSanitaryEventService {
    constructor(private readonly repository: AnimalSanitaryEventRepository) {}

    async create(
        idAnimal: number,
        access: AnimalAccess,
        body: unknown,
        user: ClinicalUser,
    ): Promise<AnimalSanitaryEvent> {
        if (!puedeEjecutarOperacionClinica(user.role)) {
            throw new AnimalClinicalForbiddenError();
        }
        const data: CreateEventoSanitarioInput = CreateEventoSanitarioSchema.parse(body);
        return this.repository.create(idAnimal, access, data, user.id);
    }

    async list(idAnimal: number, access: AnimalAccess): Promise<AnimalSanitaryEvent[]> {
        return this.repository.listByAnimal(idAnimal, access);
    }
}
