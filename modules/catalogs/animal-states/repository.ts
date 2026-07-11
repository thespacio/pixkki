// types.ts
import {Database} from "@/types/database";

export type AnimalEstadoRow = Database["public"]["Tables"]["animal_estado"]["Row"];
export type AnimalEstadoInsert = Database["public"]["Tables"]["animal_estado"]["Insert"];
export type AnimalEstadoUpdate = Database["public"]["Tables"]["animal_estado"]["Update"];

// repository.tsimport {createSupabaseServerClient} from "@/lib/supabase/server-client";
import {AnimalState} from "@/modules/catalogs/animal-states/types";

export class AnimalStateRepository {
    /**
     * Obtiene solo los nombres de los estados de la tabla animal_estado
     * @returns Promise<string[]> - Lista de nombres de estados
     */
    async getStateNames(): Promise<string[]> {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
            .from('animal_estado')
            .select('nombre_estado');

        if (error) {
            throw new Error(`Error al obtener los nombres de estados: ${error.message}`);
        }

        return data.map((item: { nombre_estado: string }) => item.nombre_estado);
    }

    /**
     * Obtiene todos los estados con todos sus campos
     * @returns Promise<AnimalState[]> - Lista completa de estados
     */
    async getAllStates(): Promise<AnimalState[]> {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
            .from('animal_estado')
            .select('id_estado, nombre_estado');

        if (error) {
            throw new Error(`Error al obtener los estados: ${error.message}`);
        }
        return data as AnimalState[];
    }

 /*   /!**
     * Obtiene un estado por su ID
     * @param id - ID del estado
     * @returns Promise<AnimalEstadoRow | null> - Estado encontrado o null
     *!/
    async getStateById(id: number): Promise<AnimalEstadoRow | null> {
        const { data, error } = await supabase
            .from('animal_estado')
            .select('*')
            .eq('id_estado', id)
            .single();

        if (error) {
            throw new Error(`Error al obtener el estado: ${error.message}`);
        }

        return data;
    }

    /!**
     * Crea un nuevo estado
     * @param state - Datos del estado a crear
     * @returns Promise<AnimalEstadoRow> - Estado creado
     *!/
    async createState(state: AnimalEstadoInsert): Promise<AnimalEstadoRow> {
        const { data, error } = await supabase
            .from('animal_estado')
            .insert(state)
            .select()
            .single();

        if (error) {
            throw new Error(`Error al crear el estado: ${error.message}`);
        }

        return data;
    }

    /!**
     * Actualiza un estado existente
     * @param id - ID del estado a actualizar
     * @param state - Datos a actualizar
     * @returns Promise<AnimalEstadoRow> - Estado actualizado
     *!/
    async updateState(id: number, state: AnimalEstadoUpdate): Promise<AnimalEstadoRow> {
        const { data, error } = await supabase
            .from('animal_estado')
            .update(state)
            .eq('id_estado', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Error al actualizar el estado: ${error.message}`);
        }

        return data;
    }

    /!**
     * Elimina un estado por su ID
     * @param id - ID del estado a eliminar
     * @returns Promise<void>
     *!/
    async deleteState(id: number): Promise<void> {
        const { error } = await supabase
            .from('animal_estado')
            .delete()
            .eq('id_estado', id);

        if (error) {
            throw new Error(`Error al eliminar el estado: ${error.message}`);
        }
    }
*/}