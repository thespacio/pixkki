import {createSupabaseServerClient} from "@/lib/supabase/server-client";
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
}
