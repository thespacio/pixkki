
import { AuthenticatedUser } from '@/modules/auth/types';
import { Animal, CreateAnimalInput, UpdateAnimalInput, AnimalFilters, PaginatedAnimals } from './types';

import {
    AnimalPermissionError, AnimalInvalidStateError
} from './errors';
import {
    ensureAnimalAccess,
    ensureAnimalAvailableForAdoption, ensureAnimalNotInAdoptionProcess
} from './authorization';
import {AnimalRepository} from "@/modules/animals/repository";

/**
 * Servicio principal del módulo de animales
 * Contiene todos los casos de uso del negocio
 */
export class AnimalService {
    constructor(
        private readonly animalRepository: AnimalRepository
    ) {}
    
    /**
     * Obtiene una lista paginada de animales con filtros
     *
     * @param user - Usuario autenticado
     * @param filters - Filtros de búsqueda
     * @returns Lista paginada de animales
     */
    async getAnimals(
        user: AuthenticatedUser,
        filters: AnimalFilters
    ): Promise<PaginatedAnimals> {
        // Siempre filtrar por el refugio del usuario
        const safeFilters: AnimalFilters = {
            ...filters,
            refugioId: user.shelterId
        };

        // Si el usuario tiene permisos especiales, podría ver todos los animales
        // Esto es un ejemplo de cómo evolucionaría el sistema
        const isSuperAdmin = user.permissions?.includes('animals.view.all');
        if (isSuperAdmin && !filters.refugioId) {
            // Si es super admin y no filtra por refugio, no aplicamos filtro de refugio
            //delete safeFilters.refugioId;
        }

        return await this.animalRepository.findAll(safeFilters);
    }

    /**
     * Obtiene un animal por su ID
     *
     * @param user - Usuario autenticado
     * @param id - ID del animal
     * @param includeDeleted - Si incluir animales eliminados (requiere permisos especiales)
     * @returns El animal encontrado
     * @throws AnimalNotFoundError si no existe
     * @throws AnimalPermissionError si no tiene permisos
     */
    async getAnimal(
        user: AuthenticatedUser,
        id: number,
        includeDeleted: boolean = false
    ): Promise<Animal> {
        // Obtener el animal
        const animal = await this.animalRepository.findById(id, includeDeleted);

        // Verificar que pertenece al refugio del usuario
        // (a menos que sea super admin con permisos especiales)
        const isSuperAdmin = user.permissions?.includes('animals.view.all');
        if (!isSuperAdmin) {
            ensureAnimalAccess(animal, user);
        }

        // Si se incluyen eliminados, verificar que el usuario tenga permisos
        if (includeDeleted && !isSuperAdmin) {
            throw new AnimalPermissionError('view_deleted_animals');
        }

        return animal;
    }

    /**
     * Crea un nuevo animal
     *
     * @param user - Usuario autenticado
     * @param input - Datos del animal a crear
     * @returns El animal creado
     * @throws AnimalAlreadyExistsError si ya existe un animal con el mismo microchip
     * @throws AnimalInvalidMicrochipError si el microchip tiene formato inválido
     */
    async createAnimal(
        user: AuthenticatedUser,
        input: CreateAnimalInput
    ): Promise<Animal> {
        // Verificar permisos de creación (ya validado en el route, pero redundancia por seguridad)
        if (!user.permissions?.includes('animals.create')) {
            throw new AnimalPermissionError('create');
        }

        // Agregar reglas de negocio adicionales
        // Ejemplo: Si no se proporciona fecha de ingreso, usar la fecha actual
        // Ejemplo: Si no se proporciona estado, usar 'disponible' por defecto

        // Si no se proporciona fecha de nacimiento pero sí edad estimada, calcular aproximación
        /*if (!input.fechaNacimiento && input.edadEstimada) {
            // Esto es solo un ejemplo, en la práctica podríamos guardar solo la edad estimada
            // y calcular una fecha de nacimiento aproximada
            console.log('Calculando fecha de nacimiento aproximada a partir de edad estimada');
        }*/

        // Crear el animal
        const animal = await this.animalRepository.create(input, user.shelterId);

        // Aquí podríamos registrar en auditoría
        // await this.logAnimalCreation(user, animal);

        return animal;
    }

