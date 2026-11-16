import type { InventoryPort } from "../ports/inventory.port";
import type { InventoryRepository } from "../repositories/inventory.repository";
import type { InventoryLot, TipoInsumoClinico } from "../types/inventory.types";

/** Servicio del contrato mínimo de inventario consumido por animals. */
export class InventoryService implements InventoryPort {
    constructor(private readonly repository: InventoryRepository) {}

    async listAvailableLots(
        idRefugio: number | null,
        tipoInsumo?: TipoInsumoClinico,
    ): Promise<InventoryLot[]> {
        return this.repository.listAvailableLots(idRefugio, tipoInsumo);
    }
}
