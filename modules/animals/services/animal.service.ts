import type { AnimalRepository } from "../repositories/animal.repository";
import type { CreateAnimalDTO } from "../dtos/create-animal.dto";
import type { UpdateAnimalDTO } from "../dtos/update-animal.dto";
import {
    Animal,
    AnimalNotFoundError,
    AnimalSpaceMismatchError,
    AnimalStateNotFoundError
} from "@/modules/animals/types/animales.types";


export class AnimalService {
    constructor(private readonly repository: AnimalRepository) {}

    async listByRefugio(idRefugio: number): Promise<Animal[]> {
        return this.repository.findAllByRefugio(idRefugio);
    }

    async getById(id: number, idRefugio: number): Promise<Animal> {
        const animal = await this.repository.findById(id);
        if (!animal) throw new AnimalNotFoundError(id);
        // Regla de negocio: solo el refugio propietario puede verlo
        if (animal.idRefugio !== idRefugio) throw new AnimalNotFoundError(id);
        return animal;
    }

    async create(dto: CreateAnimalDTO, idRefugio: number): Promise<Animal> {
        // Regla de negocio: el espacio debe existir y pertenecer al refugio
        const espacioOk = await this.repository.espacioExistsInRefugio(
            dto.idEspacio,
            idRefugio,
        );
        if (!espacioOk) throw new AnimalSpaceMismatchError();

        // Regla de negocio: el estado debe existir
        const estadoOk = await this.repository.estadoExists(dto.idEstado);
        if (!estadoOk) throw new AnimalStateNotFoundError(dto.idEstado);

        return this.repository.create(dto, idRefugio);
    }

    async update(dto: UpdateAnimalDTO, idRefugio: number): Promise<Animal> {
        const animal = await this.repository.findById(dto.id);
        if (!animal) throw new AnimalNotFoundError(dto.id);
        if (animal.idRefugio !== idRefugio) throw new AnimalNotFoundError(dto.id);

        if (dto.idEspacio !== undefined) {
            const espacioOk = await this.repository.espacioExistsInRefugio(
                dto.idEspacio,
                idRefugio,
            );
            if (!espacioOk) throw new AnimalSpaceMismatchError();
        }

        if (dto.idEstado !== undefined) {
            const estadoOk = await this.repository.estadoExists(dto.idEstado);
            if (!estadoOk) throw new AnimalStateNotFoundError(dto.idEstado);
        }

        return this.repository.update(dto.id, dto);
    }

    async delete(id: number, idRefugio: number): Promise<void> {
        const animal = await this.repository.findById(id);
        if (!animal) throw new AnimalNotFoundError(id);
        if (animal.idRefugio !== idRefugio) throw new AnimalNotFoundError(id);

        await this.repository.softDelete(id);
    }
}