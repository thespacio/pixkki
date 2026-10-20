
import { ZodError } from 'zod';
import {SpaceRepository, SpaceRepositoryError} from "@/modules/spaces/repositories/repository";
import {CreateSpaceData, CreateSpaceInput, Space, SpaceFilters, UpdateSpaceInput} from "@/modules/spaces/types/types";
import {CreateSpaceSchema, SpaceFiltersSchema, UpdateSpaceSchema} from "@/modules/spaces/schemas";

export class SpaceServiceError extends Error {
    constructor(
        message: string,
        public readonly code?: string,
        public readonly details?: unknown,
    ) {
        super(message);
        this.name = 'SpaceServiceError';
    }
}

export class SpaceService {
    constructor(private readonly spaceRepository: SpaceRepository) {}

    async createSpace(data: CreateSpaceData): Promise<Space> {
        try {
            const validatedData = CreateSpaceSchema.parse(data.dto);

            if (validatedData.capacity <= 0) {
                throw new SpaceServiceError(
                    'La capacidad debe ser mayor a 0',
                    'INVALID_CAPACITY'
                );
            }

            return await this.spaceRepository.create({
                dto: validatedData,
                shelterId: data.shelterId,
            });

        } catch (error) {
            if (error instanceof ZodError) {
                throw new SpaceServiceError(
                    'Error de validación de datos',
                    'VALIDATION_ERROR',
                    error
                );
            }

            if (error instanceof SpaceRepositoryError) {
                throw new SpaceServiceError(
                    error.message,
                    error.code,
                    error
                );
            }

            if (error instanceof SpaceServiceError) {
                throw error;
            }

            throw new SpaceServiceError(
                `Error inesperado al crear espacio: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                'UNEXPECTED_ERROR'
            );
        }
    }

    /**
     * Obtiene un espacio por su ID
     */
    async getSpaceById(id: number): Promise<Space> {
        try {
            const space = await this.spaceRepository.findById(id);
            if (!space) {
                throw new SpaceServiceError(
                    'Espacio no encontrado',
                    'NOT_FOUND'
                );
            }
            return space;
        } catch (error) {
            if (error instanceof SpaceServiceError) {
                throw error;
            }
            if (error instanceof SpaceRepositoryError) {
                throw new SpaceServiceError(
                    error.message,
                    error.code,
                    error
                );
            }
            throw new SpaceServiceError(
                `Error inesperado al obtener espacio: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'UNEXPECTED_ERROR'
            );
        }
    }

    /**
     * Obtiene espacios con filtros
     */
    async getSpaces(filters?: SpaceFilters): Promise<Space[]> {
        try {
            // Validar filtros si existen
            if (filters) {
                SpaceFiltersSchema.parse(filters);
            }

            return await this.spaceRepository.findMany(filters);
        } catch (error) {
            if (error instanceof ZodError) {
                throw new SpaceServiceError(
                    'Error de validación de filtros',
                    'VALIDATION_ERROR',
                    error
                );
            }
            if (error instanceof SpaceRepositoryError) {
                throw new SpaceServiceError(
                    error.message,
                    error.code,
                    error
                );
            }
            throw new SpaceServiceError(
                `Error inesperado al obtener espacios: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'UNEXPECTED_ERROR'
            );
        }
    }

    /**
     * Obtiene todos los espacios de un refugio
     */
    async getSpacesByShelter(shelterId: number): Promise<Space[]> {
        try {
            return await this.spaceRepository.findByShelterId(shelterId);
        } catch (error) {
            if (error instanceof SpaceRepositoryError) {
                throw new SpaceServiceError(
                    error.message,
                    error.code,
                    error
                );
            }
            throw new SpaceServiceError(
                `Error inesperado al obtener espacios del refugio: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'UNEXPECTED_ERROR'
            );
        }
    }

