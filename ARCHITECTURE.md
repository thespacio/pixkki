# Pixkki — Architecture

## 1. Propósito

Este documento define la arquitectura técnica de **Pixkki** y establece las reglas estructurales que deben mantenerse durante el desarrollo del sistema.

Pixkki utiliza una arquitectura modular orientada a dominio, con separación clara entre:

* presentación
* aplicación
* dominio
* persistencia
* infraestructura

La arquitectura debe permitir:

* desarrollar funcionalidades de forma incremental;
* mantener módulos independientes;
* sustituir implementaciones sin afectar el dominio;
* reutilizar patrones entre módulos;
* facilitar pruebas;
* reducir acoplamiento;
* permitir que agentes de IA trabajen sobre el código de forma controlada.

---

# 2. Principios arquitectónicos

## 2.1 Modularidad

Cada funcionalidad de negocio debe pertenecer a un módulo claramente identificado.

Los módulos deben minimizar sus dependencias entre sí.

```text
modules/
├── auth/
├── users/
├── shelters/
├── animals/
└── spaces/
```

Un módulo debe encapsular su:

* lógica de negocio;
* acceso a datos;
* validación;
* DTOs;
* casos de uso;
* composición de dependencias;
* componentes específicos de la funcionalidad.

---

## 2.2 Separación de responsabilidades

Cada capa debe tener una responsabilidad concreta.

```text
UI
 ↓
Action
 ↓
Service
 ↓
Repository
 ↓
Database
```

Las responsabilidades no deben mezclarse.

---

## 2.3 Dependencia hacia abstracciones

La lógica de negocio no debe depender directamente de detalles de infraestructura.

Preferir:

```text
Service
  ↓
Repository interface
  ↓
Repository implementation
  ↓
Supabase
```

sobre:

```text
Service
  ↓
Supabase directamente
```

---

## 2.4 Single Source of Truth

Cada concepto debe tener una única fuente de verdad.

Particularmente:

> **Zod es la única fuente de verdad para los esquemas de datos que requieren validación.**

Los tipos derivados deben obtenerse de dichos esquemas cuando corresponda.

```ts
const UserSchema = z.object({
  name: z.string(),
});

type User = z.infer<typeof UserSchema>;
```

No deben mantenerse definiciones equivalentes duplicadas:

```ts
const UserSchema = ...
interface User = ...
type User = ...
```

cuando representan exactamente el mismo contrato.

---

## 2.5 Cambios incrementales

La arquitectura debe evolucionar progresivamente.

No se realizarán refactorizaciones masivas únicamente para alcanzar una estructura ideal.

Cuando exista código legado o inconsistente:

1. identificar la desviación;
2. documentarla si es relevante;
3. definir el patrón canónico;
4. corregir progresivamente;
5. evitar introducir nuevas inconsistencias.

---

## 2.6 Compatibilidad con desarrollo asistido por IA

La arquitectura debe ser suficientemente explícita para que un agente de IA pueda determinar:

* dónde colocar código;
* qué dependencias puede utilizar;
* qué dependencias no puede utilizar;
* qué capa es responsable de cada operación;
* cuándo una modificación constituye un cambio arquitectónico.

---

# 3. Stack tecnológico

Pixkki utiliza:

| Área               | Tecnología                            |
| ------------------ | ------------------------------------- |
| Framework          | Next.js 14.2.35                       |
| UI                 | React 18.2.0                          |
| Lenguaje           | TypeScript                            |
| Backend / Database | Supabase                              |
| Supabase JS        | 2.82.0                                |
| Validación         | Zod 4.4.3                             |
| Routing            | Next.js App Router                    |
| Arquitectura       | Modular Monolith + Clean Architecture |
| Rendering          | Server Components por defecto         |
| Mutaciones         | Server Actions                        |

Las versiones anteriores representan las versiones objetivo actuales del proyecto. No deben actualizarse como parte de una feature ordinaria.

Las actualizaciones de dependencias constituyen cambios independientes que deben evaluarse y aprobarse por separado.

---

# 4. Arquitectura general

Pixkki utiliza un **Modular Monolith**.

