# Metodología UI/UX de Pixkki (para agentes de código)

> Documento rector para traducir los requerimientos de `docs/features/` a vistas implementables.
> Reemplaza al manual metodológico genérico heredado de otro proyecto (`Copia de De Requerimientos a Vistas UI_UX.md`, eliminado): conserva el método, pero sustituye los ejemplos de barbería/pagos por el dominio real de Pixkki (refugios, animales, cuarentena, adopciones).

---

## 0. Propósito y alcance

Este documento responde una pregunta concreta: **dado un requerimiento ya especificado en `docs/features/requerimiento-XX-*.md`, ¿qué debe renderizar la interfaz y cómo se comporta?**

No redefine reglas de negocio, contratos ni esquemas. Esos ya viven en:

- `docs/features/requerimiento-XX-*.md` — reglas de negocio y contratos `/api/v1/`.
- `modules/*/contracts/openapi.yaml` — contrato HTTP.
- `modules/*/validators/` — **única fuente de verdad** de estructuras validables (Zod).
- `modules/*/errors.ts` — errores de dominio tipados.

Regla de oro: **la UI presenta decisiones; el service decide; el repository persiste.** Si este documento parece describir una regla de negocio nueva, detenerse: pertenece al requerimiento de origen, no aquí.

---

## 1. Principios rectores

### P1 — Modelo mental ≠ modelo del sistema

El usuario razona en términos del dominio: *"este perro está en cuarentena"*, *"el Canil A tiene 3 lugares libres"*, *"la solicitud de Ana está recibida"*. El sistema piensa en `en_cuarentena`, `capacidad - ocupacion`, `estado_solicitud = 'Recibida'`.

La vista debe mostrar **el razonamiento del operador**, nunca el esquema:

| Modelo del sistema (no mostrar tal cual) | Modelo mental (mostrar en la UI) |
| :--- | :--- |
| `id_animal = 128` | Ficha de "Mango", con su foto de portada |
| `en_cuarentena = true` | Badge **"En cuarentena"** + banner de prioridad |
| `id_espacio = 10` | Selector con nombre "Canil A — 3/20 lugares" |
| `estado_solicitud = 'Recibida'` | Chip **"Recibida"** con fecha y folio |

La traducción de identificadores a etiquetas es responsabilidad del service/repository, no del componente.

### P2 — Los 6 eslabones de la traducción

Todo requerimiento atraviesa estas capas en orden; saltarse una produce retrabajo:

1. **Extracción semántica** — sustantivos, verbos, condicionales (ver P3).
2. **User flow** — dimensión temporal: qué decide el usuario y qué responde el sistema, incluidos los fallos.
3. **Mapa de navegación** — dimensión espacial: dónde vive cada vista (shell, sección, detalle, overlay).
4. **Inventario de contenido** — contrato funcional previo a dibujar (ver P5).
5. **Wireframes Lo-Fi** — jerarquía y ergonomía en grises (documentación externa; **no se incluye en los anexos**).
6. **5 estados de interfaz** — toda vista soporta ideal / vacío / carga / parcial / error (ver P7).

### P3 — Matriz de análisis semántico

| Dimensión | Pregunta guía | Manifestación en la interfaz |
| :--- | :--- | :--- |
| **Entidades** | ¿Qué sustantivos del dominio persisten o se consultan? | Tarjetas de animal, filas de refugio, chips de estado, ficha clínica. |
| **Acciones** | ¿Qué verbos ejecuta el actor? | Un CTA principal por vista; acciones secundarias como botones de contorno o menú `...`. |
| **Reglas & límites** | ¿Qué condiciona el flujo? | Textos de ayuda, campos deshabilitados, validación inline, mensajes en español. |
| **Estados críticos** | ¿Qué pasa si falla o expira? | Banner de reintento, conservación de datos, mensaje del `error.code`. |

Aplicación en Pixkki:

| Dimensión | Ejemplos del dominio |
| :--- | :--- |
| Entidades | `animal`, `refugio`, `espacio`, `diagnostico`, `solicitud_adopcion`, `fotografia` |
| Acciones | Dar de alta, cargar fotos, registrar diagnóstico, publicar perfil, aprobar solicitud, activar/desactivar refugio |
| Reglas | 1–5 fotos por expediente, descripción 50–2000 caracteres, solo `veterinarian`/`admin` diagnostican, correo de admin único global |
| Estados críticos | `409 ANIMAL_YA_RESERVADO`, `409 PERFIL_SIN_FOTOGRAFIA`, `429 DEMASIADAS_SOLICITUDES`, fallo de Cloudinary, timeout de sesión |

### P4 — Las 4 leyes de la transformación

