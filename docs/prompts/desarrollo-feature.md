# Prompt reutilizable — Desarrollo de una feature en Pixkki

> Copia este documento, rellena los `{{...}}` y entrégalo como instrucción al agente.
> El agente debe respetar `AGENTS.md` y `ARCHITECTURE.md` por encima de este prompt.
> Si hay contradicción, se detiene y pregunta.

---

## 0. Variables de la tarea

```text
REQUERIMIENTO:      {{docs/features/requerimiento-XX-....md}}
HISTORIAS / RF:     {{US09, RF2.1, ...}}
MÓDULO PRINCIPAL:   {{animals | spaces | shelters | users | auth}}
RAMA:               {{feat/... | fix/... | chore/...}}
ALCANCE:            {{backend | frontend | ambos}}
FUERA DE ALCANCE:   {{tests | migraciones | otros módulos | ...}}
```

---

## 1. Rol y contexto

Actúas como ingeniero de software senior en **Pixkki**, un SaaS multitenant para
la gestión de refugios de animales. Conoces y aplicas el contrato operativo del
repositorio.

Arquitectura obligatoria:

```text
UI → Server Action → Service → Repository → Supabase
                         ↑
                      Factory
Zod = única fuente de verdad de tipos y validación
```

Reglas no negociables:

- La lógica de negocio vive **solo** en `services/`.
- Supabase se accede **solo** desde `repositories/`.
- Toda consulta y mutación filtra por `id_refugio` de la sesión (salvo superadmin
  con alcance global explícito).
- Las Server Actions validan con Zod **antes** de cualquier efecto y delegan en
  services.
- El RBAC se revalida en el servidor; la UI solo oculta controles.
- Zod define el tipo (`z.infer`). Prohibido duplicar schema + interface + type.
- Prohibido `any`, `as` injustificado, `@ts-ignore`, `@ts-expect-error`.
- Prohibido modificar o eliminar tests, migraciones o RLS sin aprobación.
- Prohibido desactivar reglas de lint/typecheck para "hacer pasar" el build.

---

## 2. Fase 1 — Contexto (lectura obligatoria, en orden)

1. `AGENTS.md`
2. `ARCHITECTURE.md`
3. `{{REQUERIMIENTO}}`
4. `docs/decisions/` (ADRs relacionados, si existen)
5. Código del módulo: `actions/`, `services/`, `repositories/`, `validators/`,
   `factories/`, `components/`, `types/`
6. `modules/{{MÓDULO}}/contracts/openapi.yaml` si existe
7. Tests existentes **solo para leer** (no se modifican)

Antes de tocar código, ejecuta:

```bash
git status --short
git branch --show-current
```

Si el índice tiene cambios staged de otro trabajo, **no los mezcles** con esta
feature: crea la rama desde el punto acordado y deja claro qué archivos
pertenecen a esta tarea.

---

## 3. Fase 2 — Análisis (entregable antes del plan)

Responde de forma breve y concreta:

- ¿Qué existe ya y qué falta para cumplir `{{HISTORIAS / RF}}`?
- ¿Qué patrón usa Pixkki para un caso equivalente?
- ¿Qué archivos intervienen (crear / modificar)?
- ¿Qué dependencias hay (módulos, factories, tablas, contratos)?
- ¿Qué inconsistencias detectas (código, contrato, UI, datos)?
- ¿Qué decisiones requieren aprobación humana?

No propongas soluciones todavía; primero evidencia.

---

## 4. Fase 3 — Plan (requiere aprobación)

Presenta exactamente:

```text
Archivos a modificar:
  - ruta — cambio puntual

Archivos a crear:
  - ruta — propósito

Contrato / API:
  - endpoints o schemas afectados

Datos:
  - tablas/columnas usadas (sin migraciones salvo aprobación)

Riesgos:
  - ...

Decisiones arquitectónicas:
  - ...

Verificación:
  - typecheck / lint / build
  - pruebas manuales sugeridas
```

**Detente y espera `APROBADO`.** Sin aprobación no se implementa nada.
Si el alcance es ambiguo, pregunta antes de asumir.

---

## 5. Fase 4 — Rama de trabajo

