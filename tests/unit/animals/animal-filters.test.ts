import { describe, it, expect } from "vitest";
import { qaAnnotate } from "../../utils/qa";
import {
    EMPTY_FILTERS,
    countActiveFilters,
    filterAnimals,
    formatEdad,
    normalizeText,
    type AnimalFilters,
} from "@/modules/animals/filters";
import type { Animal } from "@/modules/animals/types/animales.types";

let nextId = 1;

function makeAnimal(overrides: Partial<Animal> = {}): Animal {
    const idAnimal = nextId++;
    return {
        idAnimal,
        uuid: null,
        idRefugio: 1,
        refugioNombre: "Albergue Centro",
        idEspacio: 1,
        espacioNombre: "Patio",
        idEstado: 1,
        estadoNombre: "En observación",
        nombre: `Animal ${idAnimal}`,
        especie: "Perro",
        raza: null,
        sexo: "M",
        edadEstimada: 12,
        peso: null,
        procedencia: "Calle",
        rasgosFisicos: "Pelo corto",
        estadoInicial: "Estable",
        fechaIngreso: "2026-01-01T00:00:00Z",
        activo: true,
        disponibleAdopcion: false,
        enCuarentena: false,
        esterilizado: false,
        deletedAt: null,
        color: null,
        tamano: null,
        microchip: null,
        temperamento: null,
        vacunado: false,
        desparasitado: false,
        lugarRescate: null,
        fechaRescate: null,
        situacionRescate: null,
        rescatistaNombre: null,
        rescatistaContacto: null,
        observaciones: null,
        ...overrides,
    };
}

const filters = (patch: Partial<AnimalFilters>): AnimalFilters => ({ ...EMPTY_FILTERS, ...patch });
const ids = (animales: Animal[]) => animales.map((a) => a.idAnimal);

