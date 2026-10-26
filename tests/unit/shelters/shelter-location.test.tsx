import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { qaAnnotate } from "../../utils/qa";
import {
    geocodeErrorMessage,
    googleMapsLink,
    matchMexicanState,
    roundCoordinate,
    toPickedLocation,
    type GeocoderResult,
} from "@/modules/shelters/google-maps";
import { mapShelterRowToDomain, mapShelterToRow } from "@/modules/shelters/mapper";
import { CreateShelterSchema, UpdateShelterSchema } from "@/modules/shelters/schemas";
import { LocationPicker } from "@/modules/shelters/ShelterForm/LocationPicker";

const base = {
    nombre_albergue: "Refugio Esperanza",
    ciudad: "Zapopan",
    estado: "Jalisco",
    correo_contacto: "admin@refugio.org",
    telefono: "3312345678",
    nombre_admin: "Ana Lopez",
};

const result: GeocoderResult = {
    formatted_address: "Av. Patria 1891, Jardines Universidad, 45110 Zapopan, Jal., México",
    address_components: [
        { long_name: "1891", short_name: "1891", types: ["street_number"] },
        { long_name: "Avenida Patria", short_name: "Av. Patria", types: ["route"] },
        { long_name: "Jardines Universidad", short_name: "Jardines Universidad", types: ["sublocality_level_1", "sublocality", "political"] },
        { long_name: "45110", short_name: "45110", types: ["postal_code"] },
        { long_name: "Zapopan", short_name: "Zapopan", types: ["locality", "political"] },
        { long_name: "Jalisco", short_name: "Jal.", types: ["administrative_area_level_1", "political"] },
    ],
    geometry: { location: { lat: () => 20.7123456789, lng: () => -103.4123456789 } },
};

describe("lectura del resultado de Google Maps", () => {
    it("convierte un resultado en dirección, coordenadas, ciudad y estado", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U240", categoria: "Funcional", prioridad: "Alta",
            criterio: "Al elegir un punto se obtiene dirección, coordenadas (6 decimales), calle, número, colonia, código postal, ciudad y estado del catálogo.",
        });

        expect(toPickedLocation(result)).toEqual({
            direccion: "Av. Patria 1891, Jardines Universidad, 45110 Zapopan, Jal., México",
            latitud: 20.712346,
            longitud: -103.412346,
            ciudad: "Zapopan",
            estado: "Jalisco",
            calle: "Avenida Patria",
            numero: "1891",
            colonia: "Jardines Universidad",
            codigoPostal: "45110",
        });
        expect(roundCoordinate(19.4326077)).toBe(19.432608);
    });

    it("relaciona los nombres de Google con el catálogo de estados", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U241", categoria: "Unitaria", prioridad: "Media",
            criterio: "Variantes como 'Michoacán de Ocampo' o 'CDMX' se asignan al estado correcto; lo desconocido queda vacío.",
        });

        expect(matchMexicanState("Michoacán de Ocampo")).toBe("Michoacán");
        expect(matchMexicanState("Coahuila de Zaragoza")).toBe("Coahuila");
        expect(matchMexicanState("CDMX")).toBe("Ciudad de México");
        expect(matchMexicanState("nuevo leon")).toBe("Nuevo León");
        expect(matchMexicanState("Baja California Sur")).toBe("Baja California Sur");
        expect(matchMexicanState("Texas")).toBeNull();
        expect(matchMexicanState(undefined)).toBeNull();
    });

    it("explica cada error de Google y arma el enlace al mapa", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U242", categoria: "Funcional", prioridad: "Media",
            criterio: "Sin resultados, API apagada y límite excedido muestran un mensaje claro.",
        });

        expect(geocodeErrorMessage({ code: "ZERO_RESULTS" })).toMatch(/no se encontró/i);
        expect(geocodeErrorMessage({ code: "REQUEST_DENIED" })).toMatch(/Geocoding API/);
        expect(geocodeErrorMessage({ code: "OVER_QUERY_LIMIT" })).toMatch(/límite/i);
        expect(geocodeErrorMessage(new Error("x"))).toMatch(/intenta de nuevo/i);
        expect(googleMapsLink(20.5, -103.25)).toBe("https://www.google.com/maps/search/?api=1&query=20.5,-103.25");
    });
});

