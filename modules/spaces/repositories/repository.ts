
import { SupabaseClient } from '@supabase/supabase-js';
import {
    CreateSpaceData,
    CreateSpaceInput,
    Space,
    SpaceFilters,
    SpaceInsert,
    SpaceRow,
    SpaceUpdate,
    UpdateSpaceInput
} from "@/modules/spaces/types/types";
import {Database} from "@/types/database";

export class SpaceRepositoryError extends Error {
    constructor(
        message: string,
        public readonly code?: string,
    ) {
        super(message);
        this.name = 'SpaceRepositoryError';
    }
}

function mapSpaceRowToDomain(row: SpaceRow): Space {
    return {
        id: row.id_espacio,
        shelterId: row.id_refugio,
        name: row.nombre_espacio,
        description: row.descripcion,
        capacity: row.capacidad,
        type: row.tipo ?? "",
        available: row.disponible,
    };
}

function mapSpaceToRow(
    data: CreateSpaceData
): Omit<SpaceInsert, 'id_espacio'> {
    return {
        id_refugio: data.shelterId,
        nombre_espacio: data.dto.name,
        descripcion: data.dto.description ?? null,
        capacidad: data.dto.capacity,
        tipo: data.dto.type ?? null,
        disponible: data.dto.available ?? true,
    };
}

export class SpaceRepository {
    constructor(private readonly supabase: SupabaseClient<Database>) {}

