# Plan Backend-First — Pixkki

## 1. Resumen ejecutivo

Este plan define la migración del flujo de desarrollo de Pixkki de "frontend y backend acoplados vía Server Actions" a un flujo **backend-first API-first**, siguiendo la Opción A (monolito modular API-first). El backend se define, implementa y prueba de forma aislada antes de construir o modificar el frontend. Los Server Actions se mantienen como adaptador de UI sobre los mismos servicios.

## 2. Auditoría del estado actual

### 2.1 Stack detectado

- Next.js 14.2.35 (App Router), React 18.2.0, TypeScript strict
- Supabase (Auth + PostgreSQL) como backend BaaS, solo en la nube
- Zod 4.4.3 como fuente de verdad de validación
- Vitest 4.1.9 (unit), Playwright (e2e), k6 (carga)
- Estructura modular en `modules/` (auth, animals, shelters, spaces, users, etc.)

### 2.2 Arquitectura real

Capas: `UI → Server Action → Service → Repository → Supabase`.

Desviaciones detectadas (ARCHITECTURE.md §7.1):
- `auth`: híbrido, acciones en `action.ts` raíz
- `shelters`: mezcla, schemas en raíz
- `users`: problemático, `user.service.ts` reciente
- `catalogs`, `dashboard`, `use-cases`: no canónicos

### 2.3 Gaps frente a API-first

| Área | Estado | Gap |
|------|--------|-----|
| Contrato API | No existe OpenAPI | ❌ Sin fuente de verdad |
| Versionado | Sin `/api/v1/` | ❌ Cambios rompedores sin control |
| Pruebas aisladas backend | Solo e2e vía UI | ❌ Backend no testeable solo |
| Errores API | Inconsistentes | ❌ Sin formato uniforme |
| Acceso a Supabase | `app/api/auth/logout/route.ts` directo | ❌ Violación de AGENTS.md §9 |

### 2.4 Riesgos del flujo actual

- Backend solo probado vía UI; cambios rompedores se descubren tarde en e2e
- No hay contrato estable entre frontend y backend
- Route Handlers inconsistentes (algunos sin manejo de errores)
- Doble camino de mutación (Server Actions vs Route Handlers ad-hoc)

## 3. Opción recomendada: Monolito modular API-first (Opción A)

Mantener Next.js como único servidor. Agregar capa de API versionada `/api/v1/` con contratos OpenAPI por módulo. Server Actions continúan como adaptador de UI, llamando a los mismos services.

**Por qué:** encaja con el stack actual, mínima disrupción, resuelve el dolor inmediato (contrato + pruebas aisladas), respeta AGENTS.md sin cambio arquitectónico mayor.

## 4. Estructura de carpetas propuesta (canónica actualizada)

```
modules/<modulo>/
├── actions/           # Server Actions (adaptador UI)
├── api/               # Route Handlers versión v1
│   └── v1/
├── components/
├── contracts/         # OpenAPI specs (openapi.yaml)
├── dtos/
├── factories/
├── repositories/
├── services/
├── validators/        # Schemas Zod
└── types/
```

## 5. Flujo de desarrollo backend-first

### 5.1 Pipeline paso a paso

1. **Definir contrato OpenAPI** (`modules/<modulo>/contracts/openapi.yaml`): endpoints, request, response, códigos de error, auth, multitenant.
2. **Revisión y aprobación humana** del contrato.
3. **Implementar backend** sin frontend:
   - Zod schemas de entrada (validación antes de cualquier efecto).
   - Service: lógica de negocio pura, sin Supabase, sin React.
   - Repository: único acceso a Supabase, filtrado por `id_refugio`.
   - Route Handlers en `app/api/v1/...` expuestos según contrato.
   - Manejo uniforme de errores: `{ success, error: { code, message, statusCode } }`.
4. **Probar backend aislado** (sin frontend): unit tests de services/repositories e integration tests de Route Handlers. (Responsabilidad del equipo de QA).
5. **Congelar contrato v1**: tag git, sin cambios rompedores sin nueva versión.
6. **Construir frontend** contra el contrato: Server Actions consumen los mismos services o llaman a `/api/v1/`.

### 5.2 Definition of Ready (DoR)

- Especificación en `docs/features/<feature>.md` o actualización de requerimiento
- Contrato OpenAPI borrado y revisado (endpoints, request, response, errores)
- Zod schemas definidos para entrada
- Módulo y `id_refugio` identificados (multitenant)
- Errores de negocio y códigos HTTP identificados
- Aprobación humana del contrato

### 5.3 Definition of Done (DoD)

- Service implementado sin acceso directo a Supabase (solo vía repository)
- Repository filtrando por `id_refugio` (excepto superadmin/global)
- Route Handlers siguiendo el contrato OpenAPI
- Zod validación en entrada antes de cualquier efecto
- `typecheck` ✓, `lint` ✓, `build` ✓
- Errores en formato uniforme `{ success: false, error: { code, message } }`
- Sin acceso directo a Supabase fuera de `repositories/`
- OpenAPI actualizado y versionado
- git diff revisado por humano

### 5.4 Estrategia de ramas

