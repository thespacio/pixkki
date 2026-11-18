# Prompt reutilizable — Implementar un requerimiento de `docs/features/`

> **Cómo usarlo:** invoca al agente con una sola frase:
>
> ```text
> Implementa el requerimiento 01 según docs/prompts/desarrollo-feature.md.
> ```
>
> También puedes acotar el alcance dentro del mismo requerimiento:
>
> ```text
> Implementa RF1.2 y RF1.3 del requerimiento 01 según docs/prompts/desarrollo-feature.md.
> ```
>
> No se implementan varios requerimientos en una misma ejecución.
> El agente debe leer este documento completo antes de tocar código.

---

## 0. Modo de ejecución

Por defecto, este prompt opera en **modo backend-first y ejecución directa**:

| Decisión | Valor por defecto |
|----------|-------------------|
| Unidad de trabajo | Un requerimiento completo de `docs/features/` |
| Alcance | Backend del módulo + Route Handlers `/api/v1` |
| Frontend | **Fuera de alcance** (queda pendiente) |
| Server Actions | **Fuera de alcance** (son adaptador de UI) |
| Tests | **Prohibido modificarlos** |
| Migraciones | Se crean y se aplican al entorno configurado; luego se regeneran los tipos |
| Commit | **No se hace commit** sin instrucción explícita |
| Aprobación | No bloqueante para código backend ordinario; bloqueante en los casos de la sección 8 |

El humano puede sobrescribir un valor por defecto en la invocación. Si la
instrucción contradice `AGENTS.md` o `ARCHITECTURE.md`, el agente **se detiene y
pregunta** antes de actuar.

> **Excepción explícita:** la creación y aplicación de migraciones versionadas
> al entorno configurado forma parte del alcance autorizado de este prompt
> (sección 4.4). No se considera una violación de `AGENTS.md` para esta
> ejecución. Las operaciones destructivas y el `db reset` siguen bloqueados.

---

## 1. Rol y jerarquía de reglas

Actúas como ingeniero de software senior en **Pixkki**, un SaaS multitenant para
la gestión de refugios de animales.

Jerarquía obligatoria ante conflictos:

```text
1. Requisitos funcionales aprobados (docs/features/)
2. Decisiones arquitectónicas aceptadas (docs/decisions/)
3. ARCHITECTURE.md
4. AGENTS.md
5. Patrones existentes y consistentes del repositorio
6. Convenciones locales del módulo
7. Preferencias del agente
```

Reglas no negociables:

- La lógica de negocio vive **solo** en `services/`.
- Supabase se accede **solo** desde `repositories/`.
- Toda consulta y mutación filtra por `id_refugio` de la sesión, salvo el caso
  explícito de superadmin con alcance global.
- Zod es la única fuente de verdad de validación y de tipos derivados.
- Prohibido `any`, `as` injustificado, `@ts-ignore` y `@ts-expect-error`.
- Prohibido duplicar un schema Zod con una `interface` o un `type` equivalente.
- Prohibido modificar tests, desactivar reglas de lint/typecheck o relajar el
  build para “hacer pasar” la implementación.
- Prohibido modificar el frontend en esta ejecución.

---

## 2. Lectura obligatoria antes de tocar código

Leer, en este orden:

1. `AGENTS.md`
2. `ARCHITECTURE.md`
3. El requerimiento indicado en `docs/features/`
4. `docs/decisions/` (ADRs relacionados, si existen)
5. `docs/plan-backend-first.md` (flujo backend-first y Definition of Done)
6. `docs/templates/openapi-module.yaml` (si el requerimiento toca la API)
7. Código del módulo objetivo:
   - `actions/`
   - `services/`
   - `repositories/`
   - `validators/`
   - `dtos/`
   - `factories/`
   - `types/`
   - `errors.ts`
   - `access.ts`
   - `contracts/openapi.yaml`
8. Route Handlers existentes en `app/api/v1/`
9. Helpers compartidos en `lib/api/` y `lib/supabase/`
10. Tests existentes **solo para leer** (no se modifican)

Del requerimiento, identificar y listar antes de implementar:

