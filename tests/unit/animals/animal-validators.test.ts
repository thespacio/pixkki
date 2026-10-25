import { describe, it, expect } from "vitest";
import { qaAnnotate } from "../../utils/qa";
import {
    CreateAnimalSchema,
    UpdateAnimalSchema,
    createAnimalFormSchema,
    hoyLocalISO,
    toCreateAnimalInput,
    toFormValues,
} from "@/modules/animals/validators/animal.validators";

const baseValida = {
    especie: "Perro" as const,
    procedencia: "Calle",
    rasgosFisicos: "Pelo corto y orejas caídas",
    estadoInicial: "Desnutrido pero estable",
    idEstado: 1,
    idEspacio: 2,
};

describe("validación de la ficha de animales (DTO)", () => {
    it("acepta una ficha completa de animal rescatado de la calle", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U20",
            categoria: "Unitaria",
            criterio: "Una ficha con todos los datos de rescate (lugar, fecha, situación, rescatista, microchip, temperamento) es válida.",
            prioridad: "Alta",
        });

        const result = CreateAnimalSchema.safeParse({
            ...baseValida,
            nombre: "Firulais",
            raza: "Mestizo",
            sexo: "M",
            edadEstimada: 18,
            peso: 12.5,
            tamano: "Mediano",
            color: "Café con blanco",
            microchip: "985112345678901",
            temperamento: "Dócil",
            lugarRescate: "Avenida Juárez esquina con Hidalgo",
            fechaRescate: "2026-01-15",
            situacionRescate: "Abandonado",
            rescatistaNombre: "María López",
            rescatistaContacto: "555 123 4567",
            observaciones: "Responde bien a su nombre.",
            idRefugio: 3,
        });

        expect(result.success).toBe(true);
    });

    it("rechaza datos inválidos de la ficha", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U21",
            categoria: "Unitaria",
            criterio: "Se rechazan microchip mal formado, tamaño fuera de catálogo, fecha futura, especie desconocida y campos obligatorios vacíos.",
            prioridad: "Alta",
        });

        const manana = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

        expect(CreateAnimalSchema.safeParse({ ...baseValida, microchip: "123" }).success).toBe(false);
        expect(CreateAnimalSchema.safeParse({ ...baseValida, microchip: "abc def ghi jkl" }).success).toBe(false);
        expect(CreateAnimalSchema.safeParse({ ...baseValida, tamano: "Gigante" }).success).toBe(false);
        expect(CreateAnimalSchema.safeParse({ ...baseValida, fechaRescate: manana }).success).toBe(false);
        expect(CreateAnimalSchema.safeParse({ ...baseValida, fechaRescate: "15/01/2026" }).success).toBe(false);
        expect(CreateAnimalSchema.safeParse({ ...baseValida, especie: "Conejo" }).success).toBe(false);
        expect(CreateAnimalSchema.safeParse({ ...baseValida, procedencia: "" }).success).toBe(false);
        expect(CreateAnimalSchema.safeParse({ ...baseValida, rasgosFisicos: "x" }).success).toBe(false);
        expect(CreateAnimalSchema.safeParse({ ...baseValida, idEspacio: 0 }).success).toBe(false);
    });

    it("acepta la edad de un animal viejo (hasta 300 meses) pero no más", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U22",
            categoria: "Unitaria",
            criterio: "Un perro de 10 años (120 meses) es válido; antes el tope de 100 meses lo rechazaba.",
            prioridad: "Media",
            notas: "Regresión: el tope original (100 meses) impedía registrar animales mayores de 8 años.",
        });

        expect(CreateAnimalSchema.safeParse({ ...baseValida, edadEstimada: 120 }).success).toBe(true);
        expect(CreateAnimalSchema.safeParse({ ...baseValida, edadEstimada: 300 }).success).toBe(true);
        expect(CreateAnimalSchema.safeParse({ ...baseValida, edadEstimada: 301 }).success).toBe(false);
        expect(CreateAnimalSchema.safeParse({ ...baseValida, edadEstimada: -1 }).success).toBe(false);
    });

    it("al crear, los indicadores toman valores por defecto", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U23",
            categoria: "Unitaria",
            criterio: "Si no se indican, el animal nuevo queda activo, sin cuarentena, sin vacunar ni esterilizar y no disponible para adopción.",
            prioridad: "Media",
        });

        const parsed = CreateAnimalSchema.parse(baseValida);
        expect(parsed).toMatchObject({
            activo: true,
            enCuarentena: false,
            esterilizado: false,
            disponibleAdopcion: false,
            vacunado: false,
            desparasitado: false,
        });
    });

    it("una actualización parcial NO reinicia los indicadores que no se enviaron", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U24",
            categoria: "Unitaria",
            criterio: "Actualizar solo 'disponibleAdopcion' no debe agregar cuarentena, esterilizado ni activo con valores por defecto.",
            prioridad: "Alta",
            notas: "Regresión: en Zod 4 un default dentro de partial() se aplicaba y pisaba cuarentena/esterilizado/activo al marcar adopción.",
        });

        const parsed = UpdateAnimalSchema.parse({ id: 7, disponibleAdopcion: true });

        expect(parsed).toEqual({ id: 7, disponibleAdopcion: true });
        expect(Object.keys(parsed).sort()).toEqual(["disponibleAdopcion", "id"]);
    });

    it("la actualización exige id y valida los campos que sí se envían", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U25",
            categoria: "Unitaria",
            criterio: "Sin id no se puede actualizar, y un valor inválido en cualquier campo enviado se rechaza.",
            prioridad: "Media",
        });

        expect(UpdateAnimalSchema.safeParse({ disponibleAdopcion: true }).success).toBe(false);
        expect(UpdateAnimalSchema.safeParse({ id: 1, tamano: "Gigante" }).success).toBe(false);
        expect(UpdateAnimalSchema.safeParse({ id: 1, vacunado: true, color: "Negro" }).success).toBe(true);
    });
});

