import type { InventoryLot, TipoInsumoClinico } from "../types/inventory.types";

/**
 * Puerto público del módulo inventory consumido por animals.
 *
 * El descuento de stock no se expone aquí: se ejecuta dentro de la RPC
 * transaccional `registrar_evento_sanitario`, que es el único punto donde el
 * evento sanitario y el movimiento de inventario se persisten juntos.
 */
export interface InventoryPort {
    listAvailableLots(
        idRefugio: number | null,
        tipoInsumo?: TipoInsumoClinico,
    ): Promise<InventoryLot[]>;
}