describe("filtros de animales", () => {
    it("sin filtros devuelve todos los animales", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U10",
            categoria: "Unitaria",
            criterio: "Sin ningún filtro activo se listan todos los animales registrados.",
            prioridad: "Alta",
        });

        const lista = [makeAnimal(), makeAnimal(), makeAnimal()];
        expect(filterAnimals(lista, EMPTY_FILTERS)).toHaveLength(3);
    });

    it("la búsqueda ignora mayúsculas y acentos y mira varios campos", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U11",
            categoria: "Unitaria",
            criterio: "Buscar 'cafe' encuentra un animal de color 'Café' y buscar por microchip o lugar de rescate también funciona.",
            prioridad: "Alta",
        });

        const cafe = makeAnimal({ color: "Café con blanco" });
        const chip = makeAnimal({ microchip: "985112345678901" });
        const calle = makeAnimal({ lugarRescate: "Avenida Juárez, colonia Centro" });
        const otro = makeAnimal();
        const lista = [cafe, chip, calle, otro];

        expect(ids(filterAnimals(lista, filters({ search: "CAFE" })))).toEqual([cafe.idAnimal]);
        expect(ids(filterAnimals(lista, filters({ search: "9851123" })))).toEqual([chip.idAnimal]);
        expect(ids(filterAnimals(lista, filters({ search: "juarez" })))).toEqual([calle.idAnimal]);
    });

    it("combina especie, sexo, estado, tamaño y albergue (todos deben cumplirse)", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U12",
            categoria: "Unitaria",
            criterio: "Al activar varios filtros solo quedan los animales que cumplen todos a la vez.",
            prioridad: "Alta",
        });

        const objetivo = makeAnimal({
            especie: "Gato", sexo: "H", idEstado: 2, tamano: "Pequeño", idRefugio: 5,
        });
        const lista = [
            objetivo,
            makeAnimal({ especie: "Perro", sexo: "H", idEstado: 2, tamano: "Pequeño", idRefugio: 5 }),
            makeAnimal({ especie: "Gato", sexo: "M", idEstado: 2, tamano: "Pequeño", idRefugio: 5 }),
            makeAnimal({ especie: "Gato", sexo: "H", idEstado: 1, tamano: "Pequeño", idRefugio: 5 }),
            makeAnimal({ especie: "Gato", sexo: "H", idEstado: 2, tamano: "Grande", idRefugio: 5 }),
            makeAnimal({ especie: "Gato", sexo: "H", idEstado: 2, tamano: "Pequeño", idRefugio: 9 }),
        ];

        const result = filterAnimals(
            lista,
            filters({ especie: "Gato", sexo: "H", estadoId: "2", tamano: "Pequeño", refugioId: "5" }),
        );
        expect(ids(result)).toEqual([objetivo.idAnimal]);
    });

    it("los interruptores de adopción, cuarentena, esterilizado y vacunado filtran", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U13",
            categoria: "Unitaria",
            criterio: "Cada interruptor deja solo los animales que tienen esa condición.",
            prioridad: "Media",
        });

        const adopcion = makeAnimal({ disponibleAdopcion: true });
        const cuarentena = makeAnimal({ enCuarentena: true });
        const esterilizado = makeAnimal({ esterilizado: true });
        const vacunado = makeAnimal({ vacunado: true });
        const lista = [adopcion, cuarentena, esterilizado, vacunado, makeAnimal()];

        expect(ids(filterAnimals(lista, filters({ soloAdopcion: true })))).toEqual([adopcion.idAnimal]);
        expect(ids(filterAnimals(lista, filters({ soloCuarentena: true })))).toEqual([cuarentena.idAnimal]);
        expect(ids(filterAnimals(lista, filters({ soloEsterilizados: true })))).toEqual([esterilizado.idAnimal]);
        expect(ids(filterAnimals(lista, filters({ soloVacunados: true })))).toEqual([vacunado.idAnimal]);
    });

    it("ordena por más recientes, más antiguos y nombre (sin nombre al final)", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U14",
            categoria: "Unitaria",
            criterio: "El orden por fecha de ingreso y por nombre funciona, y los animales sin nombre quedan al final.",
            prioridad: "Media",
        });

        const viejo = makeAnimal({ nombre: "Zeta", fechaIngreso: "2026-01-01T00:00:00Z" });
        const medio = makeAnimal({ nombre: "Ángel", fechaIngreso: "2026-03-01T00:00:00Z" });
        const nuevo = makeAnimal({ nombre: null, fechaIngreso: "2026-06-01T00:00:00Z" });
        const lista = [viejo, nuevo, medio];

        expect(ids(filterAnimals(lista, filters({ orden: "recientes" })))).toEqual([nuevo.idAnimal, medio.idAnimal, viejo.idAnimal]);
        expect(ids(filterAnimals(lista, filters({ orden: "antiguos" })))).toEqual([viejo.idAnimal, medio.idAnimal, nuevo.idAnimal]);
        expect(ids(filterAnimals(lista, filters({ orden: "nombre" })))).toEqual([medio.idAnimal, viejo.idAnimal, nuevo.idAnimal]);
    });

    it("no modifica la lista original al ordenar", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U15",
            categoria: "Unitaria",
            criterio: "Filtrar y ordenar devuelve una lista nueva y deja intacta la original.",
            prioridad: "Baja",
        });

        const lista = [
            makeAnimal({ fechaIngreso: "2026-01-01T00:00:00Z" }),
            makeAnimal({ fechaIngreso: "2026-05-01T00:00:00Z" }),
        ];
        const antes = ids(lista);
        filterAnimals(lista, filters({ orden: "recientes" }));
        expect(ids(lista)).toEqual(antes);
    });

    it("cuenta los filtros activos sin contar el orden", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U16",
            categoria: "Unitaria",
            criterio: "El contador de 'Limpiar filtros' cuenta solo filtros reales; el orden y un buscador con espacios no cuentan.",
            prioridad: "Baja",
        });

        expect(countActiveFilters(EMPTY_FILTERS)).toBe(0);
        expect(countActiveFilters(filters({ orden: "nombre" }))).toBe(0);
        expect(countActiveFilters(filters({ search: "   " }))).toBe(0);
        expect(countActiveFilters(filters({ search: "rex", especie: "Perro", soloVacunados: true }))).toBe(3);
    });
});

describe("formato de edad y texto", () => {
    it("formatea la edad en meses a años y meses legibles", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U17",
            categoria: "Unitaria",
            criterio: "14 meses se muestra '1 año 2 meses', 24 '2 años', 1 '1 mes' y sin dato '—'.",
            prioridad: "Baja",
        });

        expect(formatEdad(null)).toBe("—");
        expect(formatEdad(0)).toBe("0 meses");
        expect(formatEdad(1)).toBe("1 mes");
        expect(formatEdad(5)).toBe("5 meses");
        expect(formatEdad(12)).toBe("1 año");
        expect(formatEdad(14)).toBe("1 año 2 meses");
        expect(formatEdad(24)).toBe("2 años");
        expect(formatEdad(121)).toBe("10 años 1 mes");
    });

    it("normaliza texto quitando acentos y mayúsculas", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U18",
            categoria: "Unitaria",
            criterio: "'  DÓCIL ' se normaliza a 'docil' para comparar búsquedas.",
            prioridad: "Baja",
        });

        expect(normalizeText("  DÓCIL ")).toBe("docil");
        expect(normalizeText("Ñandú")).toBe("nandu");
    });
});