Todos los módulos viven dentro de una misma aplicación, pero cada módulo mantiene límites internos explícitos.

```text
┌─────────────────────────────────────────────┐
│                   PIXKKI                    │
│                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │  Users   │ │ Animals  │ │ Shelters │    │
│  └──────────┘ └──────────┘ └──────────┘    │
│                                             │
│  ┌──────────┐ ┌──────────┐                  │
│  │  Spaces  │ │   Auth   │                  │
│  └──────────┘ └──────────┘                  │
│                                             │
└─────────────────────────────────────────────┘
                     │
                     ▼
                Supabase
```

No se utilizan microservicios.

---

# 5. Estructura general del proyecto

La estructura objetivo es:

```text
/
├── app/
├── modules/
├── components/
├── lib/
├── docs/
│   ├── features/
│   └── decisions/
│
├── public/
│
├── AGENTS.md
├── ARCHITECTURE.md
├── CONTRIBUTING.md
├── README.md
│
├── package.json
├── tsconfig.json
├── next.config.*
└── ...
```

---

# 6. `app/`

`app/` pertenece exclusivamente a la capa de aplicación de Next.js.

Responsabilidades:

* routing;
* layouts;
* páginas;
* loading states;
* error boundaries;
* metadata;
* integración con Server Actions;
* composición de UI específica de rutas.

Ejemplo:

```text
app/
├── dashboard/
│   └── page.tsx
├── animals/
│   └── page.tsx
├── shelters/
│   └── page.tsx
└── ...
```

## Regla

`app/` no debe contener lógica de negocio significativa.

Incorrecto:

```text
page.tsx
  ├── consulta Supabase
  ├── valida reglas de negocio
  ├── transforma datos
  └── ejecuta múltiples operaciones
```

Preferido:

```text
page.tsx
  ↓
module service / query
  ↓
repository
```

---

# 7. `modules/`

`modules/` contiene las funcionalidades de negocio de Pixkki.

Cada módulo representa un área funcional.

Actualmente:

```text
modules/
├── auth/
├── animals/
├── shelters/
├── spaces/
└── users/
```

La estructura canónica objetivo es:

```text
modules/
└── <module>/
    ├── actions/
    ├── components/
    ├── dtos/
    ├── factories/
    ├── repositories/
    ├── services/
    ├── validators/
    └── types/
```

No todos los módulos necesitan obligatoriamente todos los directorios.

Los directorios se crean cuando existe una responsabilidad real que justificarlos.

---

## 7.1 Estado actual de módulos

| Módulo | Estado | Desviaciones |
|--------|--------|--------------|
| **animals** | Casi canónico | Errores movidos a `errors.ts`; validadores en `validators/`; tipos en `types/`. |
| **auth** | Híbrido | Acciones en `action.ts` raíz; subdirectorios `forgot-password/`, `login/`, `mfa/` con estructura propia. |
| **shelters** | Mezcla | Schemas en raíz; componentes específicos en `ShelterForm/`, `ShelterDetail/`; `mapper.ts` y `client.ts` en raíz. |
| **spaces** | Incompleto | Falta `errors.ts` y `validators/` separada; `schemas.ts` en raíz; `types/` mezcla DTOs y tipos BD. |
| **users** | Problemático | `user.service.ts` recientemente implementado; `errors.ts` existe; acciones en subdirectorio. |
| **catalogs** | No canónico | Solo `constants/mexican-states.ts`; no sigue estructura de módulo. |
| **dashboard** | No canónico | Solo componentes de layout y navegación; no es módulo de dominio. |
| **use-cases** | No canónico | `createShelterWithAdmin.ts` aislado; debería vivir en `shelters/` o `auth/`. |

---

## 7.2 Reglas de homogenización

1. Toda nueva feature debe implementarse en la estructura canónica.
2. Los módulos existentes se homogenizarán progresivamente, no masivamente.
3. No se crearán carpetas sin responsabilidad real.
4. Los errores de dominio viven en `errors.ts` dentro del módulo.
5. Los schemas Zod viven en `validators/` o `schemas.ts` (no ambos).
6. Los DTOs se derivan de Zod y viven en `dtos/` cuando sea necesario separarlos de `types/`.

