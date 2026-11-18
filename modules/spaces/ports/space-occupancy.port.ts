import type { Space, SpaceFilters } from "../types/types";

/** Vista de un espacio con su ocupación calculada (RF3.1). */
export type SpaceWithOccupancy = Space & {
    ocupacion: number;
    capacidadLibre: number;
    estadoTexto: string;
};

export type SpaceOccupancyInfo = {
    idEspacio: number;
    disponible: boolean;
    ocupacion: number;
    capacidad: number;
    capacidadLibre: number;
};

/**
 * Superficie pública del módulo spaces consumida por animals.
 * No expone Supabase ni detalles de persistencia.
 */
export interface SpaceOccupancyPort {
    listWithOccupancy(filters?: SpaceFilters): Promise<SpaceWithOccupancy[]>;
    getOccupancy(
        idEspacio: number,
        idRefugio?: number,
    ): Promise<SpaceOccupancyInfo | null>;
}
