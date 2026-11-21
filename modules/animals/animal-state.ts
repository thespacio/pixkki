import type { AnimalState } from "./types/animal-state.types";

/**
 * Normaliza el nombre de un estado del catálogo para compararlo sin depender
 * de mayúsculas, tildes ni espacios extra.
 */
export function normalizeEstadoNombre(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

/**
 * El estado de ingreso es "Cuarentena". Se aceptan las variantes habituales
 * del catálogo ("Cuarentena" / "En cuarentena"), pero no coincidencias
 * parciales que podrían apuntar a otro estado.
 */
export function isEstadoCuarentena(nombre: string): boolean {
    const normalizado = normalizeEstadoNombre(nombre);
    return normalizado === "cuarentena" || normalizado === "en cuarentena";
}

/**
 * Busca la fila del catálogo que representa la cuarentena. Si existieran
 * ambas variantes, prioriza el nombre exacto "Cuarentena".
 */
export function findEstadoCuarentena(
    estados: readonly AnimalState[],
): AnimalState | null {
    const exacto = estados.find(
        (estado) => normalizeEstadoNombre(estado.nombreEstado) === "cuarentena",
    );
    if (exacto) return exacto;

    return (
        estados.find((estado) => isEstadoCuarentena(estado.nombreEstado)) ?? null
    );
}
