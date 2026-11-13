// modules/animals/dtos/imagen-animal.dto.ts

import type { CreateImagenInput } from "../validators/animal.validators";

/** DTO de entrada para subir una imagen al expediente de un animal.
 * Derivado del schema Zod (única fuente de verdad).
 */
export type CreateImagenDTO = CreateImagenInput;