- Rama principal: `main` (estable, desplegable)
- Rama de feature: `feature/USxx-descripcion` desde `main`
- Pull request: requiere aprobación de 1 revisor + checks verdes
- Protección de main: no push directo, squash merge requerido
- Versionado API: `/api/v1/`; cambios rompedores → `/api/v2/`

### 5.5 CI

Pipeline en cada PR: `typecheck → lint → test:unit → build`.

## 6. Plan de migración por fases (sin detener el proyecto)

| Fase | Duración | Objetivo | Entregable |
|------|----------|----------|------------|
| Fase 0 | Semana 1 | Establecer contrato y herramientas | `modules/auth/contracts/openapi.yaml`, plantilla OpenAPI |
| Fase 1 | Semanas 2-4 | Módulo piloto: auth | Route Handlers `/api/v1/auth/*`, OpenAPI |
| Fase 2 | Semanas 5-7 | Módulo piloto: shelters | Route Handlers `/api/v1/shelters/*`, OpenAPI |
| Fase 3 | Semanas 8-10 | Homogenizar módulos existentes | users, animals, spaces con OpenAPI + Route Handlers |
| Fase 4 | Semanas 11-12 | Frontend contra contrato | UI consume API versionada; Server Actions como adaptador |
| Fase 5 | Semana 13+ | Todas las nuevas features backend-first | DoR/DoD aplicado al 100% |

## 7. Documentación del flujo de trabajo (operativo diario)

### 7.1 Rol del desarrollador backend

1. Leer el requerimiento o historia de usuario.
2. Escribir o actualizar el `openapi.yaml` del módulo.
3. Obtener aprobación humana del contrato.
4. Implementar Zod schemas en `validators/`.
5. Implementar repository en `repositories/` (solo Supabase, con `id_refugio`).
6. Implementar service en `services/` (lógica pura, inyectar repository).
7. Implementar Route Handler en `app/api/v1/<modulo>/route.ts` (o subrutas).
8. Conectar Server Action en `actions/` al mismo service (adaptador UI).
9. Ejecutar `npm run typecheck`, `npm run lint`, `npm run build`.
10. Abrir PR y esperar revisión.

### 7.2 Rol del desarrollador frontend

1. Esperar a que el contrato OpenAPI del módulo esté congelado (v1).
2. Escribir tipos TypeScript derivados del contrato/Zod.
3. Construir componentes y Server Actions que consuman el service o `/api/v1/`.
4. No modificar contrato sin aprobación del backend owner.

### 7.3 Reglas de oro (AGENTS.md)

- Zod es fuente única de verdad: no duplicar interfaces/types equivalentes.
- Lógica de negocio nunca en componentes, Server Actions ni repositories.
- Acceso a Supabase exclusivamente desde `repositories/`.
- Filtrar siempre por `id_refugio` desde el JWT (multitenant).
- Errores tipados, mensajes en español, sin stack traces al cliente.
- `strict: true` siempre; prohibido `any`.

## 8. Checklist de ejecución por fases

### Fase 0 — Fundación

- [ ] Crear carpeta `modules/auth/contracts/`
- [ ] Crear `modules/auth/contracts/openapi.yaml` (borrador)
- [ ] Definir plantilla común de OpenAPI para módulos
- [ ] Aprobación humana del contrato piloto

### Fase 1 — Piloto auth

- [ ] Zod schemas de login, logout, me, recover-password, reset-password
- [ ] Repository de auth con filtro multitenant
- [ ] Service de auth (lógica pura)
- [ ] Route Handlers `/api/v1/auth/*`
- [ ] Server Actions de auth conectadas al service
- [ ] `typecheck`, `lint`, `build` pasando
- [ ] PR revisado y mergeado a `main`

### Fase 2 — Piloto shelters

- [ ] Zod schemas de refugios, estados, espacios
- [ ] Repository con `id_refugio`
- [ ] Service de refugios y espacios
- [ ] Route Handlers `/api/v1/shelters/*`, `/api/v1/espacios/*`
- [ ] Server Actions conectadas
- [ ] `typecheck`, `lint`, `build` pasando
- [ ] PR revisado y mergeado

### Fase 3 — Homogenización

- [ ] users: OpenAPI + Route Handlers + Server Actions
- [ ] animals: OpenAPI + Route Handlers + Server Actions
- [ ] spaces: OpenAPI + Route Handlers + Server Actions
- [ ] Estandarizar manejo de errores en todos los Route Handlers

### Fase 4 — Frontend contra contrato

- [ ] UI consume `/api/v1/` o Server Actions sobre services
- [ ] Tipos TypeScript derivados de contratos/Zod
- [ ] Validación cliente con mismos schemas Zod (compartidos)

### Fase 5 — Operativo continuo

- [ ] Toda feature nueva sigue DoR/DoD
- [ ] Contratos versionados; cambios rompedores → nueva versión
- [ ] Revisión de PR con checklist de arquitectura

## 9. Supuestos

- Supabase se usa únicamente en la nube (no hay entorno local de Supabase CLI).
- Los Server Actions se mantienen como canal principal de mutaciones para la UI.
- Los contratos OpenAPI se escriben a mano y se mantienen sincronizados con el código.
- Las pruebas de unidad e integración son responsabilidad del equipo de QA (fuera del alcance de este plan de implementación).