---

# 8. Estructura interna de un módulo

## 8.1 `actions/`

Contiene Server Actions.

Responsabilidades:

* recibir input externo;
* validar input;
* invocar servicios;
* manejar el resultado de aplicación;
* devolver resultados apropiados para la UI.

Una Action no debe contener lógica de negocio compleja.

Flujo:

```text
Client
 ↓
Server Action
 ↓
Service
```

---

## 8.2 `components/`

Contiene componentes específicos del módulo.

Ejemplo:

```text
modules/spaces/components/
├── SpaceForm.tsx
├── SpaceTable.tsx
└── EditSpaceForm.tsx
```

Los componentes deben encargarse principalmente de:

* presentación;
* interacción;
* estado local de UI;
* composición de componentes.

No deben implementar lógica de persistencia directamente.

---

## 8.3 `dtos/`

Contiene contratos de datos utilizados entre capas cuando sea necesario.

Los DTOs deben derivarse de schemas Zod cuando corresponda.

Ejemplo:

```ts
export const CreateSpaceSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

export type CreateSpaceDTO =
  z.infer<typeof CreateSpaceSchema>;
```

No duplicar la definición del contrato en interfaces independientes.

---

## 8.4 `factories/`

Las factories ensamblan dependencias.

Ejemplo conceptual:

```text
createSpaceService()
       │
       ├── SpaceRepository
       └── SpaceService
```

Esto permite:

* centralizar composición;
* sustituir implementaciones;
* evitar instanciación dispersa;
* facilitar pruebas.

---

## 8.5 `repositories/`

Los repositories encapsulan el acceso a persistencia.

Responsabilidades:

* consultas;
* inserciones;
* actualizaciones;
* eliminaciones;
* mapeo entre persistencia y modelos utilizados por la aplicación.

El resto de la aplicación no debe realizar consultas directas a Supabase cuando exista un repository para esa operación.

Ejemplo:

```text
SpaceService
      ↓
SpaceRepository
      ↓
Supabase
```

---

## 8.6 `services/`

Los services contienen lógica de aplicación y reglas de negocio.

Ejemplo:

```text
createSpace()
updateSpace()
deleteSpace()
getSpace()
```

Un service puede coordinar:

* validación;
* repositories;
* reglas de negocio;
* operaciones relacionadas;
* transformación de datos.

No debe depender directamente de componentes React.

---

## 8.7 `validators/`

Contiene schemas Zod.

Ejemplo:

```text
modules/spaces/validators/
├── space.validators.ts
```

Los validators son la fuente de verdad para:

* validación;
* tipos derivados;
* contratos de entrada.

No deben duplicarse schemas en otras capas.

---

## 8.8 `types/`

Contiene tipos que no constituyen contratos de validación.

Debe evitarse utilizar `types/` para duplicar schemas Zod.

Si un tipo puede derivarse de Zod:

```ts
type Space = z.infer<typeof SpaceSchema>;
```

debe preferirse esa estrategia.

---

# 9. `components/`

`components/` contiene componentes UI reutilizables entre módulos.

Ejemplos:

```text
components/
├── ui/
├── forms/
├── tables/
└── layout/
```

Un componente debe pertenecer a `components/` solamente si tiene reutilización real o una responsabilidad transversal.

Los componentes específicos de un dominio deben permanecer dentro de su módulo.

```text
modules/animals/components/AnimalCard.tsx
```

en lugar de:

```text
components/AnimalCard.tsx
```

si únicamente pertenece a Animals.

---

# 10. `lib/`

`lib/` contiene infraestructura y utilidades transversales.

Ejemplos:

```text
lib/
├── supabase/
├── errors/
├── utils/
└── ...
```

No debe utilizarse como un depósito genérico para código que no tenga ubicación clara.

Antes de colocar algo en `lib/`, determinar si realmente es:

* transversal;
* independiente de un módulo;
* infraestructura compartida.

Si pertenece a un dominio específico, debe permanecer dentro del módulo.

---

# 11. Flujo de dependencias

