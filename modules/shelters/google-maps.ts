// Utilidades de Google Maps para el selector de ubicación del albergue.
//
// No se instala ninguna librería: el script oficial se carga una sola vez y se usan
// únicamente los tipos mínimos que necesitamos (sin depender de @types/google.maps).
import { MEXICAN_STATES } from "@/modules/catalogs/constants/mexican-states";

export const DEFAULT_CENTER = { lat: 23.6345, lng: -102.5528 }; // centro de México
export const MAPS_KEY_MISSING_MESSAGE =
    "Falta NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en el archivo .env. Mientras tanto puedes escribir la dirección a mano.";

// ---------------------------------------------------------------------------
// Tipos mínimos del SDK de Google Maps
// ---------------------------------------------------------------------------
export type LatLng = { lat: number; lng: number };

export type AddressComponent = { long_name: string; short_name: string; types: string[] };
export type GeocoderResult = {
    formatted_address: string;
    address_components: AddressComponent[];
    geometry: { location: { lat(): number; lng(): number } };
};
export type GeocoderResponse = { results: GeocoderResult[] };

export type GoogleMapsApi = {
    maps: {
        importLibrary(name: string): Promise<unknown>;
        Map: new (el: HTMLElement, options: Record<string, unknown>) => MapInstance;
        Geocoder: new () => { geocode(request: Record<string, unknown>): Promise<GeocoderResponse> };
        marker: {
            AdvancedMarkerElement: new (options: Record<string, unknown>) => MarkerInstance;
        };
    };
};

export type MapInstance = {
    setCenter(position: LatLng): void;
    setZoom(zoom: number): void;
    addListener(event: string, handler: (e: { latLng?: { lat(): number; lng(): number } }) => void): void;
};

export type MarkerInstance = {
    position: LatLng | null;
    map: MapInstance | null;
    gmpDraggable: boolean;
    addListener(event: string, handler: (e: { latLng?: { lat(): number; lng(): number } }) => void): void;
};

declare global {
    interface Window {
        google?: GoogleMapsApi;
        gm_authFailure?: () => void;
    }
}

// ---------------------------------------------------------------------------
// Carga del script (una sola vez por página)
// ---------------------------------------------------------------------------
let loading: Promise<GoogleMapsApi> | null = null;

export function loadGoogleMaps(apiKey: string): Promise<GoogleMapsApi> {
    if (typeof window === "undefined") return Promise.reject(new Error("Solo disponible en el navegador."));
    if (window.google?.maps?.importLibrary) return Promise.resolve(window.google);
    if (loading) return loading;

    loading = new Promise<GoogleMapsApi>((resolve, reject) => {
        const callbackName = "__initGoogleMaps";
        (window as unknown as Record<string, unknown>)[callbackName] = async () => {
            try {
                await window.google!.maps.importLibrary("maps");
                await window.google!.maps.importLibrary("marker");
                await window.google!.maps.importLibrary("geocoding");
                resolve(window.google!);
            } catch (error) {
                reject(error);
            }
        };

        const params = new URLSearchParams({
            key: apiKey,
            v: "weekly",
            loading: "async",
            language: "es",
            region: "MX",
            callback: callbackName,
        });
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?${params}`;
        script.async = true;
        script.onerror = () => reject(new Error("No se pudo descargar Google Maps. Revisa tu conexión."));
        document.head.appendChild(script);
    }).catch((error) => {
        loading = null; // permite reintentar
        throw error;
    });

    return loading;
}

// ---------------------------------------------------------------------------
// Lectura del resultado del geocodificador
// ---------------------------------------------------------------------------
function normalize(text: string): string {
    return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

/** Relaciona "Michoacán de Ocampo" o "CDMX" con el catálogo de estados del sistema. */
export function matchMexicanState(name: string | undefined): string | null {
    if (!name) return null;
    const wanted = normalize(name);
    if (wanted === "cdmx" || wanted === "distrito federal") return "Ciudad de México";

    // Primero coincidencia exacta; luego "Coahuila de Zaragoza" ⊃ "Coahuila".
    // Se prefiere el nombre más largo para que "Baja California Sur" no caiga en "Baja California".
    const exact = MEXICAN_STATES.find((state) => normalize(state) === wanted);
    if (exact) return exact;
    const partial = [...MEXICAN_STATES]
        .sort((a, b) => b.length - a.length)
        .find((state) => wanted.startsWith(normalize(state)));
    return partial ?? null;
}

export type PickedLocation = {
    direccion: string;
    latitud: number;
    longitud: number;
    ciudad: string | null;
    estado: string | null;
};

export function toPickedLocation(result: GeocoderResult): PickedLocation {
    const find = (...types: string[]) =>
        result.address_components.find((c) => types.some((t) => c.types.includes(t)))?.long_name;

    return {
        direccion: result.formatted_address.slice(0, 300),
        latitud: roundCoordinate(result.geometry.location.lat()),
        longitud: roundCoordinate(result.geometry.location.lng()),
        // Mismo orden de preferencia que usa Google: localidad > municipio > subdivisión.
        ciudad: find("locality", "administrative_area_level_2", "sublocality") ?? null,
        estado: matchMexicanState(find("administrative_area_level_1")),
    };
}

/** 6 decimales ≈ 11 cm: es lo que guarda la base (numeric(9,6)). */
export function roundCoordinate(value: number): number {
    return Math.round(value * 1e6) / 1e6;
}

export function googleMapsLink(latitud: number, longitud: number): string {
    return `https://www.google.com/maps/search/?api=1&query=${latitud},${longitud}`;
}

export function geocodeErrorMessage(error: unknown): string {
    const code = typeof error === "object" && error && "code" in error ? String((error as { code: unknown }).code) : "";
    switch (code) {
        case "ZERO_RESULTS":
            return "No se encontró esa dirección. Prueba con más detalle o marca el punto en el mapa.";
        case "REQUEST_DENIED":
            return "Google rechazó la búsqueda. Activa la Geocoding API en tu proyecto y revisa las restricciones de la clave.";
        case "OVER_QUERY_LIMIT":
            return "Se alcanzó el límite de consultas de Google. Intenta de nuevo en unos minutos.";
        default:
            return "No se pudo consultar Google Maps. Intenta de nuevo.";
    }
}