1. **Separación de forma y contenido** — primero qué información existe y qué decide el usuario; la estética después. Resolver el contrato de datos antes de pensar en colores.
2. **Reducción de carga cognitiva** — divulgación progresiva. Un formulario largo se divide en pasos lógicos (Datos generales → Ubicación → Espacio); las opciones avanzadas aparecen solo cuando la decisión previa lo justifica.
3. **Mapeo natural del usuario** — la vista sigue la cronología de razonamiento del operador, jamás el diagrama entidad-relación. **Nunca pedir al usuario que memorize un `id_`.**
4. **Fitts y proximidad** — acciones críticas con área generosa; datos relacionados agrupados en la misma tarjeta; filtros pegados a la cabecera de la tabla que afectan.

### P5 — Inventario E-C-S

Todo elemento candidato a una vista se clasifica en una de tres categorías:

| Nivel | Nombre | Criterio |
| :--- | :--- | :--- |
| **[E]** | Esencial | Sin él no se completa la tarea principal. Obtiene el mayor peso visual. |
| **[C]** | Contextual | Da certidumbre y valida datos previos (resumen, badge, desglose). Tipografía tenue o chip. |
| **[S]** | Secundario | Baja frecuencia o soporte (términos, ayuda, cambiar método). Enlace, ícono o menú. |

> **Regla de exclusión:** si un elemento no está justificado por el requerimiento o por una regla de negocio, no entra al inventario y por tanto no se implementa.

Anatomía estándar de una vista:

1. **Top Bar / Navigation Shell** — ubicación, retroceso, stepper.
2. **Context Summary** — ancla mental: qué estoy haciendo y con qué parámetros.
3. **Primary Body** — captura, decisión o consumo de datos.
4. **Bottom / Sticky Action Bar** — totales y CTA principal; en móvil, zona del pulgar.

### P6 — Navegación: rutas vs. capas

| Nivel | Contenido en Pixkki |
| :--- | :--- |
| 0 — Shell | Layout autenticado con sidebar (desktop) / bottom bar (móvil). |
| 1 — Anclas | Panel, Animales, Espacios, Adopciones, Donaciones, Reportes. |
| 2 — Colección | Listados filtrados: `/animales`, `/adopciones/solicitudes`, `/refugios`. |
| 3 — Detalle / transacción | Ficha de animal, detalle de solicitud, `/onboarding`, `/change-password`. |
| Overlay | Confirmaciones, despublicar, eliminar espacio, filtros complejos, previsualización de foto. |

Reglas:

- Máximo 3 niveles en móvil, 4 en escritorio.
- Las acciones transaccionales rápidas se resuelven en **overlay**, sin cambiar la ruta base (en móvil: *bottom sheet*; en desktop: modal/drawer).
- El shell global siempre permite volver a un ancla con un toque.

### P7 — Los 5 estados de interfaz

| Estado | Definición | Requerimiento de diseño |
| :--- | :--- | :--- |
| **Ideal** | Datos completos y válidos. | CTA habilitado; flujo continúa con una acción. |
| **Vacío** | Sin registros o filtros sin coincidencias. | Explica **por qué** está vacío y ofrece un CTA de rescate ("Crear el primer espacio", "Ver primer día disponible"). |
| **Carga** | Espera de red o procesamiento. | Skeleton con la **misma forma** del contenido final para evitar *layout shift*; bloquear clics repetidos. |
| **Parcial** | Pocos registros o datos incompletos. | Composición estable y equilibrada; aviso suave ("Queda 1 lugar", "Última fotografía pendiente"). |
| **Error** | Fallo técnico, validación o rechazo transaccional. | Banner no destructivo con motivo en español, **preserva lo ya ingresado**, enfoca el campo/acción que falló y ofrece reintento. |

### P8 — Regla de los casos de falla

Diseñar solo el *happy path* deja sin especificar la mitad de la interfaz. Todo código de error listado en un requerimiento (`400`, `403`, `404`, `409`, `429`, `500`) **debe tener una manifestación UI** en la matriz de estados del anexo. Si el requerimiento no lista el error pero la operación es transaccional, se propone y se pregunta antes de implementar.

### P9 — Bifurcación obligatoria y cierre de ciclos

- Todo punto de decisión tiene **al menos dos salidas** (éxito / error). Si solo tiene una, es un paso secuencial, no una decisión.
- Cuando una validación falla, el flujo **vuelve al punto exacto donde el usuario puede corregirla**. Nunca reinicia el formulario ni deja un nodo suelto.
- Los procesos asíncronos visibles (>1 s) muestran estado explícito: "Subiendo foto 2 de 5…", "Procesando…".

### P10 — Errores y mensajes