La dirección general será:

```text
┌───────────────────┐
│       UI          │
│ pages/components  │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│   Server Actions  │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│     Services      │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│    Repository     │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│     Supabase      │
└───────────────────┘
```

La dirección inversa debe evitarse.

---

# 12. Repository Pattern

Los repositories abstraen la persistencia.

Conceptualmente:

```ts
interface SpaceRepository {
  findById(id: string): Promise<Space | null>;
  findAll(): Promise<Space[]>;
  create(data: CreateSpaceDTO): Promise<Space>;
  update(id: string, data: UpdateSpaceDTO): Promise<Space>;
  delete(id: string): Promise<void>;
}
```

La implementación puede utilizar Supabase:

```text
SpaceRepository
      │
      ▼
SupabaseSpaceRepository
```

El service debe depender de la abstracción siempre que la complejidad del módulo lo justifique.

---

# 13. Services

Los services representan operaciones de aplicación.

Ejemplo:

```text
SpaceService
│
├── createSpace()
├── updateSpace()
├── deleteSpace()
└── getSpace()
```

Los services no deben:

* renderizar componentes;
* utilizar hooks de React;
* acceder directamente al DOM;
* depender de `page.tsx`;
* contener lógica exclusiva de presentación.

---

# 14. Server Actions

Las Server Actions funcionan como frontera entre UI y aplicación.

Responsabilidad:

```text
Input
 ↓
Validation
 ↓
Service
 ↓
Result
```

Ejemplo conceptual:

```ts
"use server";

export async function createSpaceAction(input: unknown) {
  const data = CreateSpaceSchema.parse(input);

  const service = createSpaceService();

  return service.create(data);
}
```

La Action no debe convertirse en un service disfrazado.

---

# 15. Validación

Toda entrada externa debe considerarse no confiable.

Fuentes posibles:

* formularios;
* Server Actions;
* parámetros;
* query strings;
* datos externos;
* integraciones.

Debe utilizarse Zod cuando corresponda.

```text
External Input
      ↓
     Zod
      ↓
Validated Data
      ↓
Application
```

---

# 16. React y rendering

Pixkki utiliza **Server Components por defecto**.

Un componente debe convertirse en Client Component únicamente cuando necesita comportamiento que requiere cliente, como:

* hooks;
* interacción específica;
* APIs del navegador;
* estado interactivo;
* eventos que requieren ejecución en cliente.

Evitar `"use client"` innecesario.

Preferir:

```text
Server Component
      ↓
Client Component
```

en lugar de convertir árboles completos en Client Components.

---

# 17. Supabase

Supabase es la infraestructura de persistencia.

El acceso debe centralizarse mediante las abstracciones correspondientes.

Preferido:

```text
Service
 ↓
Repository
 ↓
Supabase
```

No preferido:

```text
Component
 ↓
Supabase
```

ni:

```text
Server Action
 ↓
Supabase
```

cuando la operación pertenece a un repository existente.

La configuración de Supabase debe permanecer centralizada en la infraestructura correspondiente.

---

# 18. Autenticación y autorización

`auth` es un módulo transversal con responsabilidades propias.

Debe distinguirse:

```text
Authentication
```

de:

```text
Authorization
```

Authentication:

> ¿Quién es el usuario?

Authorization:

> ¿Qué puede hacer?

Las reglas de autorización no deben depender exclusivamente de controles de UI.

La interfaz puede ocultar acciones, pero la autorización real debe verificarse en el servidor.

---

# 19. Comunicación entre módulos

Los módulos deben mantener bajo acoplamiento.

Preferir:

```text
Module A
   ↓
public application interface
   ↓
Module B
```

Evitar:

```text
Module A
   ↓
Module B internals
   ↓
Module B repository
```

Un módulo no debe depender directamente de los detalles internos de otro módulo.

---

# 20. Importaciones

Se deben preferir imports explícitos.

No utilizar barrel files (`index.ts`) únicamente para simplificar imports.

Preferir:

```ts
import { SpaceService } from "@/modules/spaces/services/space.service";
```

sobre:

```ts
import { SpaceService } from "@/modules/spaces";
```

