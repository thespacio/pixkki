# AGENTS.md

> **Contrato operativo de la IA para el proyecto Pixkki.**
> Este documento es de cumplimiento obligatorio para cualquier agente de IA que trabaje sobre el repositorio.
> Si una instrucción del usuario contradice este documento, **el agente debe detenerse y solicitar aclaración** antes de actuar.

---

## 1. Propósito

Definir cómo debe comportarse un agente de IA al trabajar en Pixkki:

- Qué puede hacer sin aprobación.
- Qué debe proponer antes de ejecutar.
- Qué tiene terminantemente prohibido.
- Cómo debe analizar, planificar, implementar, verificar y entregar cambios.

**Los tests quedan fuera del alcance del agente.** Son responsabilidad exclusiva de la persona encargada de testing.

---

## 2. Contexto del proyecto

Pixkki es una plataforma **SaaS multitenant** para la gestión integral de refugios de animales. Cubre autenticación, expedientes clínicos, cuarentena, espacios físicos, adopciones, donaciones, inventario y reportes.

### Arquitectura de referencia

```text
UI
 ↓
Server Action
 ↓
Service
 ↓
Repository
 ↓
Supabase
```

Con:

```text
Factory  →  ensambla dependencias
Zod      →  validación y fuente única de verdad de tipos
```

La lógica de negocio **nunca** vive en:

- componentes
- Server Actions
- repositories

---

## 3. Estructura del repositorio

```text
/
├── AGENTS.md
├── ARCHITECTURE.md
├── CONTRIBUTING.md
│
├── docs/
│   ├── features/
│   └── decisions/
│       └── ADR-XXXX-*.md
│
├── app/
├── modules/
├── components/
└── lib/
```

### Estructura canónica de un módulo

```text
modules/
└── spaces/
    ├── actions/
    ├── components/
    ├── dtos/
    ├── factories/
    ├── repositories/
    ├── services/
    ├── validators/
    └── types/
```

> La tabla de homogenización de módulos (`auth`, `animals`, `shelters`, `spaces`, `users`) vive en `ARCHITECTURE.md`, no aquí.

---

## 4. Flujo obligatorio de trabajo

El agente **nunca** recibe “Haz X” y ejecuta directamente. Debe seguir este flujo:

### Fase 1 — Contexto

Leer, en este orden:

1. `AGENTS.md`
2. `ARCHITECTURE.md`
3. `docs/features/<feature>.md`
4. Archivos relacionados del módulo

### Fase 2 — Análisis

Responder:

- ¿Qué existe ya?
- ¿Qué patrón usa Pixkki?
- ¿Qué archivos intervienen?
- ¿Qué dependencias hay?
- ¿Qué inconsistencias se detectan?

### Fase 3 — Plan

Presentar **antes de tocar nada**:

```text
- Archivos a modificar
- Archivos a crear
- Cambios propuestos
- Dependencias
- Riesgos
- Decisiones arquitectónicas
```

### Fase 4 — Aprobación

El humano responde `APROBADO` (o pide ajustes). Sin esto, **no se implementa**.

### Fase 5 — Implementación

Solo lo aprobado. Nada más.

### Fase 6 — Verificación

Ejecutar sin pedir permiso:

```text
typecheck
lint
build
```

### Fase 7 — Revisión

Mostrar `git diff` para revisión humana.

### Fase 8 — Commit

Solo tras aprobación humana. Formato:

```text
feat: implement ...
fix: ...
chore: ...
docs: ...
```

---

## 5. Niveles de decisión del agente

### 5.1 Puede hacer automáticamente

```text
✓ Implementar una feature aprobada
✓ Crear/modificar archivos necesarios dentro del módulo objetivo
✓ Seguir patrones existentes
✓ Ejecutar typecheck
✓ Ejecutar lint
✓ Ejecutar build
✓ Corregir errores derivados de su propia implementación
   (siempre que NO cambien contratos ni arquitectura)
```

### 5.2 Debe proponer antes de ejecutar

