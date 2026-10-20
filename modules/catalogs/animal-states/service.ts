import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

export type AnimalEstado = Database['public']['Tables']['animal_estado']['Row'];

export class AnimalStateService {
    constructor(private readonly supabase: SupabaseClient<Database>) {}

    async getAllStates(): Promise<string[]> {
        const { data, error } = await this.supabase
            .from('animal_estado')
            .select('nombre_estado')
            .order('nombre_estado', { ascending: true });

        if (error) {
            throw new Error(`Error al obtener estados: ${error.message}`);
        }

        return data?.map((item) => item.nombre_estado) ?? [];
    }
}