Esto mantiene visibles las dependencias reales.

---

# 21. Naming

Los nombres deben ser consistentes y predecibles.

Preferencias:

```text
space.service.ts
space.repository.ts
space.validators.ts
space.actions.ts
space.dto.ts
```

Clases:

```text
SpaceService
SupabaseSpaceRepository
```

Funciones:

```text
createSpace()
updateSpace()
deleteSpace()
```

Componentes:

```text
SpaceForm
SpaceTable
SpaceCard
```

Evitar abreviaciones innecesarias.

---

# 22. Manejo de errores

Los errores deben manejarse de manera explícita.

Evitar:

```ts
try {
  ...
} catch {
  return null;
}
```

si esto oculta un error significativo.

Los errores deben:

* conservar contexto;
* diferenciar errores esperados de inesperados;
* permitir que la UI presente información apropiada;
* evitar exponer información sensible.

Los detalles específicos del sistema no deben exponerse directamente al usuario final.

---

# 23. DTOs y modelos

Debe distinguirse entre:

```text
Input DTO
Application data
Persistence data
UI data
```

cuando realmente representen conceptos diferentes.

No crear capas de transformación artificiales cuando los datos son equivalentes y no aportan valor.

La arquitectura debe evitar tanto:

* acoplamiento excesivo;
* como sobreingeniería.

---

# 24. Reutilización

La reutilización debe ocurrir después de identificar una necesidad real.

No crear abstracciones genéricas anticipadamente.

Preferir:

```text
Código claro y específico
```

antes que:

```text
Abstracción genérica prematura
```

Una abstracción debe justificarse por:

* repetición real;
* responsabilidad compartida;
* estabilidad del concepto;
* reducción significativa de complejidad.

---

# 25. Homogenización progresiva

Los módulos existentes no tienen que ser idénticos inmediatamente.

El patrón canónico se utilizará para nuevas funcionalidades.

Los módulos existentes se homogenizarán progresivamente.

Orden recomendado:

```text
1. Definir patrón canónico
2. Documentar desviaciones
3. Evitar nuevas desviaciones
4. Refactorizar pequeñas áreas
5. Verificar
6. Continuar
```

Nunca realizar una refactorización global solamente por uniformidad estética.

---

# 26. Cambios arquitectónicos

Un cambio se considera arquitectónico cuando modifica, por ejemplo:

* estructura de módulos;
* dirección de dependencias;
* patrones de persistencia;
* contratos entre módulos;
* estrategia de autenticación;
* infraestructura;
* tecnologías fundamentales;
* estructura global de carpetas;
* patrones de composición.

Estos cambios requieren:

1. análisis;
2. propuesta;
3. evaluación de alternativas;
4. aprobación;
5. documentación mediante ADR cuando corresponda;
6. implementación.

La IA **no debe realizar unilateralmente cambios arquitectónicos**.

---

# 27. Architecture Decision Records

Las decisiones arquitectónicas importantes se documentan en:

```text
docs/decisions/
```

Formato:

```text
ADR-XXXX-short-description.md
```

Estructura:

```markdown
# ADR-XXXX — Title

## Status

Accepted

## Context

## Problem

## Alternatives

## Decision

## Consequences
```

Los ADR deben registrar decisiones, no instrucciones operativas.

---

# 28. Desarrollo de nuevas features

Toda nueva funcionalidad significativa debe seguir:

```text
Requirement
    ↓
Specification
    ↓
Architectural analysis
    ↓
Implementation plan
    ↓
Approval
    ↓
Implementation
    ↓
Verification
    ↓
Review
    ↓
Commit
```

La especificación se almacena en:

```text
docs/features/
```

---

# 29. Verificación

Antes de considerar terminada una modificación, se deben ejecutar los mecanismos disponibles de verificación.

Como mínimo, cuando formen parte del proyecto:

```text
TypeScript
ESLint
Build
```

Los tests son responsabilidad del flujo de pruebas establecido para el proyecto y **no deben ser modificados por el agente de vibecoding**.

La existencia de un build exitoso no implica automáticamente que la funcionalidad sea correcta.

