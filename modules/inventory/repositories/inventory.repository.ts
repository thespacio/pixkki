import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { InventoryLot, TipoInsumoClinico } from "../types/inventory.types";

type LotRow = {
    id_lote_inventario: number;
    fecha_caducidad: string | null;
    stock_actual: number;
    lote: string | null;
    marca: string | null;
    inventario_insumo: {
        nombre: string;
        tipo_insumo: string;
        unidad_medida: string;
        activo: boolean;
    } | null;
};

/** Único punto de acceso a las tablas de inventario. Sin lógica de negocio. */
export class InventoryRepository {
    constructor(private readonly supabase: SupabaseClient<Database>) {}

    /**
     * Lotes activos, vigentes y con stock > 0 del refugio indicado.
     * `null` como `idRefugio` significa alcance global (superadmin).
     */
    async listAvailableLots(
        idRefugio: number | null,
        tipoInsumo?: TipoInsumoClinico,
    ): Promise<InventoryLot[]> {
        let query = this.supabase
            .from("inventario_lote")
            .select(
                "id_lote_inventario, marca, lote, stock_actual, fecha_caducidad, activo, inventario_insumo(nombre, tipo_insumo, unidad_medida, activo)",
            )
            .eq("activo", true)
            .gt("stock_actual", 0)
            .order("id_lote_inventario", { ascending: true });

        if (idRefugio !== null) query = query.eq("id_refugio", idRefugio);

        const { data, error } = await query;
        if (error) throw error;

        const hoy = new Date().toISOString().slice(0, 10);
        const rows = (data ?? []) as unknown as LotRow[];

        return rows
            .filter((row) => {
                const insumo = row.inventario_insumo;
                if (!insumo || !insumo.activo) return false;
                if (row.fecha_caducidad && row.fecha_caducidad < hoy) return false;
                if (tipoInsumo && insumo.tipo_insumo !== tipoInsumo) return false;
                return true;
            })
            .map((row) => ({
                idLoteInventario: row.id_lote_inventario,
                nombreInsumo: row.inventario_insumo?.nombre ?? "",
                tipoInsumo: row.inventario_insumo?.tipo_insumo ?? "",
                marca: row.marca,
                lote: row.lote,
                stockActual: row.stock_actual,
                unidadMedida: row.inventario_insumo?.unidad_medida ?? "dosis",
                fechaCaducidad: row.fecha_caducidad,
            }));
    }
}
