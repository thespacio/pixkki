import type { AnimalStateRepository } from "../repositories/animal-state.repository";
import type { AnimalState } from "../types/animal-state.types";

export class AnimalStateService {
    constructor(private readonly repository: AnimalStateRepository) {}

    async listAll(): Promise<AnimalState[]> {
        return this.repository.findAll();
    }
}