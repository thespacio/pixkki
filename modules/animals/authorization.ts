// modules/animals/authorization.ts

import { AuthenticatedUser } from '@/modules/auth/types';
import { Animal } from './types';
import {AnimalNotBelongsToShelterError, AnimalInvalidStateError, AnimalInactiveError} from './errors';

/**
 * Verifica que el animal pertenezca al refugio del usuario
 *
 * @throws AnimalNotBelongsToShelterError si el animal no pertenece al refugio
 */
export function ensureAnimalBelongsToShelter(
    animal: Animal,
    user: AuthenticatedUser
): void {
    if (animal.idRefugio !== user.shelterId) {
        throw new AnimalNotBelongsToShelterError(animal.id, user.shelterId);
    }
}

/**
 * Verifica que el animal esté activo y no eliminado
 *
 * @throws AnimalInactiveError si el animal no está activo
 */
export function ensureAnimalActive(animal: Animal): void {
    if (!animal.activo) {
        throw new AnimalInactiveError(animal.id);
    }
}

/**
 * Verifica que el animal esté disponible para adopción
 *
 * @throws AnimalInvalidStateError si el animal no está disponible
 */
export function ensureAnimalAvailableForAdoption(
    animal: Animal,
    estadoNombre: string | null
): void {
    if (estadoNombre !== 'disponible') {
        throw new AnimalInvalidStateError(animal.id, animal.estado.nombre, 'adoptar');
    }
}

/**
 * Verifica que el animal pueda ser modificado
 * No se pueden modificar animales adoptados o fallecidos
 *
 * @throws AnimalInvalidStateError si el animal no puede ser modificado
 */
/*export function ensureAnimalEditable(animal: Animal): void {
    const estadosNoEditables = ['adoptado', 'fallecido'];
    if (estadosNoEditables.includes(animal.estadoId)) {
        throw new AnimalInvalidStateError(
            animal.id,
            animal.estado,
            'modificar'
        );
    }
}*/

/**
 * Verifica que el animal pueda ser eliminado
 * No se pueden eliminar animales adoptados o fallecidos
 *
 * @throws AnimalInvalidStateError si el animal no puede ser eliminado
 */
/*export function ensureAnimalDeletable(animal: Animal): void {
    const estadosNoEliminables = ['adoptado', 'fallecido'];
    if (estadosNoEliminables.includes(animal.estado)) {
        throw new AnimalInvalidStateError(
            animal.id,
            animal.estado,
            'eliminar'
        );
    }
}*/

/**
 * Verifica que el animal no esté en proceso de adopción
 *
 * @throws AnimalInvalidStateError si el animal está en proceso de adopción
 */
export function ensureAnimalNotInAdoptionProcess(animal: Animal, estadoNombre: string | null): void {
    if ( estadoNombre === 'en_proceso') {
        throw new AnimalInvalidStateError(
            animal.id,
            animal.estado.nombre,
            'realizar esta operación'
        );
    }
}

/**
 * Verifica que el usuario tenga permisos para operar con el animal
 * Combina varias validaciones comunes
 *
 * @throws AnimalNotBelongsToShelterError, AnimalInactiveError
 */
export function ensureAnimalAccess(
    animal: Animal,
    user: AuthenticatedUser
): void {
    ensureAnimalBelongsToShelter(animal, user);
    ensureAnimalActive(animal);
}

/**
 * Verifica que el usuario pueda gestionar el animal (acceso + editable)
 *
 * @throws AnimalNotBelongsToShelterError, AnimalInactiveError, AnimalInvalidStateError
 *//*
export function ensureAnimalManageable(
    animal: Animal,
    user: AuthenticatedUser
): void {
    ensureAnimalAccess(animal, user);
    ensureAnimalEditable(animal);
}*/

/**
 * Factory function para crear verificadores de autorización con contexto
 * Útil para casos donde se necesitan múltiples verificaciones
 */
/*
export function createAnimalAuthorizationVerifier(user: AuthenticatedUser) {
    return {
        belongsToShelter: (animal: Animal) => ensureAnimalBelongsToShelter(animal, user),
        isActive: (animal: Animal) => ensureAnimalActive(animal),
        isEditable: (animal: Animal) => ensureAnimalEditable(animal),
        isDeletable: (animal: Animal) => ensureAnimalDeletable(animal),
        isAvailableForAdoption: (animal: Animal) => ensureAnimalAvailableForAdoption(animal),
        hasAccess: (animal: Animal) => ensureAnimalAccess(animal, user),
        isManageable: (animal: Animal) => ensureAnimalManageable(animal, user),
        canPerformOperation: (animal: Animal, operation: string) => {
            // Combinación de verificaciones según la operación
            ensureAnimalAccess(animal, user);

            switch (operation) {
                case 'update':
                    ensureAnimalEditable(animal);
                    break;
                case 'delete':
                    ensureAnimalDeletable(animal);
                    break;
                case 'adopt':
                    ensureAnimalAvailableForAdoption(animal);
                    break;
                default:
                    // Operación genérica
                    ensureAnimalActive(animal);
            }
        }
    };
}*/
