import type { Animal } from "@/modules/animals/types/animales.types";

export type AnimalOrden = "recientes" | "antiguos" | "nombre";

export type AnimalFilters = {
    /** Texto libre: nombre, raza, color, microchip, lugar de rescate, albergue... */
    search: string;
    especie: "" | "Perro" | "Gato";
    sexo: "" | "M" | "H";
    /** id del estado como string ("" = todos) para enlazarlo directo a un <select>. */
    estadoId: string;
    tamano: string;
    /** id del albergue como string ("" = todos). Solo lo usa el superadmin. */
    refugioId: string;
    soloAdopcion: boolean;
    soloCuarentena: boolean;
    soloEsterilizados: boolean;
    soloVacunados: boolean;
    orden: AnimalOrden;
};

export const EMPTY_FILTERS: AnimalFilters = {
    search: "",
    especie: "",
    sexo: "",
    estadoId: "",
    tamano: "",
    refugioId: "",
    soloAdopcion: false,
    soloCuarentena: false,
    soloEsterilizados: false,
    soloVacunados: false,
    orden: "recientes",
};

/** Minúsculas y sin acentos: "Dócil" coincide con "docil". */
export function normalizeText(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .trim();
}

function searchableText(animal: Animal): string {
    return normalizeText(
        [
            animal.nombre,
            animal.especie,
            animal.raza,
            animal.color,
            animal.microchip,
            animal.lugarRescate,
            animal.rescatistaNombre,
            animal.refugioNombre,
            animal.espacioNombre,
        ]
            .filter(Boolean)
            .join(" "),
    );
}

function compareByDate(a: Animal, b: Animal): number {
    const byDate = Date.parse(a.fechaIngreso) - Date.parse(b.fechaIngreso);
    return byDate !== 0 && !Number.isNaN(byDate) ? byDate : a.idAnimal - b.idAnimal;
}

function sortAnimals(animales: Animal[], orden: AnimalOrden): Animal[] {
    const copy = [...animales];
    switch (orden) {
        case "antiguos":
            return copy.sort(compareByDate);
        case "nombre":
            // Los animales sin nombre van al final.
            return copy.sort((a, b) => {
                if (!a.nombre && !b.nombre) return compareByDate(b, a);
                if (!a.nombre) return 1;
                if (!b.nombre) return -1;
                return a.nombre.localeCompare(b.nombre, "es");
            });
        case "recientes":
        default:
            return copy.sort((a, b) => compareByDate(b, a));
    }
}

export function filterAnimals(animales: Animal[], f: AnimalFilters): Animal[] {
    const term = normalizeText(f.search);

    const filtered = animales.filter((a) => {
        if (term && !searchableText(a).includes(term)) return false;
        if (f.especie && a.especie !== f.especie) return false;
        if (f.sexo && a.sexo !== f.sexo) return false;
        if (f.estadoId && String(a.idEstado) !== f.estadoId) return false;
        if (f.tamano && a.tamano !== f.tamano) return false;
        if (f.refugioId && String(a.idRefugio) !== f.refugioId) return false;
        if (f.soloAdopcion && !a.disponibleAdopcion) return false;
        if (f.soloCuarentena && !a.enCuarentena) return false;
        if (f.soloEsterilizados && !a.esterilizado) return false;
        if (f.soloVacunados && !a.vacunado) return false;
        return true;
    });

    return sortAnimals(filtered, f.orden);
}

/** Cantidad de filtros activos (el orden no cuenta). Sirve para mostrar "Limpiar (n)". */
export function countActiveFilters(f: AnimalFilters): number {
    return [
        f.search.trim() !== "",
        f.especie !== "",
        f.sexo !== "",
        f.estadoId !== "",
        f.tamano !== "",
        f.refugioId !== "",
        f.soloAdopcion,
        f.soloCuarentena,
        f.soloEsterilizados,
        f.soloVacunados,
    ].filter(Boolean).length;
}

/** 14 → "1 año 2 meses", 5 → "5 meses", null → "—". La edad se guarda en meses. */
export function formatEdad(meses: number | null): string {
    if (meses === null || meses === undefined) return "—";
    if (meses < 12) return meses === 1 ? "1 mes" : `${meses} meses`;

    const years = Math.floor(meses / 12);
    const rest = meses % 12;
    const yearsText = years === 1 ? "1 año" : `${years} años`;
    if (rest === 0) return yearsText;
    return `${yearsText} ${rest === 1 ? "1 mes" : `${rest} meses`}`;
}
