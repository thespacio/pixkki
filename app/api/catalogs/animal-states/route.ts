import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { AnimalStateService } from '@/modules/catalogs/animal-states/service';

export async function GET() {
    try {
        const supabase = await createSupabaseServerClient();
        const animalStateService = new AnimalStateService(supabase);
        const stateNames = await animalStateService.getAllStates();
        return new Response(JSON.stringify(stateNames), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Error al obtener los estados' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}