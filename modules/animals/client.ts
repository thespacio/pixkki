import {CreateAnimalInput, UpdateAnimalInput} from "@/modules/animals/types";

export async function fetchAnimals(filters?: {
    especie?: string;
    estado?: number;
}){
    // GET animals (con filtros)
    const params = new URLSearchParams();
    if (filters?.especie) params.append('especie', filters.especie);
    if (filters?.estado) params.append('estado', String(filters.estado));

    const response = await fetch(`/api/animals?${params.toString()}`);
    if (!response.ok) {
        console.error(response);
        throw new Error('Error fetching animals');
    }
    return response.json();
}

export async function fetchAnimal(id: number){
    // GET animal by ID
    const response = await fetch(`/api/animals/${id}`);
    if (!response.ok) throw new Error('Error fetching animal');
    return response.json();
}

export async function createAnimal(data: CreateAnimalInput){
    // POST create animal
    const response = await fetch('/api/animals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error creating animal');
    return response.json();
}

export async function updateAnimal(id: number, data: UpdateAnimalInput) {
    // PATCH update animal
    const response = await fetch(`/api/animals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error updating animal');
    return response.json();
}

export async function deleteAnimal(id: number) {
    // DELETE animal
    const response = await fetch(`/api/animals/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error deleting animal');
    return response.json();
}