    /**
     * Crea un nuevo espacio
     */
    async create(space: CreateSpaceData): Promise<Space> {
        try {
            const insertData = mapSpaceToRow(space);

            const { data, error } = await this.supabase
                .from('espacio')
                .insert(insertData)
                .select()
                .single();

            if (error) {
                if (error.code === '23505') {
                    throw new SpaceRepositoryError(
                        'Ya existe un espacio con este nombre en el refugio',
                        'DUPLICATE_NAME'
                    );
                }
                throw new SpaceRepositoryError(
                    `Error al crear espacio: ${error.message}`,
                    error.code
                );
            }

            if (!data) {
                throw new SpaceRepositoryError('No se pudo crear el espacio');
            }

            return mapSpaceRowToDomain(data);
        } catch (error) {
            if (error instanceof SpaceRepositoryError) {
                throw error;
            }
            throw new SpaceRepositoryError(
                `Error inesperado al crear espacio: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    /**
      * Obtiene un espacio por su ID (filtrado por refugio para multitenant)
      */
     async findById(id: number, shelterId: number): Promise<Space | null> {
         try {
             const { data, error } = await this.supabase
                 .from('espacio')
                 .select()
                 .eq('id_espacio', id)
                 .eq('id_refugio', shelterId)
                 .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return null;
                }
                throw new SpaceRepositoryError(
                    `Error al buscar espacio: ${error.message}`,
                    error.code
                );
            }

            return data ? mapSpaceRowToDomain(data) : null;
        } catch (error) {
            if (error instanceof SpaceRepositoryError) {
                throw error;
            }
            throw new SpaceRepositoryError(
                `Error inesperado al buscar espacio: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    /**
     * Obtiene espacios con filtros
     */
    async findMany(filters?: SpaceFilters): Promise<Space[]> {
        try {
            let query = this.supabase.from('espacio').select();

            if (filters?.shelterId) {
                query = query.eq('id_refugio', filters.shelterId);
            }

            if (filters?.available !== undefined) {
                query = query.eq('disponible', filters.available);
            }

            if (filters?.type) {
                query = query.eq('tipo', filters.type);
            }

            if (filters?.searchTerm) {
                query = query.ilike('nombre_espacio', `%${filters.searchTerm}%`);
            }

            query = query.order('nombre_espacio', { ascending: true });

            const { data, error } = await query;

            if (error) {
                throw new SpaceRepositoryError(
                    `Error al buscar espacios: ${error.message}`,
                    error.code
                );
            }

            return data?.map(mapSpaceRowToDomain) ?? [];
        } catch (error) {
            if (error instanceof SpaceRepositoryError) {
                throw error;
            }
            throw new SpaceRepositoryError(
                `Error inesperado al buscar espacios: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    /**
     * Obtiene todos los espacios de un refugio
     */
    async findByShelterId(shelterId: number): Promise<Space[]> {
        return this.findMany({ shelterId });
    }

    /**
      * Actualiza un espacio
      */
     async update(id: number, dto: UpdateSpaceInput, shelterId: number): Promise<Space> {
         try {
             const updateData: SpaceUpdate = {};

             if (dto.name !== undefined) updateData.nombre_espacio = dto.name;
             if (dto.description !== undefined) updateData.descripcion = dto.description;
             if (dto.capacity !== undefined) updateData.capacidad = dto.capacity;
             if (dto.type !== undefined) updateData.tipo = dto.type;
             if (dto.available !== undefined) updateData.disponible = dto.available;

             const { data, error } = await this.supabase
                 .from('espacio')
                 .update(updateData)
                 .eq('id_espacio', id)
                 .eq('id_refugio', shelterId)
                 .select()
                 .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    throw new SpaceRepositoryError('Espacio no encontrado', 'NOT_FOUND');
                }
                throw new SpaceRepositoryError(
                    `Error al actualizar espacio: ${error.message}`,
                    error.code
                );
            }

            if (!data) {
                throw new SpaceRepositoryError('No se pudo actualizar el espacio');
            }

            return mapSpaceRowToDomain(data);
        } catch (error) {
            if (error instanceof SpaceRepositoryError) {
                throw error;
            }
            throw new SpaceRepositoryError(
                `Error inesperado al actualizar espacio: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    /**
      * Elimina un espacio (solo si no tiene animales asociados)
      */
     async delete(id: number, shelterId: number): Promise<void> {
         try {
             // Primero verificamos que no tenga animales asociados
             const { count, error: countError } = await this.supabase
                 .from('animal')
                 .select('*', { count: 'exact', head: true })
                 .eq('id_espacio', id);

             if (countError) {
                 throw new SpaceRepositoryError(
                     `Error al verificar animales asociados: ${countError.message}`,
                     countError.code
                 );
             }

             if (count && count > 0) {
                 throw new SpaceRepositoryError(
                     'No se puede eliminar el espacio porque tiene animales asociados',
                     'HAS_ANIMALS'
                 );
             }

             const { error } = await this.supabase
                 .from('espacio')
                 .delete()
                 .eq('id_espacio', id)
                 .eq('id_refugio', shelterId);

             if (error) {
                 if (error.code === 'PGRST116') {
                     throw new SpaceRepositoryError('Espacio no encontrado', 'NOT_FOUND');
                 }
                 throw new SpaceRepositoryError(
                     `Error al eliminar espacio: ${error.message}`,
                     error.code
                 );
             }
         } catch (error) {
             if (error instanceof SpaceRepositoryError) {
                 throw error;
             }
             throw new SpaceRepositoryError(
                 `Error inesperado al eliminar espacio: ${error instanceof Error ? error.message : 'Unknown error'}`
             );
         }
     }

    /**
     * Obtiene la cantidad de animales en un espacio
     */
    async getAnimalCount(spaceId: number): Promise<number> {
        try {
            const { count, error } = await this.supabase
                .from('animal')
                .select('*', { count: 'exact', head: true })
                .eq('id_espacio', spaceId);

            if (error) {
                throw new SpaceRepositoryError(
                    `Error al contar animales: ${error.message}`,
                    error.code
                );
            }

            return count ?? 0;
        } catch (error) {
            if (error instanceof SpaceRepositoryError) {
                throw error;
            }
            throw new SpaceRepositoryError(
                `Error inesperado al contar animales: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    /**
      * Verifica si un espacio está disponible (tiene capacidad libre)
      */
     async isSpaceAvailable(spaceId: number, shelterId: number): Promise<boolean> {
         try {
             const space = await this.findById(spaceId, shelterId);
             if (!space) {
                 throw new SpaceRepositoryError('Espacio no encontrado', 'NOT_FOUND');
             }

             if (!space.available) {
                 return false;
             }

             const animalCount = await this.getAnimalCount(spaceId);
             return animalCount < space.capacity;
         } catch (error) {
             if (error instanceof SpaceRepositoryError) {
                 throw error;
             }
             throw new SpaceRepositoryError(
                 `Error inesperado al verificar disponibilidad: ${error instanceof Error ? error.message : 'Unknown error'}`
             );
         }
     }
}