- RF y US incluidos en el alcance.
- Sección **“No incluye”** y funcionalidades de épicas futuras.
- Reglas de negocio.
- Contrato de API (`request`, `response`, códigos de error, permisos).
- Esquema de base de datos implicado.
- Criterios de aceptación por historia de usuario.
- Plan de implementación backend-first detallado por módulo.
- Estado actual del requerimiento (`Implementado`, `Parcial`, `Pendiente`).

---

## 3. Alcance de la ejecución

### 3.1 Incluido

- Análisis de lo existente y de los gaps frente al requerimiento.
- Contrato OpenAPI del módulo.
- Validators Zod y DTOs derivados con `z.infer`.
- Tipos de dominio que no sean contratos de validación.
- Errores de dominio en `errors.ts`.
- Reglas de acceso y permisos del módulo (`access.ts` o equivalente).
- Repositories con acceso a Supabase.
- Services con lógica de negocio.
- Factories de composición.
- Route Handlers en `app/api/v1/`.
- Migración SQL en `supabase/migrations/` y su aplicación al entorno configurado si el requerimiento la exige.
- Actualización del estado y trazabilidad en el documento del requerimiento.
- Reporte final con `git diff`.

### 3.2 Fuera de alcance

- Componentes, páginas, layouts, hooks, formularios, tablas, modales, estilos o
  cualquier archivo de UI.
- `app/(protected)/`, `app/(public)/`, `components/` y
  `modules/*/components/`.
- Server Actions, salvo que la invocación lo pida explícitamente.
- Tests unitarios, de integración o e2e.
- Actualización de dependencias.
- Refactors masivos o cambios de estilo no solicitados.
- Implementar requerimientos o épicas posteriores.
- Cambios de arquitectura, contratos entre módulos o estructura global.

> **Frontend pendiente:** si un criterio de aceptación depende de la interfaz,
> no lo implementes. Déjalo listado en el reporte final como pendiente de la
> fase de frontend, con el contrato que la UI necesitará.

---

## 4. Flujo de trabajo

### 4.1 Preflight

Ejecutar:

```bash
git status --short
git branch --show-current
```

Reglas:

- No mezclar cambios staged o no confirmados de otra tarea.
- No cambiar de rama ni hacer commit sin instrucción explícita.
- Si el árbol tiene cambios ajenos al requerimiento, trabajar solo sobre los
  archivos necesarios y reportarlo.
- Si el requerimiento ya está marcado como implementado, **no reimplementar**:
  auditar contra los criterios de aceptación, corregir solo gaps y reportar.

### 4.2 Análisis inicial (no bloqueante)

Antes de editar, publicar un análisis breve:

```text
Requerimiento:
RF / US en alcance:
Módulo principal:
Módulos de apoyo:
Estado actual:
Qué existe:
Qué falta:
Archivos a crear:
Archivos a modificar:
Dependencias:
Riesgos:
Cambios de base de datos:
Decisiones que requieren aprobación:
```

No esperar aprobación para continuar, salvo que se active un bloqueo de la
sección 8.

### 4.3 Orden de implementación

1. **Contrato:** actualizar `modules/<modulo>/contracts/openapi.yaml` con los
   endpoints, request, response, permisos y errores del requerimiento.
2. **Base de datos:** crear y aplicar la migración si hace falta (sección 4.4).
3. **Validación:** schemas Zod en `validators/` y DTOs en `dtos/`.
4. **Tipos:** tipos de dominio en `types/` solo si no se derivan de Zod.
5. **Errores:** clases de error del módulo en `errors.ts`.
6. **Acceso:** permisos y alcance multitenant en `access.ts`.
7. **Repositories:** acceso a Supabase y mapeo de filas a dominio.
8. **Services:** reglas de negocio y coordinación.
9. **Factories:** ensamblado de repository → service.
10. **Route Handlers:** adaptadores HTTP delgados en `app/api/v1/`.
11. **Documentación:** estado, trazabilidad y pendientes del requerimiento.

No saltarse capas ni invertir dependencias.

### 4.4 Migraciones

Si el requerimiento exige tablas, columnas, RPC o políticas RLS:

- Crear un archivo en `supabase/migrations/` con el patrón:
  `YYYYMMDDHHMMSS_requerimiento_XX_descripcion_corta.sql`.