    /**
     * Actualiza un espacio
     */
    async updateSpace(id: number, dto: UpdateSpaceInput): Promise<Space> {
        try {
            // Validar datos
            const validatedData = UpdateSpaceSchema.parse(dto);

            // Verificar que el espacio existe
            const existingSpace = await this.spaceRepository.findById(id);
            if (!existingSpace) {
                throw new SpaceServiceError(
                    'Espacio no encontrado',
                    'NOT_FOUND'
                );
            }

            // Si se está actualizando la capacidad, verificar que no sea menor que el número actual de animales
            if (validatedData.capacity !== undefined && validatedData.capacity > 0) {
                const animalCount = await this.spaceRepository.getAnimalCount(id);
                if (validatedData.capacity < animalCount) {
                    throw new SpaceServiceError(
                        `No se puede reducir la capacidad a ${validatedData.capacity} porque hay ${animalCount} animales ocupando el espacio`,
                        'CAPACITY_TOO_LOW'
                    );
                }
            }

            // Actualizar el espacio
            return await this.spaceRepository.update(id, validatedData);
        } catch (error) {
            if (error instanceof ZodError) {
                throw new SpaceServiceError(
                    'Error de validación de datos',
                    'VALIDATION_ERROR',
                    error
                );
            }
            if (error instanceof SpaceServiceError) {
                throw error;
            }
            if (error instanceof SpaceRepositoryError) {
                throw new SpaceServiceError(
                    error.message,
                    error.code,
                    error
                );
            }
            throw new SpaceServiceError(
                `Error inesperado al actualizar espacio: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'UNEXPECTED_ERROR'
            );
        }
    }

    /**
     * Elimina un espacio (solo si está vacío)
     */
    async deleteSpace(id: number): Promise<void> {
        try {
            // Verificar que el espacio existe
            const existingSpace = await this.spaceRepository.findById(id);
            if (!existingSpace) {
                throw new SpaceServiceError(
                    'Espacio no encontrado',
                    'NOT_FOUND'
                );
            }

            // Verificar que no tiene animales
            const animalCount = await this.spaceRepository.getAnimalCount(id);
            if (animalCount > 0) {
                throw new SpaceServiceError(
                    `No se puede eliminar el espacio porque tiene ${animalCount} animales asociados`,
                    'HAS_ANIMALS'
                );
            }

            await this.spaceRepository.delete(id);
        } catch (error) {
            if (error instanceof SpaceServiceError) {
                throw error;
            }
            if (error instanceof SpaceRepositoryError) {
                throw new SpaceServiceError(
                    error.message,
                    error.code,
                    error
                );
            }
            throw new SpaceServiceError(
                `Error inesperado al eliminar espacio: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'UNEXPECTED_ERROR'
            );
        }
    }

    /**
     * Verifica si un espacio está disponible para albergar un animal
     */
    async checkSpaceAvailability(spaceId: number): Promise<{ available: boolean; currentCount: number; capacity: number }> {
        try {
            const space = await this.spaceRepository.findById(spaceId);
            if (!space) {
                throw new SpaceServiceError(
                    'Espacio no encontrado',
                    'NOT_FOUND'
                );
            }

            const animalCount = await this.spaceRepository.getAnimalCount(spaceId);
            const isAvailable = space.available && animalCount < space.capacity;

            return {
                available: isAvailable,
                currentCount: animalCount,
                capacity: space.capacity,
            };
        } catch (error) {
            if (error instanceof SpaceServiceError) {
                throw error;
            }
            if (error instanceof SpaceRepositoryError) {
                throw new SpaceServiceError(
                    error.message,
                    error.code,
                    error
                );
            }
            throw new SpaceServiceError(
                `Error inesperado al verificar disponibilidad: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'UNEXPECTED_ERROR'
            );
        }
    }

    /**
     * Obtiene espacios disponibles para un refugio
     */
    async getAvailableSpaces(shelterId: number): Promise<Space[]> {
        try {
            const spaces = await this.spaceRepository.findMany({
                shelterId,
                available: true,
            });

            // Filtrar aquellos que tengan capacidad libre
            const availableSpaces: Space[] = [];
            for (const space of spaces) {
                const animalCount = await this.spaceRepository.getAnimalCount(space.id);
                if (animalCount < space.capacity) {
                    availableSpaces.push(space);
                }
            }

            return availableSpaces;
        } catch (error) {
            if (error instanceof SpaceRepositoryError) {
                throw new SpaceServiceError(
                    error.message,
                    error.code,
                    error
                );
            }
            throw new SpaceServiceError(
                `Error inesperado al obtener espacios disponibles: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'UNEXPECTED_ERROR'
            );
        }
    }
}