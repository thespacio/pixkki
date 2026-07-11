// modules/shelters/repository.ts

import { SupabaseClient } from '@supabase/supabase-js';

import {Database} from "@/types/database";
import {Shelter, ShelterListItem, ShelterQueryParams} from "@/modules/shelters/types";
import {ShelterNotFoundError, ShelterRepositoryError} from "@/modules/shelters/errors";
import { mapShelterRowToDomain, mapShelterRowToListItem, mapShelterToRow } from "./mapper";

// ===== TIPOS DE SUPABASE =====
export type ShelterRow = Database["public"]["Tables"]["refugio"]["Row"];
export type ShelterInsert = Database["public"]["Tables"]["refugio"]["Insert"];
export type ShelterUpdate = Database["public"]["Tables"]["refugio"]["Update"];

// ===== REPOSITORY =====
export class ShelterRepository {
    constructor(
        private readonly supabase: SupabaseClient<Database>
    ) {}

    /**
     * Busca un refugio por su ID
     * @throws {ShelterNotFoundError} Si no existe el refugio
     * @throws {ShelterRepositoryError} Si hay error en la consulta
     */
    async findById(id: number): Promise<Shelter> {
        try {
            const { data, error } = await this.supabase
                .from('refugio')
                .select('*')
                .eq('id_refugio', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    throw new ShelterNotFoundError(id);
                }
                throw new ShelterRepositoryError(
                    `Error al buscar refugio por ID: ${error.message}`,
                    error.code
                );
            }

            if (!data) {
                throw new ShelterNotFoundError(id);
            }

            return mapShelterRowToDomain(data);
        } catch (error){
                console.log(error);
            if (error instanceof ShelterNotFoundError ||
                error instanceof ShelterRepositoryError) {
                throw error;
            }
            throw new ShelterRepositoryError(
                `Error inesperado al buscar refugio: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    /**
     * Busca un refugio por su nombre (exacto, para validación de duplicados)
     * @returns Shelter | null
     */
    async findByName(nombre: string): Promise<Shelter | null> {
        try {
            const { data, error } = await this.supabase
                .from('refugio')
                .select('*')
                .ilike('nombre', nombre)
                .maybeSingle();

            if (error) {
                throw new ShelterRepositoryError(
                    `Error al buscar refugio por nombre: ${error.message}`,
                    error.code
                );
            }

            return data ? mapShelterRowToDomain(data) : null;
        } catch (error) {
            if (error instanceof ShelterRepositoryError) {
                throw error;
            }
            throw new ShelterRepositoryError(
                `Error inesperado al buscar refugio por nombre: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    /**
     * Obtiene todos los refugios con filtros y paginación
     * @returns { data: ShelterListItem[], total: number }
     */
    async findAll(params: ShelterQueryParams = {}): Promise<{
        data: ShelterListItem[];
        total: number;
    }> {
        try {
            let query = this.supabase
                .from('refugio')
                .select('*', { count: 'exact', head: false });

            // Aplicar filtros
            if (params.ciudad) {
                query = query.ilike('ciudad', `%${params.ciudad}%`);
            }

            if (params.estado) {
                query = query.ilike('estado', `%${params.estado}%`);
            }

            if (params.activo !== undefined) {
                query = query.eq('activo', params.activo);
            }

            if (params.search) {
                query = query.or(
                    `nombre.ilike.%${params.search}%,` +
                    `ciudad.ilike.%${params.search}%,` +
                    `estado.ilike.%${params.search}%`
                );
            }

            // Aplicar ordenamiento (por defecto por nombre)
            query = query.order('nombre', { ascending: true });

            // Aplicar paginación
            if (params.limit !== undefined) {
                query = query.limit(params.limit);
            }

            if (params.offset !== undefined) {
                query = query.range(params.offset, params.offset + (params.limit || 20) - 1);
            }

            const { data, error, count } = await query;

            if (error) {
                throw new ShelterRepositoryError(
                    `Error al listar refugios: ${error.message}`,
                    error.code
                );
            }

            return {
                data: data ? data.map(mapShelterRowToListItem) : [],
                total: count || 0
            };
        } catch (error) {
            if (error instanceof ShelterRepositoryError) {
                throw error;
            }
            throw new ShelterRepositoryError(
                `Error inesperado al listar refugios: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    /**
     * Crea un nuevo refugio en la base de datos
     * @returns Shelter creado
     */
    async create(shelterData: Omit<Shelter, 'id' | 'fecha_registro' | 'activo'>): Promise<Shelter> {
        try {
            const insertData: ShelterInsert = {
                ...mapShelterToRow(shelterData),
                fecha_registro: new Date().toISOString(),
                activo: true
            };

            const { data, error } = await this.supabase
                .from('refugio')
                .insert(insertData)
                .select()
                .single();

            if (error) {
                // Verificar si es error de duplicado (asumiendo que hay unique constraint en nombre)
                if (error.code === '23505') {
                    throw new ShelterRepositoryError(
                        'Ya existe un refugio con este nombre',
                        'DUPLICATE_NAME'
                    );
                }
                throw new ShelterRepositoryError(
                    `Error al crear refugio: ${error.message}`,
                    error.code
                );
            }

            if (!data) {
                throw new ShelterRepositoryError('No se pudo crear el refugio');
            }

            return mapShelterRowToDomain(data);
        } catch (error) {
            if (error instanceof ShelterRepositoryError) {
                throw error;
            }
            throw new ShelterRepositoryError(
                `Error inesperado al crear refugio: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    /**
     * Actualiza un refugio existente
     * @returns Shelter actualizado
     * @throws {ShelterNotFoundError} Si no existe el refugio
     */
    async update(id: number, updates: Partial<Omit<Shelter, 'id' | 'fecha_registro'>>): Promise<Shelter> {
        try {
            // Primero verificamos que existe
            await this.findById(id);

            const updateData: ShelterUpdate = mapShelterToRow(updates);

            const { data, error } = await this.supabase
                .from('refugio')
                .update(updateData)
                .eq('id_refugio', id)
                .select()
                .single();

            if (error) {
                if (error.code === '23505') {
                    throw new ShelterRepositoryError(
                        'Ya existe otro refugio con este nombre',
                        'DUPLICATE_NAME'
                    );
                }
                throw new ShelterRepositoryError(
                    `Error al actualizar refugio: ${error.message}`,
                    error.code
                );
            }

            if (!data) {
                throw new ShelterNotFoundError(id);
            }

            return mapShelterRowToDomain(data);
        } catch (error) {
            if (error instanceof ShelterNotFoundError ||
                error instanceof ShelterRepositoryError) {
                throw error;
            }
            throw new ShelterRepositoryError(
                `Error inesperado al actualizar refugio: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    /**
     * Actualiza solo el estado activo del refugio
     * @returns Shelter actualizado
     */
    async updateStatus(id: number, activo: boolean): Promise<Shelter> {
        try {
            const { data, error } = await this.supabase
                .from('refugio')
                .update({ activo })
                .eq('id_refugio', id)
                .select()
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    throw new ShelterNotFoundError(id);
                }
                throw new ShelterRepositoryError(
                    `Error al actualizar estado del refugio: ${error.message}`,
                    error.code
                );
            }

            if (!data) {
                throw new ShelterNotFoundError(id);
            }

            return mapShelterRowToDomain(data);
        } catch (error) {
            if (error instanceof ShelterNotFoundError ||
                error instanceof ShelterRepositoryError) {
                throw error;
            }
            throw new ShelterRepositoryError(
                `Error inesperado al actualizar estado: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    /**
     * Elimina un refugio (físicamente de la BD)
     * @throws {ShelterNotFoundError} Si no existe el refugio
     * @throws {ShelterRepositoryError} Si hay error en la eliminación
     */
    async delete(id: number): Promise<void> {
        try {
            // Primero verificamos que existe
            await this.findById(id);

            const { error } = await this.supabase
                .from('refugio')
                .delete()
                .eq('id_refugio', id);

            if (error) {
                throw new ShelterRepositoryError(
                    `Error al eliminar refugio: ${error.message}`,
                    error.code
                );
            }
        } catch (error) {
            if (error instanceof ShelterNotFoundError ||
                error instanceof ShelterRepositoryError) {
                throw error;
            }
            throw new ShelterRepositoryError(
                `Error inesperado al eliminar refugio: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    /**
     * Verifica si existe un refugio con un nombre dado (excluyendo un ID opcional)
     * Útil para validaciones de unicidad en actualizaciones
     */
    async existsByName(nombre: string, excludeId?: number): Promise<boolean> {
        try {
            let query = this.supabase
                .from('refugio')
                .select('id_refugio', { count: 'exact', head: true })
                .ilike('nombre', nombre);

            if (excludeId) {
                query = query.neq('id_refugio', excludeId);
            }

            const { count, error } = await query;

            if (error) {
                throw new ShelterRepositoryError(
                    `Error al verificar existencia por nombre: ${error.message}`,
                    error.code
                );
            }

            return (count || 0) > 0;
        } catch (error) {
            if (error instanceof ShelterRepositoryError) {
                throw error;
            }
            throw new ShelterRepositoryError(
                `Error inesperado al verificar existencia: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    /**
     * Obtiene estadísticas básicas de refugios
     * Útil para dashboards o métricas
     */
    async getStatistics(): Promise<{
        total: number;
        activos: number;
        inactivos: number;
        byCiudad: Record<string, number>;
        byEstado: Record<string, number>;
    }> {
        try {
            // Obtener totales
            const { count: total, error: totalError } = await this.supabase
                .from('refugio')
                .select('*', { count: 'exact', head: true });

            if (totalError) {
                throw new ShelterRepositoryError(
                    `Error al obtener total de refugios: ${totalError.message}`,
                    totalError.code
                );
            }

            // Obtener activos
            const { count: activos, error: activosError } = await this.supabase
                .from('refugio')
                .select('*', { count: 'exact', head: true })
                .eq('activo', true);

            if (activosError) {
                throw new ShelterRepositoryError(
                    `Error al obtener refugios activos: ${activosError.message}`,
                    activosError.code
                );
            }

            // Obtener agrupación por ciudad
            const { data: byCiudadData, error: ciudadError } = await this.supabase
                .from('refugio')
                .select('ciudad')
                .not('ciudad', 'is', null);

            if (ciudadError) {
                throw new ShelterRepositoryError(
                    `Error al agrupar por ciudad: ${ciudadError.message}`,
                    ciudadError.code
                );
            }

            // Obtener agrupación por estado
            const { data: byEstadoData, error: estadoError } = await this.supabase
                .from('refugio')
                .select('estado')
                .not('estado', 'is', null);

            if (estadoError) {
                throw new ShelterRepositoryError(
                    `Error al agrupar por estado: ${estadoError.message}`,
                    estadoError.code
                );
            }

            // Procesar agrupaciones
            const byCiudad: Record<string, number> = {};
            byCiudadData?.forEach(item => {
                if (item.ciudad) {
                    byCiudad[item.ciudad] = (byCiudad[item.ciudad] || 0) + 1;
                }
            });

            const byEstado: Record<string, number> = {};
            byEstadoData?.forEach(item => {
                if (item.estado) {
                    byEstado[item.estado] = (byEstado[item.estado] || 0) + 1;
                }
            });

            return {
                total: total || 0,
                activos: activos || 0,
                inactivos: (total || 0) - (activos || 0),
                byCiudad,
                byEstado
            };
        } catch (error) {
            if (error instanceof ShelterRepositoryError) {
                throw error;
            }
            throw new ShelterRepositoryError(
                `Error inesperado al obtener estadísticas: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }
}