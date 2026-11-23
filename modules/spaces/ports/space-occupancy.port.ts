import type { Space, SpaceFilters } from "../types/types";

/** Vista de un espacio con su ocupación calculada (RF3.1). */
export type SpaceWithOccupancy = Space & {
    ocupacion: number;
    capacidadLibre: number;
    estadoTexto: string;
};

/**
 * Espacio con ocupación opcional. Permite que los formularios que necesitan
 * cupo acepten tanto espacios con ocupación calculada como `Space` simple
 * (consumidores antiguos y tests que aún no calculan ocupación).
 */
export type SpaceWithOptionalOccupancy = Space &
    Partial<Pick<SpaceWithOccupancy, "ocupacion" | "capacidadLibre" | "estadoTexto">>;

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
