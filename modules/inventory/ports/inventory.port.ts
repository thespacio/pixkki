import type { InventoryLot, TipoInsumoClinico } from "../types/inventory.types";

/**
 * Puerto público del módulo inventory consumido por animals.
 *
 * El descuento de stock no se expone aquí: se ejecuta dentro de las RPC
 * transaccionales `registrar_evento_sanitario` y `registrar_cirugia_reproductiva`,
 * los únicos puntos donde el acto clínico y el movimiento de inventario se
 * persisten juntos.
 */
export interface InventoryPort {
    listAvailableLots(
        idRefugio: number | null,
        tipoInsumo?: TipoInsumoClinico,
    ): Promise<InventoryLot[]>;

    /** Lotes quirúrgicos activos, vigentes y con stock (RF4.1 / US15). */
    listSurgicalLots(idRefugio: number | null): Promise<InventoryLot[]>;
}
