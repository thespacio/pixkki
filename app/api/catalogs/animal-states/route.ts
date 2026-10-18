import {AnimalStateService} from "@/modules/catalogs/animal-states/service";

const animalStateService = new AnimalStateService();

// GET /api/catalogs/animal-states
export async function GET(req: Request) {
    try {
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