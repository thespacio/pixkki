# ADR-0001 — Transporte de IA compartido sin acoplar dominios

## Status

Accepted (aprobado por el humano el 2026-11-23).

## Context

Pixkki tiene dos módulos que usan IA:

- `campaigns` genera publicaciones de difusión (título, contenido, hashtags y llamado a la acción) a partir de animales disponibles para adopción. Ya funciona con Gemini.
- `adoptions` es dueño del perfil público de adopción. La Épica 5 (RF5.1) exige que la descripción se redacte manualmente y deja la generación con IA fuera de alcance. La Épica 8 (US26, RF8.6/RF8.7) la recupera y define el endpoint `POST /api/v1/animales/{id}/perfil-adopcion/generar`, con borrador, revisión humana y trazabilidad del origen.

El requerimiento 08 ya fijó la intención en su regla 52 y supuesto S11: *el transporte se comparte con `campaigns`; el prompt y el dominio son propios de adopciones*. Su implementación quedó marcada como "decisión pendiente de aprobación".

Propósitos que se dejan explícitos con esta decisión:

| Módulo | Propósito | Qué NO hace |
|--------|-----------|-------------|
| `campaigns` | **Difusión.** Piezas de marketing para redes y landing. Agrupa de 1 a 10 animales y produce título, contenido, hashtags y CTA. Su IA redacta **publicaciones**. | No crea ni edita perfiles de adopción, no gestiona solicitudes. |
| `adoptions` | **Ficha pública y ciclo de adopción.** Perfil por animal, catálogo, postulaciones, evaluaciones, reserva y cierre. Su IA redactará **la descripción pública del perfil** (Fase 2). | No crea campañas de difusión. |

Regla de oro: si el texto se publica en redes, pertenece a `campaigns`; si vive en el perfil del animal, pertenece a `adoptions`.

## Problem

`modules/campaigns/ai/gemini-client.ts` mezclaba dos responsabilidades: el transporte (clave, modelo, HTTP, reintentos, errores del proveedor) y el dominio de campañas (prompt, lista blanca de animales, validación de sugerencias). Importarlo desde `adoptions` acoplaría ambos dominios y arrastraría `CAMPAIGN_LIMITS`, `CampaignTone` y `AiResponseSchema` en dirección contraria a la arquitectura (ARCHITECTURE §19 y §11).

## Alternatives

1. **Fusionar `campaigns` dentro de `adoptions`.** Descartada: la difusión no es parte del ciclo de adopción; contradice el requerimiento 05 ("el módulo `campaigns` no se modifica") y rompe la modularidad.
2. **Importar `GeminiClient` de campañas desde adopciones.** Descartada: acoplamiento entre dominios y dependencia de tipos y validaciones ajenos.
3. **Extraer solo el transporte a `lib/ai/gemini.ts`.** Elegida: cada módulo conserva su prompt, su schema Zod y su servicio; comparten únicamente la infraestructura.

## Decision

- Crear `lib/ai/gemini.ts` con el transporte: configuración (`GEMINI_API_KEY`, `GEMINI_MODEL`), petición `generateContent`, extracción de JSON, reintentos y `AiServiceError`. No contiene prompts ni contratos de dominio.
- `modules/campaigns/ai/gemini-client.ts` pasa a ser un adapter delgado: mantiene su prompt, su lista blanca y `toSuggestions`, y delega la llamada al transporte compartido.
- `AiServiceError` pasa a ser infraestructura y se reexporta desde `modules/campaigns/types.ts` para no romper la API pública existente. Es la misma clase, no una copia.
- Los textos de cada módulo se validan con esquemas Zod propios. No se reutiliza `AiResponseSchema` de campañas para el perfil de adopción (sus límites son distintos: 80–600 frente a 50–2000 caracteres).
- Las políticas de uso siguen siendo por módulo: campañas mantiene su límite actual y adopciones usará los límites del RF8.6 cuando se implemente.

Esta decisión cubre la **Fase 1**. La Fase 2 (servicio de generación en adopciones, permiso `adoptions.ai`, columnas de origen en `perfil_adopcion` y su migración) queda pendiente de una aprobación explícita.

## Consequences

- Positivo: adopciones podrá usar el mismo proveedor sin importar internos de campañas.
- Positivo: un cambio de proveedor o de política de reintentos se hace en un solo lugar.
- Positivo: queda documentado por qué los dos módulos no se fusionan.
- Negativo: hay una capa adicional y dos esquemas Zod de salida, uno por dominio (intencional).
- Negativo: la reexportación de `AiServiceError` existe solo por compatibilidad; se podrá retirar cuando no haya consumidores del path antiguo.
- Requiere aprobación adicional para cualquier cambio de base de datos o de permisos (Fase 2).