- El mensaje visible sale de `error.message` del envelope uniforme, en español y sin stack traces.
- El `error.code` se usa para decidir la recuperación (ej. `ANIMAL_YA_RESERVADO` → recargar disponibilidad y ofrecer otra solicitud; `LIMITE_IMAGENES_EXCEDIDO` → resaltar el contador de fotos).
- La UI **oculta** acciones no permitidas, pero la autorización real se verifica siempre en el service (RBAC), nunca solo en el componente.

---

## 2. Cobertura móvil

Aunque el núcleo de Pixkki es un dashboard de escritorio, **toda vista debe ser utilizable en móvil** (personal en campo, formulario público de adopciones).

| Zona del lienzo | Uso permitido | Ejemplo en Pixkki |
| :--- | :--- | :--- |
| Superior (difícil alcance) | Solo contexto | Título "Ficha de Mango", stepper "Paso 2 de 3", badge "En cuarentena". |
| Media (acceso natural) | Exploración, lectura, captura | Lista de animales, campos del alta, galería de fotos. |
| Inferior (pulgar) | Acción principal | CTA sticky "Guardar expediente", "Publicar perfil", "Enviar solicitud". |

Reglas:

- CTA primario anclado abajo, con **mínimo 44–48 px de alto** y ancho útil; nunca al final de un scroll infinito.
- Campos numéricos usan `inputMode="numeric"` / `type="tel"`; fechas inválidas se bloquean antes del clic.
- Modales de confirmación se presentan como **bottom sheets**; el botón destructivo va separado y con estilo de peligro.
- Las tablas anchas de escritorio se convierten en tarjetas apiladas en móvil, conservando el mismo inventario E-C-S.

---

## 3. Cómo aplicar esto en el código de Pixkki

| Concepto UI/UX | Dónde vive en el código | Regla de AGENTS.md |
| :--- | :--- | :--- |
| Entidades del inventario | Componentes de presentación (`modules/<m>/components/`) | Sin lógica de negocio; datos tipados desde `z.infer`. |
| Contrato de datos del inventario | `modules/<m>/contracts/openapi.yaml` + `modules/<m>/validators/` | Zod es fuente única; **no duplicar schemas ni tipos**. |
| CTA principal y acciones | Server Action delgada → Service | Action valida con Zod y delega; sin acceso a Supabase. |
| Reglas y límites | Service + helper texts del componente | El botón deshabilitado es prevención; el service es la autoridad. |
| Errores | `modules/<m>/errors.ts` + envelope uniforme | Mensajes en español; nunca exponer stack traces. |
| Estado de carga | `app/**/loading.tsx` + skeletons | Misma forma que el contenido final. |
| Estado de error | `app/**/error.tsx` + `reset()` | Reintento sin pérdida de datos. |
| Vacío / parcial | Componentes con props derivadas del service | CTA de rescate siempre presente. |
| Shell y navegación | `app/**/layout.tsx` | Server Components por defecto; `"use client"` solo si hay interacción real. |
| Overlays | `Parallel Routes` / `Intercepting Routes` o modal local | No alteran la ruta base. |

---

## 4. Plantilla de anexo por requerimiento

Cada anexo se guarda en `docs/features/ui-ux/requerimiento-XX-<slug>-ui-ux.md` y contiene **solo** estas tres secciones (más un encabezado de trazabilidad y, si aplica, preguntas abiertas):

````markdown
# Anexo UI/UX — Requerimiento XX

>Fuente: `docs/features/requerimiento-XX-*.md`. Actores: … . Vistas cubiertas: … .

## 1. Inventario de contenido (E-C-S)
### Vista `<ruta>` — <actor>
| Zona | Nivel | Elemento | Origen de datos / contrato | Comportamiento UI | Capa |
…

## 2. Flujos de usuario
### Flujo <nombre> (<RF>)
```mermaid
flowchart TD …
```
Notas de móvil: …

## 3. Los 5 estados de interfaz
| Vista | Ideal | Vacío | Carga | Parcial | Error | Recuperación |
…

## 4. Supuestos y preguntas abiertas
- …
````

**Reglas de la plantilla:**

- La columna *Origen de datos / contrato* referencia el endpoint o el schema existente; **no copia su definición**.
- La columna *Capa* usa `SC` (Server Component), `CC` (Client Component), `Action`, `Service`.
- Los flujos se dibujan en Mermaid con decisiones `{"¿…?"}` y salidas `Sí`/`No`; cada fallo vuelve al punto de corrección.
- La matriz de estados incluye **una fila por vista** y **una columna por estado**, con disparador y recuperación concretos.

---

**Fin del documento.** Los anexos derivados de este método viven en `docs/features/ui-ux/`.