    /**
     * Actualiza un animal existente
     *
     * @param user - Usuario autenticado
     * @param id - ID del animal a actualizar
     * @param input - Datos a actualizar
     * @returns El animal actualizado
     * @throws AnimalNotFoundError si no existe
     * @throws AnimalPermissionError si no tiene permisos
     * @throws AnimalAlreadyExistsError si el microchip ya existe
     */
    async updateAnimal(
        user: AuthenticatedUser,
        id: number,
        input: UpdateAnimalInput
    ): Promise<Animal> {
        // Verificar permisos de actualización
        if (!user.permissions?.includes('animals.update')) {
            throw new AnimalPermissionError('update');
        }

        // Obtener el animal actual
        const currentAnimal = await this.animalRepository.findById(id, false);
        const estadoNombre = await this.animalRepository.getEstadoNombreById(currentAnimal.estado?.id);


        // Verificar que el animal pertenece al refugio y es editable
        //ensureAnimalManageable(currentAnimal, user);

        // Si se está cambiando el estado, validar transiciones permitidas
        if (input.estado?.id && input.estado.id !== currentAnimal.estado.id) {
            await this.validateStateTransition(currentAnimal, estadoNombre);
        }

        // Actualizar el animal
        const updatedAnimal = await this.animalRepository.update(id, input);

        // Aquí podríamos registrar en auditoría
        // await this.logAnimalUpdate(user, updatedAnimal, currentAnimal);

        return updatedAnimal;
    }

    /**
     * Elimina (soft delete) un animal
     *
     * @param user - Usuario autenticado
     * @param id - ID del animal a eliminar
     * @throws AnimalNotFoundError si no existe
     * @throws AnimalPermissionError si no tiene permisos
     * @throws AnimalDeletedError si ya está eliminado
     */
    async deleteAnimal(
        user: AuthenticatedUser,
        id: number
    ): Promise<void> {
        // Verificar permisos de eliminación
        if (!user.permissions?.includes('animals.delete')) {
            throw new AnimalPermissionError('delete');
        }

        // Obtener el animal
        const animal = await this.animalRepository.findById(id, false);
        const estadoNombre = await this.animalRepository.getEstadoNombreById(animal.estado.id);


        // Verificar que el animal pertenece al refugio y es eliminable
        ensureAnimalAccess(animal, user);

        // Verificar que no esté en proceso de adopción
        ensureAnimalNotInAdoptionProcess(animal, estadoNombre);

        // Verificar reglas de negocio específicas para eliminación
        // Ejemplo: No se puede eliminar un animal que está en proceso de adopción
        // Ejemplo: No se puede eliminar un animal que tiene tratamientos activos
        // Estas reglas se implementarían aquí cuando existan los módulos correspondientes

        // Verificar que no esté en estado que impida eliminación
        /*if (animal.estado === 'adoptado' || animal.estado === 'fallecido') {
            throw new AnimalDeletedError(id);
        }*/

        // Realizar el soft delete
        await this.animalRepository.softDelete(id);

        // Aquí podríamos registrar en auditoría
        // await this.logAnimalDeletion(user, animal);
    }

