/** Tipos de insumo que puede consumir el control clínico (RF2.2 / US10). */
export const TIPOS_INSUMO_CLINICO = ["vacuna", "desparasitante"] as const;
export type TipoInsumoClinico = (typeof TIPOS_INSUMO_CLINICO)[number];

/**
 * Vista pública de un lote con stock disponible. No expone `id_refugio` ni
 * detalle de movimientos: el módulo `animals` solo necesita un lote seleccionable.
 */
export type InventoryLot = {
    idLoteInventario: number;
    nombreInsumo: string;
    tipoInsumo: string;
    marca: string | null;
    lote: string | null;
    stockActual: number;
    unidadMedida: string;
    fechaCaducidad: string | null;
};
