import { AnimalStateRepository} from "@/modules/catalogs/animal-states/repository";
import {AnimalState} from "@/modules/catalogs/animal-states/types";


export class AnimalStateService {
    private repository: AnimalStateRepository;

    constructor() {
        this.repository = new AnimalStateRepository();
    }

    async getAllStates(): Promise<AnimalState[]> {
        return this.repository.getAllStates();
    }
}