- La migración debe ser **idempotente** y ejecutarse dentro de una transacción.
- Incluir `id_refugio` cuando la entidad sea multitenant.
- Incluir políticas RLS como segunda capa de defensa.
- En RPC transaccionales, definir `security definer`, `search_path` seguro y
  `grant execute` solo a los roles necesarios.
- No editar migraciones históricas ya aplicadas.

**Aplicación:**

- Revisar el SQL y confirmar que el proyecto está enlazado al entorno correcto.
- Aplicar la migración con `npx supabase db push` o el comando equivalente
  configurado por el equipo.
- Verificar el resultado de la aplicación. Si falla, detenerse, reportar el
  error y no continuar con una migración a medias.
- Después de aplicar, regenerar los tipos con `npm run db:types`.
- **Nunca editar `types/database.ts` a mano.**
- **Nunca ejecutar `supabase db reset`** salvo instrucción explícita.
- Si el entorno no está disponible o faltan credenciales, detenerse y reportar
  el bloqueo; no simular la aplicación.
- Si la migración implica pérdida de datos, backfill destructivo, renombre de
  columnas o cambio incompatible de contrato, detenerse y pedir aprobación
  **antes de aplicarla**.

Al finalizar, la migración debe quedar **creada y aplicada**, con
`types/database.ts` regenerado. Si no pudo aplicarse, el reporte debe indicar el
bloqueo exacto y el estado en que quedó el entorno.

> **Excepción aprobada:** este prompt autoriza aplicar migraciones versionadas
> al entorno configurado como parte de la ejecución. Las operaciones
> destructivas, el `db reset` y los cambios incompatibles siguen requiriendo
> aprobación explícita.

### 4.5 Documentación y trazabilidad

- Actualizar la sección de estado del requerimiento solo si todos los RF en
  alcance quedaron completos. Si es parcial, indicar `Parcial` y qué falta.
- Añadir o actualizar una tabla de trazabilidad `RF/US → archivos → estado`.
- No reescribir la especificación funcional ni las reglas de negocio.
- No marcar como implementado el frontend.

---

## 5. Convenciones por capa

### 5.1 Contrato OpenAPI

- Fuente de verdad de la superficie pública del módulo.
- Copiar la estructura de `docs/templates/openapi-module.yaml`.
- Envelope uniforme:
  - éxito: `{ success: true, data }`
  - error: `{ success: false, error: { code, message, statusCode } }`
- Códigos de error en `UPPER_SNAKE_CASE`, estables.
- Mensajes en español para el usuario final.
- Autenticación por cookie de sesión de Supabase.
- Si cambia la superficie pública, subir la versión del contrato.

### 5.2 Validators y DTOs

- Archivo: `modules/<modulo>/validators/<entidad>.validators.ts`.
- Exportar schemas con nombre `camelCaseSchema` o el patrón ya usado por el
  módulo (por ejemplo, `CreateAnimalSchema`).
- Derivar tipos con `z.infer<typeof Schema>`.
- Los DTOs viven en `dtos/` solo cuando aportan separación real.
- No duplicar el contrato en `types/` ni en interfaces.
- Validar:
  - campos obligatorios;
  - rangos, longitudes, enums y refinamientos;
  - IDs positivos;
  - fechas válidas y no futuras cuando aplique;
  - reglas condicionales del requerimiento.
- En actualizaciones parciales, cuidado con los `.default()` de Zod 4 dentro de
  `.partial()`: no deben pisar datos existentes.

### 5.3 Tipos

- `types/` solo para tipos que no son contratos de validación.
- Preferir `type` sobre `interface`.
- No crear tipos redundantes.
- Los tipos de fila de Supabase se derivan de `Database[...]` cuando existan.

### 5.4 Errores

- Archivo: `modules/<modulo>/errors.ts`.
- Cada error de negocio debe exponer:
  - `code` estable en `UPPER_SNAKE_CASE`;
  - `statusCode` HTTP;
  - mensaje en español;
  - `name` de la clase.
- No exponer stack traces ni detalles internos al cliente.
- Diferenciar errores esperados de errores inesperados.
- `handleApiError` traduce el error al envelope uniforme.

### 5.5 Acceso y permisos

- Archivo: `modules/<modulo>/access.ts` o el patrón equivalente existente.
- Definir permisos del módulo (por ejemplo, `animals.view`, `animals.create`).
- Resolver el alcance del usuario:
  - `shelterId` propio;
  - `allShelters` solo para superadmin.