    /**
     * Marca un animal como adoptado
     *
     * @param user - Usuario autenticado
     * @param id - ID del animal a marcar como adoptado
     * @returns El animal actualizado
     */
    async markAsAdopted(
        user: AuthenticatedUser,
        id: number
    ): Promise<Animal> {
        // Verificar permisos
        if (!user.permissions?.includes('animals.update')) {
            throw new AnimalPermissionError('mark_as_adopted');
        }

        // Obtener el animal
        const animal = await this.animalRepository.findById(id, false);
        const estadoNombre = await this.animalRepository.getEstadoNombreById(animal.estado.id);


        // Verificar que el animal pertenece al refugio
        ensureAnimalAccess(animal, user);

        // Verificar que está disponible para adopción
        ensureAnimalAvailableForAdoption(animal, estadoNombre);

        // Cambiar el estado a 'adoptado'
        // En un sistema real, aquí también se actualizarían otros datos relacionados
        // como la fecha de adopción, el adoptante, etc.
        const updatedAnimal = await this.animalRepository.update(id, {
            estado: {
                id: 5
            }
        });

        // Aquí podríamos emitir eventos de dominio
        // await this.eventBus.emit(new AnimalAdoptedEvent(animal));

        return updatedAnimal;
    }

    /**
     * Marca un animal como fallecido
     *
     * @param user - Usuario autenticado
     * @param id - ID del animal a marcar como fallecido
     * @returns El animal actualizado
     */
    async markAsDeceased(
        user: AuthenticatedUser,
        id: number
    ): Promise<Animal> {
        // Verificar permisos
        if (!user.permissions?.includes('animals.update')) {
            throw new AnimalPermissionError('mark_as_deceased');
        }

        // Obtener el animal
        const animal = await this.animalRepository.findById(id, false);

        // Verificar que el animal pertenece al refugio
        ensureAnimalAccess(animal, user);

        // Verificar que no esté en un estado que impida marcar como fallecido
        /*if (animal.estado === 'adoptado') {
            throw new AnimalInvalidStateError(
                animal.id,
                animal.estado,
                'marcar como fallecido'
            );
        }*/

        // Cambiar el estado a 'fallecido'
        const updatedAnimal = await this.animalRepository.update(id, {
            estado:{
                id:1
            }
        });

        return updatedAnimal;
    }

    /**
     * Obtiene estadísticas de animales por refugio
     *
     * @param user - Usuario autenticado
     * @returns Estadísticas de animales
     */
    async getStatistics(
        user: AuthenticatedUser
    ): Promise<{
        total: number;
        available: number;
        adopted: number;
        inProcess: number;
        deceased: number;
    }> {
        // Verificar permisos
        if (!user.permissions?.includes('animals.read')) {
            throw new AnimalPermissionError('view_statistics');
        }

        // Obtener conteos por estado
        const [total, available, adopted, inProcess, deceased] = await Promise.all([
            this.animalRepository.countByShelter(user.shelterId),
            this.animalRepository.countByShelter(user.shelterId, 4),
            this.animalRepository.countByShelter(user.shelterId, 5),
            this.animalRepository.countByShelter(user.shelterId, 9),
            this.animalRepository.countByShelter(user.shelterId, 7)
        ]);

        return {
            total,
            available,
            adopted,
            inProcess,
            deceased
        };
    }

    /**
     * Valida transiciones de estado permitidas
     *
     * @param currentAnimal - Animal actual
     * @param newEstado - Nuevo estado deseado
     * @throws AnimalInvalidStateError si la transición no es válida
     */
    private async validateStateTransition(
        currentAnimal: Animal,
        newEstado: string
    ): Promise<void> {
        // Definir transiciones permitidas
        const allowedTransitions: Record<string, string[]> = {
            'disponible': ['en_proceso', 'adoptado', 'no_disponible'],
            'en_proceso': ['disponible', 'adoptado', 'no_disponible'],
            'adoptado': [], // No se puede cambiar de estado una vez adoptado
            'no_disponible': ['disponible', 'en_proceso', 'adoptado'],
            'fallecido': [] // No se puede cambiar de estado una vez fallecido
        };

        // Verificar si la transición está permitida
        const allowed = allowedTransitions[currentAnimal.estado.id] || [];
        if (!allowed.includes(newEstado)) {
            throw new AnimalInvalidStateError(
                currentAnimal.id,
                currentAnimal.estado.nombre,
                `cambiar a estado "${newEstado}"`
            );
        }
    }
}