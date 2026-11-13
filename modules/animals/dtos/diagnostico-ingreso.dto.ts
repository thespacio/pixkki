// modules/animals/dtos/diagnostico-ingreso.dto.ts

import type { CreateDiagnosticoInput } from "../validators/animal.validators";

/** DTO de entrada para registrar un diagnóstico veterinario de ingreso.
 * Derivado del schema Zod (única fuente de verdad).
 */
export type CreateDiagnosticoDTO = CreateDiagnosticoInput;