```text
⚠ Cambios arquitectónicos
⚠ Cambios de estructura
⚠ Cambios de contratos
⚠ Cambios en módulos existentes fuera del módulo objetivo
⚠ Cambios en dependencias
⚠ Cambios en base de datos (migraciones, esquemas, RLS)
⚠ Cambios que afecten múltiples módulos
⚠ Nuevos patrones arquitectónicos
```

### 5.3 No puede hacer nunca

```text
✗ Modificar tests
✗ Eliminar tests
✗ Desactivar reglas de lint/typecheck para hacer pasar el build
✗ Cambiar arquitectura sin aprobación
✗ Inventar patrones
✗ Duplicar schemas Zod
✗ Crear tipos redundantes
✗ Acceder directamente a Supabase fuera de repositories
✗ Hacer refactors masivos no solicitados
```

---

## 6. Reglas de TypeScript

- `strict: true` siempre.
- Prohibido `any`. Usar `unknown` + narrowing.
- Prohibido `as` salvo justificación explícita.
- Prohibido `@ts-ignore` / `@ts-expect-error` sin aprobación.
- Preferir `type` sobre `interface` salvo extensión explícita.
- Tipos derivados de Zod con `z.infer<typeof Schema>`.

---

## 7. Reglas de React / Next.js

- Server Components por defecto.
- `"use client"` solo cuando sea imprescindible.
- No mezclar lógica de negocio con presentación.
- No hacer fetching directo en componentes: usar Server Actions.
- Estado local mínimo; preferir estado del servidor.
- Componentes puros y testeables.

---

## 8. Server Actions

- Validar entrada con Zod **antes** de cualquier efecto.
- No contener lógica de negocio: delegar a services.
- No acceder a Supabase directamente.
- Devolver resultados tipados (no lanzar errores crudos al cliente).
- Manejar errores con un formato uniforme.

---

## 9. Supabase

- Acceso **exclusivamente** desde `repositories/`.
- Nunca desde componentes, actions o services.
- Siempre filtrar por `id_refugio` desde el JWT (multitenant).
- RLS como segunda capa de defensa, no como única.
- Migraciones y cambios de esquema requieren aprobación previa.

---

## 10. Zod

> **Zod es la única fuente de verdad para estructuras de datos que requieran validación.**

Flujo obligatorio:

```text
Schema Zod
    ↓
z.infer<typeof Schema>
    ↓
DTO / tipos derivados
```

Prohibido:

```text
Zod Schema
  + Interface duplicada
  + Type duplicado
```

Si se necesita un tipo auxiliar no validable (ej. `Result<T>`), debe documentarse y no duplicar el schema.

---

## 11. DTOs, Services, Repositories, Factories

- **DTOs**: derivados de Zod, sin lógica.
- **Services**: lógica de negocio pura, sin Supabase, sin React.
- **Repositories**: único punto de acceso a datos. Sin lógica de negocio.
- **Factories**: ensamblan dependencias (repos + services).

Regla de dependencias:

```text
actions → services → repositories → Supabase
                ↑
             factories
```

Prohibido saltarse capas.

---

## 12. Naming e imports

- Archivos: `kebab-case.ts` / `kebab-case.tsx`.
- Componentes: `PascalCase`.
- Hooks: `useCamelCase`.
- Schemas: `camelCaseSchema`.
- Tipos: `PascalCase`.
- Imports absolutos con alias (`@/modules/...`).
- Prohibidos imports relativos profundos (`../../../`).

---

## 13. Manejo de errores

- Errores tipados y explícitos.
- No silenciar errores con `try/catch` vacíos.
- Mensajes de error en español, claros para el usuario final.
- Logs internos sin datos sensibles.
- Nunca exponer stack traces al cliente.

---

## 14. Git

Flujo:

```text
main
 │
 └── feature/xxx
       ├── specification
       ├── plan
       ├── implementation
       ├── verification
       ├── review
       └── commit
               │
               ▼
             merge
```

Reglas:

- Un commit = un cambio comprensible.
- Prohibido `git push --force` sobre ramas compartidas.
- Prohibido commitear sin revisión humana.
- Mensajes en imperativo, en inglés, formato convencional.

---

## 15. Cuándo el agente DEBE detenerse y pedir aprobación