---

# 30. Git

El desarrollo se realiza mediante cambios pequeños y trazables.

Flujo:

```text
main
  │
  └── feature/<name>
         │
         ├── specification
         ├── implementation
         ├── verification
         ├── review
         └── commit
```

Los commits deben:

* representar un cambio coherente;
* ser pequeños cuando sea posible;
* tener mensajes descriptivos;
* evitar mezclar refactors no relacionados con features.

---

# 31. Desarrollo asistido por IA

La IA se considera un **agente de implementación**, no la autoridad arquitectónica del proyecto.

La autoridad se distribuye así:

```text
Usuario
   │
   │ decisiones
   ▼
Arquitectura
   │
   ▼
Specification
   │
   ▼
IA
   │
   ▼
Código
```

La IA debe:

* analizar antes de modificar;
* utilizar patrones existentes;
* respetar `AGENTS.md`;
* respetar esta arquitectura;
* identificar incertidumbres;
* proponer cambios arquitectónicos;
* esperar aprobación cuando corresponda;
* verificar su implementación;
* reportar cambios realizados.

---

# 32. Regla de mínima modificación

Cuando se implemente una feature:

> Modificar únicamente lo necesario para satisfacer la especificación.

No se deben introducir simultáneamente:

* refactors no solicitados;
* cambios de estilo masivos;
* actualizaciones de dependencias;
* reorganizaciones globales;
* cambios arquitectónicos no aprobados.

Si la implementación requiere uno de estos cambios, debe señalarse antes de implementarlo.

---

# 33. Prioridad de las reglas

Cuando existan conflictos, aplicar este orden:

```text
1. Requisitos funcionales aprobados
2. Decisiones arquitectónicas aceptadas
3. ARCHITECTURE.md
4. AGENTS.md
5. Patrones existentes consistentes
6. Convenciones locales
7. Preferencias de implementación de la IA
```

La IA nunca debe asumir que su preferencia técnica tiene prioridad sobre una decisión explícita del proyecto.

---

# 34. Principio de evolución

La arquitectura de Pixkki no pretende ser perfecta desde el inicio.

Debe evolucionar mediante:

```text
Implementar
    ↓
Observar
    ↓
Detectar problemas
    ↓
Evaluar
    ↓
Decidir
    ↓
Documentar
    ↓
Evolucionar
```

Las decisiones deben optimizar:

* claridad;
* mantenibilidad;
* bajo acoplamiento;
* cohesión;
* testabilidad;
* capacidad de evolución.

No se optimizará únicamente para reducir líneas de código o maximizar abstracciones.

---

# 35. Resumen arquitectónico

```text
                    PIXKKI
                       │
              ┌────────▼────────┐
              │    Next.js      │
              │   App Router    │
              └────────┬────────┘
                       │
             ┌─────────▼─────────┐
             │       App         │
             │ Routes / Pages    │
             └─────────┬─────────┘
                       │
                       ▼
             ┌───────────────────┐
             │   Server Actions  │
             └─────────┬─────────┘
                       │
                       ▼
       ┌────────────────────────────────┐
       │            Modules             │
       │                                │
       │ Auth │ Users │ Animals │ ...  │
       │                                │
       │ Components                     │
       │ Actions                        │
       │ Services                       │
       │ Repositories                   │
       │ Validators                     │
       │ DTOs                           │
       │ Factories                      │
       └────────────────┬───────────────┘
                        │
                        ▼
                  ┌───────────┐
                  │ Supabase  │
                  └───────────┘
```

## Principios esenciales

```text
Modularidad
Separación de responsabilidades
Clean Architecture
Single Source of Truth
Zod como fuente de validación
Repository Pattern
Server Components por defecto
Server Actions delgadas
Bajo acoplamiento
Alta cohesión
Cambios incrementales
Especificación antes de implementación
Aprobación humana para cambios arquitectónicos
Verificación antes de commit
```

**Este documento define la estructura arquitectónica de Pixkki.**

Las instrucciones específicas sobre **cómo debe trabajar un agente de IA sobre esta arquitectura** pertenecen a `AGENTS.md`.
