// modules/users/repository.ts

import { SupabaseClient } from '@supabase/supabase-js';
import {Database} from "@/types/database";
import {User, UserQueryParams} from "@/modules/users/types";
import {mapUserDomainToInsert, mapUserDomainToUpdate, mapUserRowToDomain} from "@/modules/users/mappers";
export type UserRow = Database["public"]["Tables"]["usuario"]["Row"];
export type UserInsert = Database["public"]["Tables"]["usuario"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["usuario"]["Update"];

export class UserRepository {
    constructor(private readonly supabase: SupabaseClient<Database>) {}

    /**
     * Busca un usuario por su ID
     */
    async findById(id: number): Promise<User | null> {
        const { data, error } = await this.supabase
            .from('usuario')
            .select('*')
            .eq('id_usuario', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Error al buscar usuario: ${error.message}`);
        }

        return data ? mapUserRowToDomain(data) : null;
    }

    /**
     * Busca un usuario por su auth_user_id
     */
    async findByAuthUserId(authUserId: string): Promise<User | null> {
        const { data, error } = await this.supabase
            .from('usuario')
            .select('*')
            .eq('auth_user_id', authUserId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Error al buscar usuario por Auth ID: ${error.message}`);
        }

        return data ? mapUserRowToDomain(data) : null;
    }

    /**
     * Busca un usuario por su correo
     */
    async findByEmail(correo: string): Promise<User | null> {
        const { data, error } = await this.supabase
            .from('usuario')
            .select('*')
            .eq('correo', correo)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Error al buscar usuario por correo: ${error.message}`);
        }

        return data ? mapUserRowToDomain(data) : null;
    }

    /**
     * Obtiene todos los usuarios con filtros y paginación
     */
    async findAll(params: UserQueryParams = {}): Promise<{
        data: User[];
        total: number;
    }> {
        let query = this.supabase
            .from('usuario')
            .select('*', { count: 'exact', head: false });

        if (params.refugioId) {
            query = query.eq('id_refugio', params.refugioId);
        }

        if (params.rol !== undefined) {
            query = query.eq('rol', params.rol);
        }

        if (params.activo !== undefined) {
            query = query.eq('activo', params.activo);
        }

        if (params.search) {
            query = query.or(
                `nombre_completo.ilike.%${params.search}%,` +
                `correo.ilike.%${params.search}%`
            );
        }

        query = query.order('nombre_completo', { ascending: true });

        if (params.limit !== undefined) {
            query = query.limit(params.limit);
        }

        if (params.offset !== undefined) {
            query = query.range(params.offset, params.offset + (params.limit || 20) - 1);
        }

        const { data, error, count } = await query;

        if (error) {
            throw new Error(`Error al listar usuarios: ${error.message}`);
        }

        return {
            data: data ? data.map(mapUserRowToDomain) : [],
            total: count || 0
        };
    }

    /**
     * Crea un nuevo usuario
     */
    async create(data: Omit<User, 'id' | 'fechaCreacion' | 'ultimoLogin'>): Promise<User> {
        const insertData = mapUserDomainToInsert(data);

        const { data: result, error } = await this.supabase
            .from('usuario')
            .insert(insertData)
            .select()
            .single();

        if (error) {
            throw new Error(`Error al crear usuario: ${error.message}`);
        }

        if (!result) {
            throw new Error('No se pudo crear el usuario');
        }

        return mapUserRowToDomain(result);
    }

    /**
     * Actualiza un usuario existente
     */
    async update(id: number, updates: Partial<Omit<User, 'id' | 'fechaCreacion'>>): Promise<User> {
        const updateData = mapUserDomainToUpdate(updates);

        const { data, error } = await this.supabase
            .from('usuario')
            .update(updateData)
            .eq('id_usuario', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                throw new Error(`Usuario con ID ${id} no encontrado`);
            }
            throw new Error(`Error al actualizar usuario: ${error.message}`);
        }

        if (!data) {
            throw new Error(`Usuario con ID ${id} no encontrado`);
        }

        return mapUserRowToDomain(data);
    }

    /**
     * Actualiza solo el estado activo del usuario
     */
    async updateStatus(id: number, activo: boolean): Promise<User> {
        const { data, error } = await this.supabase
            .from('usuario')
            .update({ activo })
            .eq('id_usuario', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                throw new Error(`Usuario con ID ${id} no encontrado`);
            }
            throw new Error(`Error al actualizar estado: ${error.message}`);
        }

        if (!data) {
            throw new Error(`Usuario con ID ${id} no encontrado`);
        }

        return mapUserRowToDomain(data);
    }

    /**
     * Actualiza el último login del usuario
     */
    async updateLastLogin(id: number): Promise<void> {
        const { error } = await this.supabase
            .from('usuario')
            .update({ ultimo_login: new Date().toISOString() })
            .eq('id_usuario', id);

        if (error) {
            throw new Error(`Error al actualizar último login: ${error.message}`);
        }
    }

    /**
     * Elimina un usuario
     */
    async delete(id: number): Promise<void> {
        const { error } = await this.supabase
            .from('usuario')
            .delete()
            .eq('id_usuario', id);

        if (error) {
            throw new Error(`Error al eliminar usuario: ${error.message}`);
        }
    }

    /**
     * Verifica si existe un usuario en el refugio
     */
    async existsInShelter(userId: number, shelterId: number): Promise<boolean> {
        const { count, error } = await this.supabase
            .from('usuario')
            .select('*', { count: 'exact', head: true })
            .eq('id_usuario', userId)
            .eq('id_refugio', shelterId);

        if (error) {
            throw new Error(`Error al verificar usuario en refugio: ${error.message}`);
        }

        return (count || 0) > 0;
    }

    /**
     * Obtiene usuarios por refugio
     */
    async findByShelter(shelterId: number): Promise<User[]> {
        const { data, error } = await this.supabase
            .from('usuario')
            .select('*')
            .eq('id_refugio', shelterId)
            .order('nombre_completo', { ascending: true });

        if (error) {
            throw new Error(`Error al obtener usuarios del refugio: ${error.message}`);
        }

        return data ? data.map(mapUserRowToDomain) : [];
    }
}