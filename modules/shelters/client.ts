// modules/shelters/client.ts
// Cliente para interactuar con la API de shelters desde el frontend

/**
 * Cliente para operaciones de shelters
 * Todas las funciones manejan la comunicación con la API
 */
export class ShelterClient {
    private baseUrl: string;

    constructor(baseUrl: string = '/api/shelters') {
        this.baseUrl = baseUrl;
    }

    /**
     * Obtiene todos los refugios con filtros opcionales
     */
    async fetchAll(filters?: {
        ciudad?: string;
        estado?: string;
        activo?: boolean;
        search?: string;
        limit?: number;
        offset?: number;
    }){
        const params = new URLSearchParams();

        if (filters?.ciudad) params.append('ciudad', filters.ciudad);
        if (filters?.estado) params.append('estado', filters.estado);
        if (filters?.activo !== undefined) params.append('activo', String(filters.activo));
        if (filters?.search) params.append('search', filters.search);
        if (filters?.limit) params.append('limit', String(filters.limit));
        if (filters?.offset) params.append('offset', String(filters.offset));

        const response = await fetch(`${this.baseUrl}?${params.toString()}`);

        if (!response.ok) {
            const error = await response.json();
            console.error('Error fetching shelters:', error);
            throw new Error(error.error?.message || 'Error al obtener refugios');
        }

        return response.json();
    }

    /**
     * Obtiene un refugio por su ID
     */
    async fetchById(id: string){
        const response = await fetch(`${this.baseUrl}/${id}`);

        if (!response.ok) {
            const error = await response.json();
            console.error(`Error fetching shelter ${id}:`, error);
            throw new Error(error.error?.message || 'Error al obtener el refugio');
        }

        return response.json();
    }

    /**
     * Crea un nuevo refugio
     */
    async create(data: {
        nombre: string;
        ciudad: string;
        estado: string;
        correo_contacto?: string | null;
        telefono?: string | null;
    }){
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Error creating shelter:', error);
            throw new Error(error.error?.message || 'Error al crear el refugio');
        }

        return response.json();
    }

    /**
     * Actualiza un refugio existente
     */
    async update(
        id: string,
        data: {
            nombre?: string;
            ciudad?: string;
            estado?: string;
            correo_contacto?: string | null;
            telefono?: string | null;
            activo?: boolean;
        }
    ){
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error(`Error updating shelter ${id}:`, error);
            throw new Error(error.error?.message || 'Error al actualizar el refugio');
        }

        return response.json();
    }

    /**
     * Elimina un refugio
     */
    async delete(id: string){
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const error = await response.json();
            console.error(`Error deleting shelter ${id}:`, error);
            throw new Error(error.error?.message || 'Error al eliminar el refugio');
        }

        return response.json();
    }

    /**
     * Cambia el estado activo/inactivo de un refugio
     */
    async toggleStatus(id: string, activo: boolean){
        return this.update(id, { activo });
    }
}

// ===== FUNCIONES DE UTILIDAD (para uso directo sin instanciar la clase) =====

/**
 * Función helper para obtener refugios con filtros
 * @deprecated Usar ShelterClient.fetchAll() en su lugar
 */
export async function fetchShelters(filters?: {
    ciudad?: string;
    estado?: string;
    activo?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
}) {
    const client = new ShelterClient();
    return client.fetchAll(filters);
}

/**
 * Función helper para obtener un refugio por ID
 * @deprecated Usar ShelterClient.fetchById() en su lugar
 */
export async function fetchShelterById(id: string) {
    const client = new ShelterClient();
    return client.fetchById(id);
}

/**
 * Función helper para crear un refugio
 * @deprecated Usar ShelterClient.create() en su lugar
 */
export async function createShelter(data: {
    nombre: string;
    ciudad: string;
    estado: string;
    correo_contacto?: string | null;
    telefono?: string | null;
}) {
    const client = new ShelterClient();
    return client.create(data);
}

/**
 * Función helper para actualizar un refugio
 * @deprecated Usar ShelterClient.update() en su lugar
 */
export async function updateShelter(
    id: string,
    data: {
        nombre?: string;
        ciudad?: string;
        estado?: string;
        correo_contacto?: string | null;
        telefono?: string | null;
        activo?: boolean;
    }
) {
    const client = new ShelterClient();
    return client.update(id, data);
}

/**
 * Función helper para eliminar un refugio
 * @deprecated Usar ShelterClient.delete() en su lugar
 */
export async function deleteShelter(id: string) {
    const client = new ShelterClient();
    return client.delete(id);
}