- La autorización real se valida en el servidor; la UI no es suficiente.
- Los accesos cruzados entre refugios se responden como `404`.

### 5.6 Repositories

- Archivo: `modules/<modulo>/repositories/<entidad>.repository.ts`.
- Clase con constructor que recibe `SupabaseClient<Database>`.
- Único punto de acceso a Supabase.
- Sin lógica de negocio.
- Filtrar siempre por `id_refugio`, salvo método global explícito de superadmin.
- Mapear filas de persistencia a tipos de dominio.
- Respetar `deleted_at` si la tabla usa soft delete.
- Propagar errores de Supabase; no silenciarlos.

### 5.7 Services

- Archivo: `modules/<modulo>/services/<entidad>.service.ts`.
- Clase con repository inyectado.
- Lógica de negocio pura: sin Supabase, sin React, sin `page.tsx`.
- Validar coherencia entre entidades, reglas de estado, permisos de negocio y
  transiciones.
- Lanzar errores de dominio tipados.
- Aceptar el alcance (`access`) o `idRefugio` cuando corresponda.
- No confiar en datos ocultos por la UI.

### 5.8 Factories

- Archivo: `modules/<modulo>/factories/create-<entidad>-service.ts`.
- Función asíncrona que crea el cliente de Supabase, instancia el repository y
  devuelve el service ensamblado.
- No instanciar repositories o services dispersamente fuera de la factory.

### 5.9 Route Handlers

- Ubicación: `app/api/v1/<recurso>/route.ts`.
- Los handlers son adaptadores delgados:

```text
Request
  ↓
Sesión + permisos
  ↓
Validación Zod
  ↓
Service
  ↓
Envelope uniforme
```

Reglas:

- Usar `getCurrentUser()` y un helper `require<Modulo>User` si el módulo ya lo
  tiene.
- Validar el body con `safeParse` y `readJsonBody`.
- Validar path params con `parseRouteId`.
- Validar query params con los helpers de `lib/api/request.ts`.
- Responder con `apiSuccess`, `apiValidationError` y `handleApiError`.
- No contener lógica de negocio.
- No acceder a Supabase directamente.
- No crear endpoints fuera del contrato OpenAPI.
- Seguir el patrón de rutas existente en `app/api/v1/`.

---

## 6. Reglas transversales

### 6.1 Multitenant

- Toda entidad de negocio se filtra por `id_refugio`.
- El `id_refugio` se obtiene de la sesión, no del cliente.
- Solo el superadmin puede operar con alcance global, y debe quedar explícito en
  el service y en el repository.
- RLS es una segunda capa, no la única defensa.

### 6.2 Autorización

- Verificar permisos en el servidor antes de cualquier efecto.
- Los roles clínicos (`veterinarian`, `admin`) se validan en el service.
- No confiar en que la UI oculta un botón.

### 6.3 Validación

- Toda entrada externa es no confiable.
- Zod valida antes de cualquier efecto.
- Los errores de validación se responden con `400 VALIDATION_ERROR`.
- No reutilizar un schema de creación como schema de actualización sin revisar
  defaults y campos inmutables.

### 6.4 Errores y respuestas

- Envelope uniforme en toda la API v1.
- `404` para recursos inexistentes o accesos cruzados.
- `403` para permisos insuficientes.
- `409` para conflictos de estado, concurrencia o reglas de negocio.
- `500` sin detalles internos.
- Mensajes en español, claros para el usuario final.

### 6.5 Naming e imports

- Archivos en `kebab-case` o el patrón `<entidad>.<capa>.ts` ya usado por el
  módulo.
- Componentes no aplican en esta ejecución.
- Imports absolutos con alias `@/modules/...`.
- Prohibidos imports relativos profundos (`../../../`).
- No crear barrel files (`index.ts`) solo para simplificar imports.

---

## 7. Verificación

Ejecutar sin pedir permiso:

```bash
npm run typecheck
npm run lint
npm run build
```

Reglas:

- Corregir solo errores derivados de la implementación.
- No modificar tests.
- No desactivar reglas de lint/typecheck.
- Si un test falla por expectativas desactualizadas, reportarlo; no editarlo.
- Si el build falla por variables de entorno o por tipos generados
  desactualizados, reportar el error y el bloqueo.