describe("guardado de la ubicación", () => {
    it("la ubicación es opcional y se valida su rango", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U243", categoria: "Unitaria", prioridad: "Alta",
            criterio: "Un albergue sin ubicación sigue siendo válido; coordenadas fuera de rango o dirección larguísima se rechazan.",
        });

        expect(CreateShelterSchema.safeParse(base).success).toBe(true);
        expect(CreateShelterSchema.safeParse({ ...base, direccion: "Calle 1", latitud: 20.7, longitud: -103.4 }).success).toBe(true);
        expect(CreateShelterSchema.safeParse({ ...base, latitud: 91, longitud: 0 }).success).toBe(false);
        expect(CreateShelterSchema.safeParse({ ...base, latitud: 0, longitud: 181 }).success).toBe(false);
        expect(CreateShelterSchema.safeParse({ ...base, direccion: "x".repeat(301) }).success).toBe(false);
        expect(CreateShelterSchema.safeParse({ ...base, codigo_postal: "45110", calle: "Av. Patria" }).success).toBe(true);
        expect(CreateShelterSchema.safeParse({ ...base, codigo_postal: "4511" }).success).toBe(false);
        expect(UpdateShelterSchema.safeParse({ ...base, direccion: null, latitud: null, longitud: null }).success).toBe(true);
    });

    it("no manda columnas de ubicación si la petición no las trae", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U244", categoria: "Funcional", prioridad: "Alta",
            criterio: "Editar otros datos del albergue no toca su ubicación (ni falla si la base no está migrada).",
        });

        const row = mapShelterToRow({ nombre_albergue: "Nuevo nombre" });
        expect("latitud" in row).toBe(false);
        expect("longitud" in row).toBe(false);
        expect("direccion" in row).toBe(false);
    });

    it("guarda dirección y coordenadas, y permite quitarlas", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U245", categoria: "Funcional", prioridad: "Alta",
            criterio: "Latitud y longitud se guardan juntas o se borran juntas; nunca queda una sola.",
        });

        const set = mapShelterToRow({ direccion: "  Calle 1  ", latitud: 20.7, longitud: -103.4 });
        expect(set).toMatchObject({ direccion: "Calle 1", latitud: 20.7, longitud: -103.4 });

        const cleared = mapShelterToRow({ direccion: null, latitud: null, longitud: null });
        expect(cleared).toMatchObject({ direccion: null, latitud: null, longitud: null });

        const parts = mapShelterToRow({ calle: " Av. Patria ", numero: "", colonia: null, codigo_postal: "45110" });
        expect(parts).toMatchObject({ calle: "Av. Patria", numero: null, colonia: null, codigo_postal: "45110" });

        const half = mapShelterToRow({ latitud: 20.7 });
        expect("latitud" in half).toBe(false);
        const mixed = mapShelterToRow({ latitud: 20.7, longitud: null });
        expect("latitud" in mixed).toBe(false);
    });

    it("al leer una fila sin las columnas nuevas no falla", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U246", categoria: "Funcional", prioridad: "Media",
            criterio: "Si la migración aún no se aplicó, el albergue se muestra sin ubicación.",
        });

        const shelter = mapShelterRowToDomain({
            id_refugio: 1, nombre: "A", ciudad: "B", estado: "C", correo_contacto: "a@b.co", telefono: null,
            fecha_registro: "2026-01-01T00:00:00Z", activo: true,
        } as never);
        expect(shelter).toMatchObject({ direccion: null, latitud: null, longitud: null });
    });
});

describe("LocationPicker", () => {
    it("sin clave de Google avisa qué falta y no rompe el formulario", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U247", categoria: "Funcional", prioridad: "Alta",
            criterio: "Sin NEXT_PUBLIC_GOOGLE_MAPS_API_KEY se explica cómo configurarla y la búsqueda queda desactivada.",
        });

        render(<LocationPicker value={{}} onChange={vi.fn()} />);

        expect(screen.getByRole("alert").textContent).toMatch(/NEXT_PUBLIC_GOOGLE_MAPS_API_KEY/);
        expect((screen.getByLabelText(/buscar dirección/i) as HTMLInputElement).disabled).toBe(true);
    });

    it("muestra la ubicación guardada con su enlace a Google Maps y permite quitarla", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U248", categoria: "Funcional", prioridad: "Media",
            criterio: "Al editar se ve la dirección guardada, sus coordenadas y el botón para quitarla.",
        });

        const onChange = vi.fn();
        render(<LocationPicker value={{ direccion: "Calle 1, Zapopan", latitud: 20.7, longitud: -103.4 }} onChange={onChange} />);

        expect(screen.getByText("Calle 1, Zapopan")).toBeTruthy();
        expect(screen.getByText("20.700000, -103.400000")).toBeTruthy();
        expect(screen.getByRole("link", { name: /abrir en google maps/i }).getAttribute("href")).toContain("query=20.7,-103.4");

        fireEvent.click(screen.getByRole("button", { name: /quitar/i }));
        expect(onChange).toHaveBeenCalledWith(null);
    });
});