```text
⚠ La feature no tiene especificación en docs/features/
⚠ El plan no fue aprobado
⚠ Se requiere tocar tests
⚠ Se requiere modificar base de datos
⚠ Se requiere cambiar arquitectura o contratos
⚠ Se requiere modificar módulos fuera del objetivo
⚠ Se detecta duplicación de schemas Zod
⚠ Se detecta acceso directo a Supabase fuera de repositories
⚠ El cambio afecta múltiples módulos
⚠ Hay ambigüedad en los requisitos
⚠ La instrucción del usuario contradice AGENTS.md
```

En cualquiera de estos casos: **detenerse, explicar y proponer**, sin ejecutar.

---

## 16. Ejemplos: correcto vs. incorrecto

### 16.1 Acceso a datos

**Correcto**

```ts
// modules/spaces/repositories/spaces.repository.ts
export const spacesRepository = {
  async findById(id: string, refugioId: string) {
    return supabase
      .from("spaces")
      .select("*")
      .eq("id", id)
      .eq("id_refugio", refugioId)
      .single();
  },
};
```

**Incorrecto**

```ts
// modules/spaces/components/SpacesList.tsx
"use client";
import { supabase } from "@/lib/supabase"; // ✗ acceso directo

export function SpacesList() {
  const { data } = supabase.from("spaces").select("*"); // ✗
  // ...
}
```

---

### 16.2 Zod como fuente única

**Correcto**

```ts
// modules/spaces/validators/space.schema.ts
export const spaceSchema = z.object({
  nombre: z.string().min(1),
  tipo: z.enum(["canil", "gatera", "cuarentena", "rehabilitacion", "otro"]),
  capacidadMaxima: z.number().int().positive().optional(),
  descripcion: z.string().optional(),
});

export type SpaceDTO = z.infer<typeof spaceSchema>;
```

**Incorrecto**

```ts
export const spaceSchema = z.object({ /* ... */ });

export interface SpaceDTO { // ✗ duplicación
  nombre: string;
  tipo: string;
  capacidadMaxima?: number;
  descripcion?: string;
}
```

---

### 16.3 Server Action

**Correcto**

```ts
"use server";
export async function createSpaceAction(input: unknown) {
  const parsed = spaceSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Datos inválidos" };
  }
  return spacesService.create(parsed.data, session.refugioId);
}
```

**Incorrecto**

```ts
"use server";
export async function createSpaceAction(input: any) {
  // ✗ any
  // ✗ lógica de negocio en la action
  // ✗ acceso directo a Supabase
  const { data } = await supabase.from("spaces").insert(input);
  if (!data) throw new Error("fail"); // ✗ error crudo
  return data;
}
```

---

### 16.4 Capas

**Correcto**

```text
action → service → repository → supabase
```

**Incorrecto**

```text
action → supabase                ✗
component → service → supabase   ✗
service → supabase               ✗
repository → service             ✗ (dirección invertida)
```

---

### 16.5 Multitenant

**Correcto**

```ts
.eq("id_refugio", session.refugioId)
```

**Incorrecto**

```ts
.from("animals").select("*") // ✗ sin filtro de tenant
```

---

## 17. Checklist antes de cada commit

```text
[ ] Leí AGENTS.md y ARCHITECTURE.md
[ ] La feature tiene especificación en docs/features/
[ ] El plan fue aprobado por el humano
[ ] No toqué tests
[ ] No desactivé reglas de lint/typecheck
[ ] Zod es fuente única de verdad
[ ] No hay acceso directo a Supabase fuera de repositories
[ ] Respeté la dirección de dependencias
[ ] Filtré por id_refugio en todas las consultas
[ ] typecheck ✓
[ ] lint ✓
[ ] build ✓
[ ] Mostré git diff
[ ] Recibí aprobación humana
[ ] Commit con mensaje convencional
```

---

## 18. Referencias

- `ARCHITECTURE.md` — arquitectura, módulos, homogenización.
- `CONTRIBUTING.md` — flujo de contribución y Git.
- `docs/features/` — especificaciones por feature.
- `docs/decisions/` — ADRs.

---

**Fin del contrato operativo.**
Cualquier ambigüedad se resuelve deteniéndose y preguntando, nunca asumiendo.