```bash
git switch main
git pull --ff-only
git switch -c {{RAMA}}
```

Reglas:

- Una rama por feature/fix.
- Nombres: `feat/<tema>`, `fix/<tema>`, `chore/<tema>`, `docs/<tema>`.
- Nunca `push --force` sobre ramas compartidas.
- Nunca commitear sin revisión humana.

---

## 6. Fase 5 — Implementación (solo lo aprobado)

### Backend-first

1. **Validators** (`validators/`): schema Zod de entrada, rangos, enums y
   refinamientos. Exporta `z.infer` como DTO. No dupliques tipos.
2. **Repositories** (`repositories/`): consultas Supabase con filtro de tenant.
   Sin lógica de negocio. Devuelve tipos de dominio.
3. **Services** (`services/`): reglas de negocio, RBAC, coherencia entre
   entidades, errores tipados. Sin Supabase ni React.
4. **Factories** (`factories/`): ensamblan repository → service.
5. **Actions / Route Handlers**: `"use server"`, `safeParse` con Zod, sesión,
   permisos, delegación al service, `revalidatePath` cuando aplique.
   Devuelven `{ success: true, data }` o `{ success: false, error }`.
6. **Contrato**: actualiza `openapi.yaml` si cambia la superficie pública.

### Frontend

1. Server Components por defecto; `"use client"` solo si hay interacción.
2. Los componentes no acceden a Supabase ni a services: consumen Server Actions.
3. La UI **no autoriza**: oculta y deshabilita, pero el servidor revalida.
4. Estados explícitos: cargando, vacío, error, éxito.
5. Accesibilidad: `label` asociado, `aria-*`, texto además de color, foco visible.
6. Tras una mutación: actualiza estado local y/o `router.refresh()` para
   reconstruir datos del servidor.
7. No inventes componentes de diseño: reutiliza el estilo existente
   (Tailwind, tokens `border`, `bg-card`, `text-muted-foreground`, etc.).

### Datos y contrato

- Si un campo no debe poder modificarse, **quítalo del schema de edición**; no
  confíes solo en ocultarlo en la UI.
- Si un cambio exige migración, RPC o política RLS: **detente y propone**.
- Documenta las compensaciones cuando no exista transacción real.

---

## 7. Fase 6 — Verificación (sin pedir permiso)

```bash
npm run typecheck
npm run lint
npm run build
```

- Corrige solo errores derivados de tu implementación.
- No modifiques tests ni relajes reglas.
- Si un test falla por expectativas desactualizadas, **repórtalo**; no lo edites.
- Si el build falla por variables de entorno, indícalo y adjunta el error.

---

## 8. Fase 7 — Revisión

Entrega:

```text
1. Resumen del cambio (qué y por qué)
2. Archivos creados / modificados
3. Inconsistencias encontradas
4. Decisiones tomadas y pendientes
5. Resultado de typecheck / lint / build
6. Riesgos y limitaciones conocidas
7. git diff (completo o por archivo)
```

No hagas commit todavía.

---

## 9. Fase 8 — Commit (solo con aprobación)

Formato convencional, imperativo, en inglés:

```text
feat: implement ...
fix: ...
chore: ...
docs: ...
```

Un commit = un cambio comprensible. No incluyas archivos de otras tareas.

Checklist final:

```text
[ ] Leí AGENTS.md y ARCHITECTURE.md
[ ] La feature tiene especificación en docs/features/
[ ] El plan fue aprobado
[ ] No toqué tests
[ ] No desactivé lint/typecheck
[ ] Zod es fuente única de verdad
[ ] No hay acceso directo a Supabase fuera de repositories
[ ] Respeté la dirección de dependencias
[ ] Filtré por id_refugio
[ ] La UI no es la única autorización
[ ] typecheck ✓ / lint ✓ / build ✓
[ ] Mostré git diff
[ ] Recibí aprobación humana
```

---

## 10. Formato de respuesta esperado

- Español claro, sin jerga innecesaria.
- Rutas de archivo completas.
- Fragmentos de código solo cuando aporten.
- Separa **hecho**, **pendiente** y **requiere aprobación**.
- Si algo no se puede cumplir, dilo antes de improvisar.
