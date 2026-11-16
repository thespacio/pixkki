import { z } from "zod";
import { TIPOS_INSUMO_CLINICO } from "../types/inventory.types";

/** Query de `GET /api/v1/inventario/lotes` (contrato mínimo de US10). */
export const ListAvailableLotsSchema = z.object({
    tipo_insumo: z.enum(TIPOS_INSUMO_CLINICO).optional(),
    // El contrato solo expone lotes disponibles; el flag existe para que el
    // cliente pueda declarar explícitamente su intención.
    disponibles: z
        .enum(["true", "false"])
        .optional()
        .refine((value) => value !== "false", {
            message: "El contrato v1 solo lista lotes con stock disponible.",
        }),
});

export type ListAvailableLotsInput = z.infer<typeof ListAvailableLotsSchema>;