describe("validación del formulario de animales", () => {
    const formBase = toFormValues({ ...baseValida, idEstado: 1, idEspacio: 2 });

    it("el superadmin debe elegir albergue; los demás no", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U26",
            categoria: "Unitaria",
            criterio: "Con selector de albergue (superadmin) el formulario exige elegir uno; sin selector no lo pide.",
            prioridad: "Alta",
        });

        const conAlbergue = createAnimalFormSchema({ requireShelter: true });
        const sinAlbergue = createAnimalFormSchema({ requireShelter: false });

        const falta = conAlbergue.safeParse({ ...formBase, idRefugio: "" });
        expect(falta.success).toBe(false);
        if (!falta.success) {
            expect(falta.error.issues.some((i) => i.path[0] === "idRefugio")).toBe(true);
        }

        expect(conAlbergue.safeParse({ ...formBase, idRefugio: "4" }).success).toBe(true);
        expect(sinAlbergue.safeParse({ ...formBase, idRefugio: "" }).success).toBe(true);
    });

    it("rechaza en el formulario microchip inválido y fecha futura", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U27",
            categoria: "Unitaria",
            criterio: "El formulario muestra error con un microchip corto o una fecha de rescate futura, y acepta el campo vacío.",
            prioridad: "Media",
        });

        const schema = createAnimalFormSchema();
        const futuro = "2999-01-01";

        expect(schema.safeParse({ ...formBase, microchip: "12" }).success).toBe(false);
        expect(schema.safeParse({ ...formBase, fechaRescate: futuro }).success).toBe(false);
        expect(schema.safeParse({ ...formBase, microchip: "", fechaRescate: "" }).success).toBe(true);
        expect(schema.safeParse({ ...formBase, fechaRescate: hoyLocalISO() }).success).toBe(true);
    });

    it("convierte el formulario en DTO: vacíos pasan a undefined y los números a number", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U28",
            categoria: "Unitaria",
            criterio: "Los campos vacíos del formulario no se envían, los textos se recortan y ids/edad/peso se convierten a número.",
            prioridad: "Media",
        });

        const dto = toCreateAnimalInput({
            ...formBase,
            nombre: "  Rex  ",
            color: "   ",
            microchip: "",
            edadEstimada: "24",
            peso: "7.5",
            idRefugio: "3",
            idEstado: "1",
            idEspacio: "2",
            tamano: "Pequeño",
            fechaRescate: "",
            vacunado: true,
        });

        expect(dto.nombre).toBe("Rex");
        expect(dto.color).toBeUndefined();
        expect(dto.microchip).toBeUndefined();
        expect(dto.fechaRescate).toBeUndefined();
        expect(dto.edadEstimada).toBe(24);
        expect(dto.peso).toBe(7.5);
        expect(dto.idRefugio).toBe(3);
        expect(dto.idEstado).toBe(1);
        expect(dto.idEspacio).toBe(2);
        expect(dto.tamano).toBe("Pequeño");
        expect(dto.vacunado).toBe(true);

        // El DTO resultante debe pasar el schema de dominio sin cambios de forma.
        expect(CreateAnimalSchema.safeParse(dto).success).toBe(true);
    });
});
