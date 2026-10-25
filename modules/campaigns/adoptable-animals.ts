import type { Animal } from "@/modules/animals/types/animales.types";
import type { AdoptableAnimal } from "@/modules/campaigns/types";

/** ¿Está el animal realmente disponible para adopción? (activo, no dado de baja y marcado en adopción). */
export function isAdoptable(animal: Animal): boolean {
    return animal.disponibleAdopcion && animal.activo && !animal.deletedAt;
}

/**
 * Traduce un animal al modelo de campañas copiando SOLO los campos permitidos.
 * Los datos del rescatista, el microchip, las observaciones internas y el lugar
 * o la fecha de rescate no pasan por acá y por lo tanto nunca llegan a la IA.
 */
export function toAdoptableAnimal(animal: Animal): AdoptableAnimal {
    return {
        idAnimal: animal.idAnimal,
        shelterId: animal.idRefugio,
        shelterName: animal.refugioNombre,
        nombre: animal.nombre,
        especie: animal.especie,
        raza: animal.raza,
        sexo: animal.sexo,
        edadEstimada: animal.edadEstimada,
        tamano: animal.tamano ?? null,
        color: animal.color ?? null,
        temperamento: animal.temperamento ?? null,
        vacunado: animal.vacunado ?? false,
        esterilizado: animal.esterilizado,
        desparasitado: animal.desparasitado ?? false,
        rasgosFisicos: animal.rasgosFisicos ?? null,
    };
}
