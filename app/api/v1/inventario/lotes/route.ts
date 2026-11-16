// app/api/v1/inventario/lotes/route.ts
// Contrato mínimo de inventario consumido por US10. El descuento de stock no
// se expone: ocurre dentro de la RPC registrar_evento_sanitario.
import type { NextRequest } from "next/server";
import { createInventoryService } from "@/modules/inventory/factories/create-inventory-service";
import { ListAvailableLotsSchema } from "@/modules/inventory/validators/inventory.validators";
import { getAnimalAccess } from "@/modules/animals/access";
import { AnimalClinicalForbiddenError } from "@/modules/animals/errors";
import { puedeEjecutarOperacionClinica } from "@/modules/animals/types/animales.types";
import { apiSuccess, apiValidationError, handleApiError } from "@/lib/api/responses";
import { requireAnimalUser } from "../../animales/route-helpers";

export async function GET(request: NextRequest) {
    try {
        const user = await requireAnimalUser();
        if (!puedeEjecutarOperacionClinica(user.role)) {
            throw new AnimalClinicalForbiddenError();
        }

        const parsed = ListAvailableLotsSchema.safeParse({
            tipo_insumo: request.nextUrl.searchParams.get("tipo_insumo") ?? undefined,
            disponibles: request.nextUrl.searchParams.get("disponibles") ?? undefined,
        });
        if (!parsed.success) return apiValidationError(parsed.error);

        const access = getAnimalAccess(user);
        const service = await createInventoryService();
        const lotes = await service.listAvailableLots(
            access.allShelters ? null : access.shelterId,
            parsed.data.tipo_insumo,
        );
        return apiSuccess({ lotes });
    } catch (error) {
        return handleApiError(error);
    }
}
