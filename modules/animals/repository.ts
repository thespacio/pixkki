// modules/animals/repository.ts
import {
    Animal,
    AnimalFilters, CreateAnimalInput,
    PaginatedAnimals, UpdateAnimalInput
} from './types';
import { AnimalNotFoundError, AnimalDeletedError } from './errors';
import {Database} from "@/types/database";
import {toAnimal, toAnimalInsert, toAnimalUpdate} from "@/modules/animals/mapper";
import {createSupabaseServerClient} from "@/lib/supabase/server-client";
import {SupabaseClient} from "@supabase/supabase-js";
export type AnimalRow =
    Database["public"]["Tables"]["animal"]["Row"];
export type AnimalInsert =
    Database['public']['Tables']['animal']['Insert'];
export type AnimalWithRelations = AnimalRow & {
    animal_estado: {
        id_estado: number;
        nombre_estado: string;
    } | null;
    espacio: {
        id_espacio: number;
        nombre_espacio: string;
    } | null;
};

export class AnimalRepository {
    constructor(
        private readonly supabase: SupabaseClient
    ){}
    /**
     * Busca todos los animales con filtros
     * Siempre retorna solo animales activos (no eliminados)
     */
    async findAll(filters: AnimalFilters): Promise<PaginatedAnimals> {
        let query = this.supabase
            .from('animal')
            .select(`
                *,
                animal_estado (
                  id_estado,
                  nombre_estado
                ),
                espacio (
                  id_espacio,
                  nombre_espacio
                )
              `, { count: 'exact' })
            .eq('activo', filters.activo !== undefined ? filters.activo : true)
            .is('deleted_at', null);

        if (filters.refugioId) {
            query = query.eq('id_refugio', filters.refugioId);
        }

        if (filters.especie) {
            query = query.eq('especie', filters.especie);
        }

        if (filters.estadoId) {
            query = query.eq('id_estado', filters.estadoId);
        }

        if (filters.esterilizado !== undefined) {
            query = query.eq('esterilizado', filters.esterilizado);
        }

        if (filters.search) {
            query = query.ilike('nombre', `%${filters.search}%`);
        }

        const limit = filters.limit || 20;
        const offset = filters.offset || 0;

        query = query
            .order('fecha_ingreso', { ascending: false })
            .range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            console.error('Error en AnimalRepository.findAll:', error);
            throw new Error(`Error al obtener animales: ${error.message}`);
        }

        const animals = (data || []).map(toAnimal);

        return {
            data: animals,
            total: count || 0,
            limit,
            offset
        };
    }

    /**
     * Busca un animal por ID
     * Lanza error si no existe o está eliminado
     */
    async findById(id: number, includeDeleted: boolean = false): Promise<Animal> {
        

        let query = this.supabase
            .from('animal')
            .select(`
                *,
                animal_estado (
                  id_estado,
                  nombre_estado
                ),
                espacio (
                  id_espacio,
                  nombre_espacio
                )
              `)
            .eq('id_animal', id);

        if (!includeDeleted) {
            query = query.eq('activo', true).is('deleted_at', null);
        }

        const { data, error } = await query.single();

        if (error) {
            if (error.code === 'PGRST116') {
                throw new AnimalNotFoundError(id);
            }
            console.error('Error en AnimalRepository.findById:', error);
            throw new Error(`Error al buscar animal: ${error.message}`);
        }

        return toAnimal(data);
    }

    /**
     * Crea un nuevo animal
     */
    async create(input: CreateAnimalInput, refugioId: number): Promise<Animal> {
        

        const db = toAnimalInsert(input, refugioId);

        const { data, error } = await this.supabase
            .from('animal')
            .insert(db)
            .select(`
                *,
                animal_estado (
                  id_estado,
                  nombre_estado
                ),
                espacio (
                  id_espacio,
                  nombre_espacio
                )
              `)
            .single();

        if (error) {
            console.error('Error en AnimalRepository.create:', error);
            throw new Error(`Error al crear animal: ${error.message}`);
        }

        return toAnimal(data);
    }

    /**
     * Actualiza un animal existente
     */
    async update(id: number, input: UpdateAnimalInput): Promise<Animal> {
        

        // Verificar que el animal existe y está activo
        await this.findById(id);

        // Obtener el animal actual para mantener valores no actualizados
        const currentAnimal = await this.findById(id);

        const { data, error } = await this.supabase
            .from('animal')
            .update(toAnimalUpdate(input))
            .eq('id_animal', id)
            .eq('activo', true)
            .is('deleted_at', null)
            .select(`
                *,
                animal_estado (
                  id_estado,
                  nombre_estado
                ),
                espacio (
                  id_espacio,
                  nombre_espacio
                )
              `)
            .single();

        if (error) {
            console.error('Error en AnimalRepository.update:', error);
            throw new Error(`Error al actualizar animal: ${error.message}`);
        }

        return toAnimal(data);
    }

    /**
     * Soft delete: marca el animal como eliminado
     */
    async softDelete(id: number): Promise<void> {
        

        await this.findById(id);

        const { error } = await this.supabase
            .from('animal')
            .update({
                activo: false,
                deleted_at: new Date().toISOString()
            })
            .eq('id_animal', id)
            .eq('activo', true)
            .is('deleted_at', null);

        if (error) {
            console.error('Error en AnimalRepository.softDelete:', error);
            throw new Error(`Error al eliminar animal: ${error.message}`);
        }
    }

    /**
     * Restaura un animal eliminado
     */
    async restore(id: number): Promise<Animal> {
        

        const { data, error } = await this.supabase
            .from('animal')
            .update({
                activo: true,
                deleted_at: null
            })
            .eq('id_animal', id)
            .eq('activo', false)
            .not('deleted_at', 'is', null)
            .select(`
                *,
                animal_estado (
                  id_estado,
                  nombre_estado
                ),
                espacio (
                  id_espacio,
                  nombre_espacio
                )
              `)
            .single();

        if (error) {
            console.error('Error en AnimalRepository.restore:', error);
            throw new Error(`Error al restaurar animal: ${error.message}`);
        }

        return toAnimal(data);
    }

    /**
     * Cuenta animales por refugio
     * Útil para estadísticas y validaciones
     */
    async countByShelter(refugioId: number, estado?: number): Promise<number> {
        

        let query = this.supabase
            .from('animal')
            .select('*', { count: 'exact', head: true })
            .eq('id_refugio', refugioId)
            .eq('activo', true)
            .is('deleted_at', null);

        if (estado) {
            query = query.eq('id_estado', estado);
        }

        const { count, error } = await query;

        if (error) {
            console.error('Error en AnimalRepository.countByShelter:', error);
            throw new Error(`Error al contar animales: ${error.message}`);
        }

        return count || 0;
    }

    /**
     * Obtiene el nombre del estado de un animal por su ID

     */
    async getEstadoNombreById(estadoId: number): Promise<string> {
        

        const { data, error } = await this.supabase
            .from('animal_estado')
            .select('nombre_estado')
            .eq('id_estado', estadoId)
            .single();

        if (error) {
            console.error('Error en AnimalRepository.getEstadoNombreById:', error);
            throw new Error(`Error al obtener nombre del estado: ${error.message}`);
        }

        return data?.nombre_estado;
    }

}