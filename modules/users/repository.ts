// modules/users/repository.ts

import {SupabaseClient} from '@supabase/supabase-js';
import {Database} from "@/types/database";
import {GlobalUserItem, User, UserQueryParams} from "@/modules/users/types";
import {mapUserDomainToInsert, mapUserDomainToUpdate, mapUserRowToDomain} from "@/modules/users/mappers";
export type UserRow = Database["public"]["Tables"]["usuario"]["Row"];
export type UserInsert = Database["public"]["Tables"]["usuario"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["usuario"]["Update"];

/** Fila de la vista global con el join a refugio (F-USERS-03) */
type GlobalUserRow = UserRow & {
    refugio: { nombre: string } | { nombre: string }[] | null;
};

export class UserRepositoryError extends Error {
    constructor(
        message: string,
        public readonly code?: string,
    ) {
        super(message);
        this.name = 'UserRepositoryError';
    }
}

export class UserRepository {
    constructor(private readonly supabase: SupabaseClient<Database>) {}

    /**
     * Busca un usuario por su ID (filtrado por refugio para multitenant)
     */
    async findById(id: number, refugioId: number): Promise<User | null> {
        const { data, error } = await this.supabase
            .from('usuario')
            .select('*')
            .eq('id_usuario', id)
            .eq('id_refugio', refugioId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new UserRepositoryError(
                `Error al buscar usuario: ${error.message}`,
                error.code,
            );
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
            throw new UserRepositoryError(
                `Error al buscar usuario por Auth ID: ${error.message}`,
                error.code,
            );
        }

        return data ? mapUserRowToDomain(data) : null;
    }

    /**
     * Busca un usuario por su correo.
     * Case-insensitive exacto (ilike sin comodines) y tolerante a
     * duplicados preexistentes (limit(1) en vez de single).
     */
    async findByEmail(correo: string): Promise<User | null> {
        const { data, error } = await this.supabase
            .from('usuario')
            .select('*')
            .ilike('correo', correo)
            .limit(1);

        if (error) {
            throw new UserRepositoryError(
                `Error al buscar usuario por correo: ${error.message}`,
                error.code,
            );
        }

        return data && data[0] ? mapUserRowToDomain(data[0]) : null;
    }

    /**
     * Busca un usuario por su correo en cualquier refugio (unicidad global).
     * Usada para validar F-USERS-04 antes de crear una cuenta.
     * Case-insensitive exacto y tolerante a duplicados preexistentes.
     */
    async findGlobalByEmail(correo: string): Promise<User | null> {
        const { data, error } = await this.supabase
            .from('usuario')
            .select('*')
            .ilike('correo', correo)
            .limit(1);

        if (error) {
            throw new UserRepositoryError(
                `Error al verificar unicidad global del correo: ${error.message}`,
                error.code,
            );
        }

        return data && data[0] ? mapUserRowToDomain(data[0]) : null;
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
            // Sanea caracteres especiales de la sintaxis de filtros de
            // PostgREST para que la búsqueda textual no rompa el `.or()`
            const term = params.search.replace(/[(),]/g, ' ').trim();

            if (term) {
                query = query.or(
                    `nombre_completo.ilike.%${term}%,` +
                    `correo.ilike.%${term}%`
                );
            }
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
            throw new UserRepositoryError(
                `Error al listar usuarios: ${error.message}`,
                error.code,
            );
        }

        return {
            data: data ? data.map(mapUserRowToDomain) : [],
            total: count || 0
        };
    }

    /**
     * Vista global de usuarios (F-USERS-03): todos los refugios, con el
     * nombre del refugio al que pertenece cada usuario.
     */
    async findAllGlobal(params: UserQueryParams = {}): Promise<{
        data: GlobalUserItem[];
        total: number;
    }> {
        try {
            let query = this.supabase
                .from('usuario')
                .select('*, refugio!fk_usuario_refugio(nombre)', { count: 'exact', head: false });

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
                const term = params.search.replace(/[(),]/g, ' ').trim();

                if (term) {
                    query = query.or(
                        `nombre_completo.ilike.%${term}%,` +
                        `correo.ilike.%${term}%`
                    );
                }
            }

            query = query.order('nombre_completo', { ascending: true });

            const limit = params.limit ?? 50;
            const offset = params.offset ?? 0;
            query = query.range(offset, offset + limit - 1);

            const { data, error, count } = await query.returns<GlobalUserRow[]>();

            if (error) {
                throw new UserRepositoryError(
                    `Error al listar usuarios globalmente: ${error.message}`,
                    error.code,
                );
            }

            const items: GlobalUserItem[] = (data ?? []).map((row) => {
                const refugio = Array.isArray(row.refugio) ? row.refugio[0] : row.refugio;

                return {
                    ...mapUserRowToDomain(row),
                    shelterNombre: refugio?.nombre ?? null,
                };
            });

            return {
                data: items,
                total: count ?? items.length,
            };
        } catch (error) {
            if (error instanceof UserRepositoryError) {
                throw error;
            }
            throw new UserRepositoryError(
                `Error inesperado al listar usuarios globalmente: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
            );
        }
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
            throw new UserRepositoryError(
                `Error al crear usuario: ${error.message}`,
                error.code,
            );
        }

        if (!result) {
            throw new UserRepositoryError('No se pudo crear el usuario');
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
                throw new UserRepositoryError(
                    `Usuario con ID ${id} no encontrado`,
                    'NOT_FOUND',
                );
            }
            throw new UserRepositoryError(
                `Error al actualizar usuario: ${error.message}`,
                error.code,
            );
        }

        if (!data) {
            throw new UserRepositoryError(
                `Usuario con ID ${id} no encontrado`,
                'NOT_FOUND',
            );
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
                throw new UserRepositoryError(
                    `Usuario con ID ${id} no encontrado`,
                    'NOT_FOUND',
                );
            }
            throw new UserRepositoryError(
                `Error al actualizar estado: ${error.message}`,
                error.code,
            );
        }

        if (!data) {
            throw new UserRepositoryError(
                `Usuario con ID ${id} no encontrado`,
                'NOT_FOUND',
            );
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
            throw new UserRepositoryError(
                `Error al actualizar último login: ${error.message}`,
                error.code,
            );
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
            throw new UserRepositoryError(
                `Error al eliminar usuario: ${error.message}`,
                error.code,
            );
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
            throw new UserRepositoryError(
                `Error al verificar usuario en refugio: ${error.message}`,
                error.code,
            );
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
            throw new UserRepositoryError(
                `Error al obtener usuarios del refugio: ${error.message}`,
                error.code,
            );
        }

        return data ? data.map(mapUserRowToDomain) : [];
    }
}
