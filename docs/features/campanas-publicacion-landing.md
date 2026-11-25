# Campañas publicadas en la home pública

## Objetivo

Hacer visibles en la landing pública (`/`) las campañas de adopción que el personal haya publicado desde el módulo `campaigns`.

## Problema

El panel `/campaigns` permite generar sugerencias con IA, guardarlas como borrador y publicarlas. La propia interfaz anuncia «Publica un borrador para que aparezca en la landing», pero la home real (`app/page.tsx`) no consume la lectura pública ni renderiza la sección. Hoy una campaña publicada solo existe en la base de datos y en el panel interno.

## Alcance

- Mostrar en `/` hasta **6 campañas** con estado `publicada`, ordenadas por `fecha_publicacion` descendente.
- Reutilizar `getPublishedCampaigns()` (`modules/campaigns/public.ts`) y `PublishedCampaigns` (`components/landing/PublishedCampaigns.tsx`) sin crear endpoints nuevos ni acceder a Supabase desde `app/`.
- Ubicar el bloque entre las secciones **Cómo funciona** y **Animales destacados**, sin añadir rutas ni cambiar el hero, los destacados ni el bloque de confianza.
- Renderizarlo como Server Component con un límite `Suspense` y un skeleton de carga de la misma forma que el contenido final.

## Origen de datos y reglas

- Vista `public.campana_publica`, definida en `supabase/migrations/20261025000000_campanas.sql`. Expone únicamente campañas `publicada` de refugios activos, con animales disponibles, activos y no eliminados, y solo campos no sensibles (título, contenido, hashtags, llamado a la acción, fecha, animales y refugio).
- `getPublishedCampaigns(limit = 6)` usa un cliente anónimo. Si faltan las variables de entorno o la consulta falla, devuelve `[]` y registra el error en el servidor sin exponer detalles al visitante.
- Publicar, despublicar y archivar sigue siendo competencia exclusiva del panel `/campaigns`. Esta feature es **solo lectura**.
- No se modifica la vista, las políticas RLS ni el esquema de base de datos.

## Estados de la interfaz

| Estado | Comportamiento esperado |
| --- | --- |
| Ideal | Hasta 6 tarjetas con título, texto, hashtags, CTA, animales y refugio. |
| Vacío | La sección no se renderiza; el resto de la home permanece intacto. |
| Carga | Skeleton con la misma geometría del grid, sin bloquear hero ni destacados. |
| Parcial | Si hay menos de 6 campañas válidas, se muestra el grid adaptado sin huecos forzados. |
| Error | La consulta degrada a «sin campañas»; no se muestra un banner intrusivo en la home. |

## Criterios de aceptación

- [ ] Al publicar una campaña en `/campaigns`, aparece en `/` tras recargar la home.
- [ ] Al despublicarla o archivarla, desaparece de `/` sin intervención manual.
- [ ] No se muestran campañas en borrador ni de refugios inactivos.
- [ ] Un animal adoptado o dado de baja deja de aparecer en la tarjeta.
- [ ] Sin campañas, sin migración aplicada o sin configuración de Supabase, la home sigue funcionando.
- [ ] La sección es un Server Component y `app/page.tsx` no contiene acceso directo a Supabase.
- [ ] `typecheck`, `lint` y `build` pasan sin desactivar reglas.

## Fuera de alcance

- Publicación automática en redes sociales.
- Nueva ruta pública (por ejemplo `/campanas`) o endpoint `/api/v1/publico/campanas`.
- Modificar el panel `/campaigns`, el prompt de Gemini, la vista `campana_publica` o las migraciones.
- Unificar o eliminar la landing legacy `app/(public)/landing/page.tsx` y el componente no usado `components/landing/LandingPage.tsx`.
- Corregir la desviación preexistente de `modules/campaigns/public.ts` (acceso a Supabase fuera de `repositories/`): se documenta, pero no se agrava ni se refactoriza aquí.
- Modificar tests.
