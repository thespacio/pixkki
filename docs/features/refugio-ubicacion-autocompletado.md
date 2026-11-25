# Ubicación del refugio con autocompletado

## Objetivo

Permitir que el superusuario o el administrador del refugio capturen la ubicación desde el formulario de refugios escribiendo una dirección, eligiendo una sugerencia y ajustando el punto en el mapa.

## Comportamiento

1. Al escribir al menos 3 caracteres, el campo consulta **Places API (New)** y muestra sugerencias de direcciones en México (`includedRegionCodes: ["mx"]`, idioma `es`).
2. Al elegir una sugerencia:
   - Se obtienen `formattedAddress`, `location` y `addressComponents`.
   - Se llenan `direccion`, `latitud`, `longitud`, `calle`, `numero`, `colonia`, `codigo_postal`, `ciudad` y `estado`.
   - Se coloca el marcador en el mapa con zoom 16.
3. El botón **Buscar** sigue disponible como respaldo y usa **Geocoding API** con el texto escrito.
4. El clic o arrastre sobre el mapa usa geocodificación inversa para completar la dirección.
5. Si una API no está habilitada, se muestra un mensaje claro y el formulario no se bloquea; la dirección también puede escribirse a mano.

## Configuración de Google Cloud requerida

La clave `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` va al navegador y debe:

- Estar restringida por **HTTP referrers** (`http://localhost:3000/*` y el dominio de producción).
- Estar restringida a las APIs: **Maps JavaScript API**, **Geocoding API** y **Places API (New)**.
- Tener facturación activa en el proyecto, ya que Places API (New) se cobra por sesión de autocompletado.

Sin **Places API (New)** habilitada, el autocompletado muestra un aviso y solo funciona la búsqueda manual con Geocoding API.

## Accesibilidad

- El campo usa `role="combobox"`, `aria-expanded`, `aria-controls` y `aria-activedescendant`.
- La lista usa `role="listbox"` / `role="option"`.
- Navegación con flechas, `Enter` para elegir y `Escape` para cerrar.
