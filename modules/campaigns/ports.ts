import type { AdoptableAnimal } from "@/modules/campaigns/types";

/**
 * Lo que el módulo de campañas necesita saber de los animales. Es un "puerto":
 * campañas no conoce la base ni los internos del módulo de animales, solo este
 * contrato. La implementación real está en `factories.ts`.
 */
export interface AdoptableAnimalsPort {
    /**
     * Animales disponibles para adopción (activos y no dados de baja).
     * Sin `shelterId` devuelve los de TODOS los albergues: el servicio solo lo
     * permite al superadmin.
     */
    listAdoptable(scope: { shelterId?: number }): Promise<AdoptableAnimal[]>;
}
