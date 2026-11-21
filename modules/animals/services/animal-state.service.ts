import type { AnimalStateRepository } from "../repositories/animal-state.repository";
import type { AnimalState } from "../types/animal-state.types";
import { findEstadoCuarentena } from "../animal-state";
import { EstadoCuarentenaNoConfiguradoError } from "../errors";

export class AnimalStateService {
    constructor(private readonly repository: AnimalStateRepository) {}

    async listAll(): Promise<AnimalState[]> {
        return this.repository.findAll();
    }

    /**
     * RF1.1/RF2.4: todo ingreso nace en cuarentena. El estado se resuelve por
     * nombre normalizado, nunca por un id fijo que cambie entre entornos.
     */
    async findCuarentena(): Promise<AnimalState | null> {
        return findEstadoCuarentena(await this.repository.findAll());
    }

    async requireCuarentenaId(): Promise<number> {
        const estado = await this.findCuarentena();
        if (!estado) throw new EstadoCuarentenaNoConfiguradoError();
        return estado.idEstado;
    }
}
