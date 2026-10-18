import {Database} from "@/types/database";
import {CreateSpaceSchema, SpaceFiltersSchema, SpaceSchema, UpdateSpaceSchema} from "@/modules/spaces/schemas";
import {z} from "zod";

export type SpaceRow = Database['public']['Tables']['espacio']['Row'];
export type SpaceInsert = Database['public']['Tables']['espacio']['Insert'];
export type SpaceUpdate = Database['public']['Tables']['espacio']['Update'];

export type Space = z.infer<typeof SpaceSchema>;
export type CreateSpaceInput = z.infer<typeof CreateSpaceSchema>;
export type UpdateSpaceInput = z.infer<typeof UpdateSpaceSchema>;
export type SpaceFilters = z.infer<typeof SpaceFiltersSchema>;


export interface CreateSpaceData {
    dto: CreateSpaceInput;
    shelterId: number;
}

/*export interface SpaceFilters {
    shelterId?: number;
    available?: boolean;
    type?: string;
    searchTerm?: string;
}*/