- Un build exitoso no implica que la funcionalidad sea correcta: revisar también
  los criterios de aceptación del requerimiento.

---

## 8. Bloqueos obligatorios: detenerse y pedir aprobación

Aunque el modo sea de ejecución directa, **detenerse antes de actuar** si:

- La instrucción contradice `AGENTS.md` o `ARCHITECTURE.md`, salvo la excepción
  de migraciones de la sección 4.4.
- Se requiere modificar tests.
- La migración implica pérdida de datos, backfill destructivo, renombre de
  columnas o cambio incompatible de contrato.
- Se requiere modificar un módulo fuera del objetivo (no basta con consumir su
  interfaz pública).
- Se requiere cambiar la arquitectura, la estructura global o un contrato entre
  módulos.
- Se requiere actualizar dependencias.
- El requerimiento es ambiguo, contradictorio o depende de otro requerimiento no
  implementado.
- El requerimiento no tiene especificación en `docs/features/`.
- Se detecta duplicación de schemas Zod o acceso directo a Supabase fuera de
  `repositories/`.
- El cambio afecta a varios requerimientos o épicas.

En esos casos: explicar el bloqueo, proponer alternativas y esperar respuesta.
No improvisar.

---

## 9. Entregable final

Al terminar, entregar en español:

```text
1. Resumen
   - Qué se implementó y por qué.

2. Trazabilidad
   - RF / US → archivos → estado.

3. Archivos creados
   - Ruta y propósito.

4. Archivos modificados
   - Ruta y cambio puntual.

5. API
   - Endpoints implementados.
   - Request / response.
   - Permisos.
   - Códigos de error.

6. Base de datos
   - Migración creada (ruta).
   - Entorno donde se aplicó.
   - Resultado de la aplicación.
   - types/database.ts regenerado: sí / no.
   - Riesgos o bloqueos.

7. Verificación
   - typecheck: ✓ / ✗
   - lint: ✓ / ✗
   - build: ✓ / ✗
   - Errores preexistentes o bloqueos.

8. Frontend pendiente
   - Pantallas o componentes que consumirán la API.
   - Contratos, permisos y estados de UI que necesitarán.
   - Nada de esto se implementó en esta ejecución.

9. Pendientes y decisiones
   - Hecho.
   - Pendiente.
   - Requiere aprobación.

10. git diff
   - `git diff --stat`
   - Diff completo o por archivo.
```

No hacer commit. No ejecutar `git push`. No ejecutar `supabase db reset`.

---

## 10. Definition of Done backend

```text
[ ] Leí AGENTS.md, ARCHITECTURE.md y el requerimiento completo
[ ] Identifiqué RF/US en alcance y respeté “No incluye”
[ ] No implementé frontend ni Server Actions
[ ] No modifiqué tests
[ ] No desactivé lint/typecheck
[ ] Zod es fuente única de verdad
[ ] No hay schemas o tipos duplicados
[ ] Los repositories filtran por id_refugio
[ ] Los services no acceden a Supabase
[ ] Los Route Handlers son delgados y usan el envelope uniforme
[ ] La autorización se valida en el servidor
[ ] El contrato OpenAPI está actualizado
[ ] La migración, si existe, fue creada y aplicada; types/database.ts regenerado
[ ] El estado del requerimiento quedó actualizado
[ ] typecheck ✓
[ ] lint ✓
[ ] build ✓
[ ] Mostré el diff
[ ] Reporté pendientes de frontend
```

---

## 11. Checklist de anti-patrones

```text
✗ Implementar componentes o páginas “de paso”
✗ Crear Server Actions porque “luego harán falta”
✗ Acceder a Supabase desde un service, action o route handler
✗ Filtrar por id_refugio solo en RLS
✗ Duplicar schema Zod + interface + type
✗ Usar any o as para sortear tipos
✗ Modificar tests para que pasen
✗ Aplicar una migración sin archivo versionado
✗ Ejecutar supabase db reset sin autorización
✗ Editar types/database.ts a mano
✗ Implementar RF de épicas posteriores
✗ Refactorizar módulos ajenos sin aprobación
✗ Hacer commit sin instrucción humana
```
