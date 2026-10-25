import type { AnimalRepository } from "../repositories/animal.repository";
import type { CreateAnimalDTO } from "../dtos/create-animal.dto";
import type { UpdateAnimalDTO } from "../dtos/update-animal.dto";
import type { AnimalAccess } from "../access";
import {
    Animal,
    AnimalMicrochipDuplicateError,
    AnimalNotFoundError,
    AnimalShelterNotFoundError,
    AnimalSpaceMismatchError,
    AnimalStateNotFoundError
} from "@/modules/animals/types/animales.types";


export class AnimalService {
    constructor(private readonly repository: AnimalRepository) {}

    /** Animales visibles para el usuario: todos si es superadmin, solo los de su albergue si no. */
    async listVisible(access: AnimalAccess): Promise<Animal[]> {
        return access.allShelters
            ? this.repository.findAll()
            : this.repository.findAllByRefugio(access.shelterId);
    }

    async listByRefugio(idRefugio: number): Promise<Animal[]> {
        return this.repository.findAllByRefugio(idRefugio);
    }

    async getById(id: number, access: AnimalAccess): Promise<Animal> {
        const animal = await this.repository.findById(id);
        if (!animal) throw new AnimalNotFoundError(id);
        // Regla de negocio: solo el albergue propietario puede verlo (salvo superadmin)
        if (!access.allShelters && animal.idRefugio !== access.shelterId) {
            throw new AnimalNotFoundError(id);
        }
        return animal;
    }

    async create(dto: CreateAnimalDTO, access: AnimalAccess): Promise<Animal> {
        // Regla de negocio: el albergue destino lo elige solo el superadmin;
        // para el resto siempre es el propio, aunque el cliente mande otro id.
        const idRefugio =
            access.allShelters && dto.idRefugio ? dto.idRefugio : access.shelterId;

        if (idRefugio !== access.shelterId) {
            const refugioOk = await this.repository.refugioExists(idRefugio);
            if (!refugioOk) throw new AnimalShelterNotFoundError(idRefugio);
        }

        // Regla de negocio: el espacio debe existir y pertenecer al albergue destino
        const espacioOk = await this.repository.espacioExistsInRefugio(
            dto.idEspacio,
            idRefugio,
        );
        if (!espacioOk) throw new AnimalSpaceMismatchError();

        // Regla de negocio: el estado debe existir
        const estadoOk = await this.repository.estadoExists(dto.idEstado);
        if (!estadoOk) throw new AnimalStateNotFoundError(dto.idEstado);

        // Regla de negocio: un microchip identifica a un solo animal
        if (dto.microchip && (await this.repository.microchipInUse(dto.microchip))) {
            throw new AnimalMicrochipDuplicateError();
        }

        return this.repository.create(dto, idRefugio);
    }

    async update(dto: UpdateAnimalDTO, access: AnimalAccess): Promise<Animal> {
        const animal = await this.repository.findById(dto.id);
        if (!animal) throw new AnimalNotFoundError(dto.id);
        if (!access.allShelters && animal.idRefugio !== access.shelterId) {
            throw new AnimalNotFoundError(dto.id);
        }

        if (dto.idEspacio !== undefined) {
            // El espacio se valida contra el albergue DEL ANIMAL (no el del usuario):
            // un superadmin puede editar animales de otros albergues.
            const espacioOk = await this.repository.espacioExistsInRefugio(
                dto.idEspacio,
                animal.idRefugio,
            );
            if (!espacioOk) throw new AnimalSpaceMismatchError();
        }

        if (dto.idEstado !== undefined) {
            const estadoOk = await this.repository.estadoExists(dto.idEstado);
            if (!estadoOk) throw new AnimalStateNotFoundError(dto.idEstado);
        }

        if (
            dto.microchip &&
            dto.microchip !== animal.microchip &&
            (await this.repository.microchipInUse(dto.microchip, dto.id))
        ) {
            throw new AnimalMicrochipDuplicateError();
        }

        return this.repository.update(dto.id, dto);
    }

    async delete(id: number, access: AnimalAccess): Promise<void> {
        const animal = await this.repository.findById(id);
        if (!animal) throw new AnimalNotFoundError(id);
        if (!access.allShelters && animal.idRefugio !== access.shelterId) {
            throw new AnimalNotFoundError(id);
        }

        await this.repository.softDelete(id);
    }
}
