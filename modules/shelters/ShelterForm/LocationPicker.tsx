'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ExternalLink, Loader2, MapPin, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DEFAULT_CENTER,
    MAPS_KEY_MISSING_MESSAGE,
    geocodeErrorMessage,
    googleMapsLink,
    loadGoogleMaps,
    toPickedLocation,
    type GoogleMapsApi,
    type LatLng,
    type MapInstance,
    type MarkerInstance,
    type PickedLocation,
} from '../google-maps';

export type LocationValue = {
    direccion?: string | null;
    latitud?: number | null;
    longitud?: number | null;
};

type Props = {
    value: LocationValue;
    /** `null` = el usuario quitó la ubicación. */
    onChange: (location: PickedLocation | null) => void;
    disabled?: boolean;
};

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? '';
// "DEMO_MAP_ID" permite usar marcadores avanzados sin crear un Map ID; en producción conviene uno propio.
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID?.trim() || 'DEMO_MAP_ID';

function hasCoordinates(value: LocationValue): value is { latitud: number; longitud: number } & LocationValue {
    return typeof value.latitud === 'number' && typeof value.longitud === 'number';
}

export function LocationPicker({ value, onChange, disabled = false }: Props) {
    const mapEl = useRef<HTMLDivElement>(null);
    const mapRef = useRef<MapInstance | null>(null);
    const markerRef = useRef<MarkerInstance | null>(null);
    const apiRef = useRef<GoogleMapsApi | null>(null);
    const onChangeRef = useRef(onChange);
    const disabledRef = useRef(disabled);
    onChangeRef.current = onChange;
    disabledRef.current = disabled;

    const [query, setQuery] = useState(value.direccion ?? '');
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(API_KEY ? 'loading' : 'error');
    const [message, setMessage] = useState<string | null>(API_KEY ? null : MAPS_KEY_MISSING_MESSAGE);
    const [busy, setBusy] = useState(false);

    const placeMarker = useCallback((position: LatLng, zoom?: number) => {
        const api = apiRef.current;
        const map = mapRef.current;
        if (!api || !map) return;

        if (!markerRef.current) {
            const marker = new api.maps.marker.AdvancedMarkerElement({ map, position, gmpDraggable: true });
            marker.addListener('dragend', (e) => {
                if (e.latLng && !disabledRef.current) void resolve({ lat: e.latLng.lat(), lng: e.latLng.lng() });
            });
            markerRef.current = marker;
        } else {
            markerRef.current.position = position;
            markerRef.current.map = map;
        }
        map.setCenter(position);
        if (zoom) map.setZoom(zoom);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /** Convierte un punto o un texto en una dirección y avisa al formulario. */
    const resolve = useCallback(
        async (request: { lat: number; lng: number } | string) => {
            const api = apiRef.current;
            if (!api) return;
            setBusy(true);
            setMessage(null);
            try {
                const geocoder = new api.maps.Geocoder();
                const { results } = await geocoder.geocode(
                    typeof request === 'string' ? { address: request, region: 'MX' } : { location: request },
                );
                if (!results.length) throw Object.assign(new Error('sin resultados'), { code: 'ZERO_RESULTS' });

                const picked = toPickedLocation(results[0]);
                placeMarker({ lat: picked.latitud, lng: picked.longitud }, typeof request === 'string' ? 16 : undefined);
                setQuery(picked.direccion);
                onChangeRef.current(picked);
            } catch (error) {
                setMessage(geocodeErrorMessage(error));
            } finally {
                setBusy(false);
            }
        },
        [placeMarker],
    );

    // El mapa se crea una sola vez; el valor inicial (edición) se dibuja aquí.
    useEffect(() => {
        if (!API_KEY || !mapEl.current) return;
        let cancelled = false;

        // Google avisa por esta función cuando la clave es inválida o el dominio no está permitido.
        window.gm_authFailure = () => {
            setStatus('error');
            setMessage('Google rechazó la clave del mapa. Revisa NEXT_PUBLIC_GOOGLE_MAPS_API_KEY y sus restricciones de dominio.');
        };

        loadGoogleMaps(API_KEY)
            .then((api) => {
                if (cancelled || !mapEl.current) return;
                apiRef.current = api;

                const start = hasCoordinates(value) ? { lat: value.latitud, lng: value.longitud } : null;
                const map = new api.maps.Map(mapEl.current, {
                    center: start ?? DEFAULT_CENTER,
                    zoom: start ? 16 : 5,
                    mapId: MAP_ID,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                });
                mapRef.current = map;
                map.addListener('click', (e) => {
                    if (e.latLng && !disabledRef.current) void resolve({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                });
                if (start) placeMarker(start, 16);
                setStatus('ready');
            })
            .catch((error: unknown) => {
                if (cancelled) return;
                setStatus('error');
                setMessage(error instanceof Error ? error.message : 'No se pudo cargar Google Maps.');
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const search = () => {
        const text = query.trim();
        if (text.length < 3) {
            setMessage('Escribe al menos 3 caracteres para buscar.');
            return;
        }
        void resolve(text);
    };

    const clear = () => {
        if (markerRef.current) markerRef.current.map = null;
        setQuery('');
        setMessage(null);
        onChange(null);
    };

    const mapReady = status === 'ready';

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        // Enter busca la dirección; no debe enviar el formulario completo.
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            if (mapReady) search();
                        }
                    }}
                    placeholder="Busca la dirección: calle, número, colonia…"
                    aria-label="Buscar dirección del albergue"
                    maxLength={300}
                    disabled={disabled || !mapReady}
                />
                <Button type="button" variant="outline" onClick={search} disabled={disabled || !mapReady || busy}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Search className="h-4 w-4" aria-hidden="true" />}
                    <span className="ml-2">Buscar</span>
                </Button>
            </div>

            <div className="relative overflow-hidden rounded-lg border bg-muted/30">
                <div ref={mapEl} className="h-72 w-full" role="application" aria-label="Mapa para elegir la ubicación del albergue" />
                {status !== 'ready' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/60 p-4 text-center text-sm text-muted-foreground">
                        {status === 'loading' ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Cargando mapa…
                            </span>
                        ) : (
                            <span>El mapa no está disponible.</span>
                        )}
                    </div>
                )}
            </div>

            <p className="text-xs text-muted-foreground">
                Haz clic en el mapa para marcar el albergue, o arrastra el marcador para ajustarlo.
            </p>

            {message && (
                <p role="alert" className="text-sm text-destructive">
                    {message}
                </p>
            )}

            {hasCoordinates(value) && (
                <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3 text-sm">
                    <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{value.direccion || 'Ubicación marcada en el mapa'}</p>
                        <p className="text-xs text-muted-foreground">
                            {value.latitud.toFixed(6)}, {value.longitud.toFixed(6)}
                        </p>
                    </div>
                    <a
                        href={googleMapsLink(value.latitud, value.longitud)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                        Abrir en Google Maps <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                    <Button type="button" variant="ghost" size="sm" onClick={clear} disabled={disabled}>
                        <X className="mr-1 h-4 w-4" aria-hidden="true" /> Quitar
                    </Button>
                </div>
            )}
        </div>
    );
}
