Perfecto. Con tus respuestas, aquí tienes la **lista maestra de features de Pixkki**, organizada por etapa, módulo y prioridad, lista para convertirse en `docs/features/*.md` y ejecutarse con el flujo de vibecoding que definimos.

---

# Lista Maestra de Features — Pixkki

**Etapas:** MVP · Post-MVP · Futuro
**Prioridades:** P0 (imprescindible MVP) · P1 (importante) · P2 (posterior) · P3 (futuro/idea)

**Flujo principal de negocio:**

```text
Superadmin → crear albergue
        ↓
Admin → crear espacios
        ↓
Admin/Vet → registrar animales
        ↓
Admin/Vet → procesar animales para adopción
        ↓
Adoptante/Padrino → consultar animales y ubicaciones de refugios
```

**Actores del MVP:**
- Superadmin
- Admin (administrador del refugio)
- Personal del refugio (Veterinario, Operador, Coordinador, Evaluador)
- Adoptante / Padrino (público, sin cuenta)

---

## Cómo leer esta lista

Cada feature incluye:

| Campo | Descripción |
|---|---|
| ID | Identificador único |
| Nombre | Título corto |
| Descripción | Qué resuelve |
| Actor | Quién la usa |
| Módulo | Dónde vive |
| Prioridad | P0–P3 |
| Dependencias | Features previas |
| Estado | Idea / Parcial / Terminado |

---

# ETAPA 1 — MVP (P0)

## Módulo: Auth

### F-AUTH-01 — Login de usuarios
- **Descripción:** Autenticación con correo y contraseña, JWT de 8h, RBAC.
- **Actor:** Todos los roles internos.
- **Prioridad:** P0
- **Dependencias:** —
- **Estado:** Terminado (según indicaste: “Login”)

### F-AUTH-02 — Recuperación de contraseña
- **Descripción:** Flujo de reset con token temporal (1h) por correo.
- **Actor:** Todos los roles internos.
- **Prioridad:** P0
- **Dependencias:** F-AUTH-01
- **Estado:** Terminado

### F-AUTH-03 — Cambio obligatorio de contraseña en primer login
- **Descripción:** Forzar cambio de contraseña temporal antes de acceder al dashboard.
- **Actor:** Personal del refugio.
- **Prioridad:** P0
- **Dependencias:** F-AUTH-01, F-USERS-01
- **Estado:** Terminado

### F-AUTH-04 — Verificación de cuenta (email verificado)
- **Descripción:** Bloquear login si `email_verificado = false`.
- **Actor:** Admin / Personal.
- **Prioridad:** P0
- **Dependencias:** F-AUTH-01
- **Estado:** Terminado

### F-AUTH-05 — Aceptación de Términos y Condiciones
- **Descripción:** Checkbox obligatorio + registro auditable (versión + timestamp).
- **Actor:** Admin / Personal.
- **Prioridad:** P0
- **Dependencias:** F-AUTH-01
- **Estado:** Terminado

### F-AUTH-06 — Logout
- **Descripción:** Invalidación local del token.
- **Actor:** Todos.
- **Prioridad:** P0
- **Dependencias:** F-AUTH-01
- **Estado:** Terminado

---

## Módulo: Shelters (Refugios)

### F-SHELTER-01 — Listado global de refugios (Superadmin)
- **Descripción:** Tablero con nombre, ciudad/estado, fecha creación y estado operativo.
- **Actor:** Superadmin.
- **Prioridad:** P0
- **Dependencias:** F-AUTH-01
- **Estado:** Terminado

### F-SHELTER-02 — Crear refugio + credenciales automáticas
- **Descripción:** Alta de refugio, UUID, admin con contraseña temporal (bcrypt), email de bienvenida.
- **Actor:** Superadmin.
- **Prioridad:** P0
- **Dependencias:** F-SHELTER-01
- **Estado:** Terminado

### F-SHELTER-03 — Activar / desactivar refugio (multitenant)
- **Descripción:** Switch que bloquea login y oculta catálogo público del refugio inactivo.
- **Actor:** Superadmin.
- **Prioridad:** P0
- **Dependencias:** F-SHELTER-01
- **Estado:** Terminado

### F-SHELTER-04 — Dirección completa del refugio
- **Descripción:** Agregar dirección completa (calle, número, colonia, CP, ciudad, estado) al refugio.
- **Actor:** Superadmin / Admin.
- **Prioridad:** P0
- **Dependencias:** F-SHELTER-02
- **Estado:** Terminado

### F-SHELTER-05 — Filtros y búsqueda de refugios
- **Descripción:** Filtrado avanzado y búsqueda textual sobre el listado global.
- **Actor:** Superadmin.
- **Prioridad:** P0
- **Dependencias:** F-SHELTER-01
- **Estado:** Terminado

---

## Módulo: Users (Personal del refugio)

### F-USERS-01 — Crear personal del refugio
- **Descripción:** Admin crea usuarios con rol (Veterinario, Operador, Coordinador, Evaluador), contraseña temporal y email.
- **Actor:** Admin.
- **Prioridad:** P0
- **Dependencias:** F-AUTH-01, F-SHELTER-02
- **Estado:** Parcial (según indicaste: “crear usuarios”)

### F-USERS-02 — Consultar personal del refugio
- **Descripción:** Listado del personal interno del refugio con filtros.
- **Actor:** Admin.
- **Prioridad:** P0
- **Dependencias:** F-USERS-01
- **Estado:** Idea (según indicaste: “consultar personal”)

### F-USERS-03 — Consultar usuarios (Superadmin)
- **Descripción:** Vista global de usuarios por refugio.
- **Actor:** Superadmin.
- **Prioridad:** P0
- **Dependencias:** F-USERS-01
- **Estado:** Parcial

### F-USERS-04 — Unicidad de correo electrónico
- **Descripción:** Validar que el correo no exista globalmente antes de crear cuenta.
- **Actor:** Admin / Superadmin.
- **Prioridad:** P0
- **Dependencias:** F-USERS-01
- **Estado:** Idea

---

## Módulo: Spaces (Espacios físicos)

### F-SPACES-01 — Crear espacio físico
- **Descripción:** Nombre, tipo (Canil, Gatera, Cuarentena, Rehabilitación, Otro), capacidad máx. opcional, descripción.
- **Actor:** Admin.
- **Prioridad:** P0
- **Dependencias:** F-SHELTER-02
- **Estado:** Idea

### F-SPACES-02 — Listado de espacios con ocupación
- **Descripción:** Tabla con cálculo dinámico de ocupación actual.
- **Actor:** Admin.
- **Prioridad:** P0
- **Dependencias:** F-SPACES-01
- **Estado:** Idea

### F-SPACES-03 — Eliminar espacio (validación de ocupación)
- **Descripción:** Impedir borrado si hay animales asignados.
- **Actor:** Admin.
- **Prioridad:** P0
- **Dependencias:** F-SPACES-01, F-ANIMALS-01
- **Estado:** Idea

### F-SPACES-04 — Onboarding: crear al menos 1 espacio
- **Descripción:** Wizard obligatorio tras primer login del admin.
- **Actor:** Admin.
- **Prioridad:** P0
- **Dependencias:** F-SPACES-01, F-AUTH-03
- **Estado:** Idea

---

## Módulo: Animals (Animales / Pacientes)

### F-ANIMALS-01 — Registrar animal (expediente clínico)
- **Descripción:** Procedencia, edad estimada, rasgos físicos, estado inicial, UUID, `en_cuarentena = true` por defecto.
- **Actor:** Admin / Personal.
- **Prioridad:** P0
- **Dependencias:** F-SHELTER-02
- **Estado:** Terminado parcial (según indicaste: “Registrar animales”)

### F-ANIMALS-02 — Ficha clínica centralizada
- **Descripción:** Vista consolidada con diagnósticos, constantes, vacunas, temperamento y esterilización.
- **Actor:** Admin / Veterinario.
- **Prioridad:** P0
- **Dependencias:** F-ANIMALS-01
- **Estado:** Idea

### F-ANIMALS-03 — Diagnóstico veterinario de ingreso
- **Descripción:** Estado de salud (Crítico, Delicado, Estable, Sano), cuarentena obligatoria, observaciones.
- **Actor:** Veterinario / Admin.
- **Prioridad:** P0
- **Dependencias:** F-ANIMALS-01
- **Estado:** Idea

### F-ANIMALS-04 — Registro de constantes vitales
- **Descripción:** Peso, temperatura, FC, FR + síntomas múltiples.
- **Actor:** Veterinario / Admin.
- **Prioridad:** P0
- **Dependencias:** F-ANIMALS-01
- **Estado:** Idea

### F-ANIMALS-05 — Galería multimedia del paciente
- **Descripción:** 1–5 imágenes (JPG/PNG/WEBP, ≤5MB), thumbnails 300x300, portada.
- **Actor:** Admin / Personal.
- **Prioridad:** P0
- **Dependencias:** F-ANIMALS-01
- **Estado:** Idea

### F-ANIMALS-06 — Bloqueo de cuarentena
- **Descripción:** Impedir asignación a áreas comunes si `en_cuarentena = true`.
- **Actor:** Sistema.
- **Prioridad:** P0
- **Dependencias:** F-ANIMALS-01, F-SPACES-01
- **Estado:** Idea

---

## Módulo: Adoptions (Adopciones)

### F-ADOPT-01 — Marcar animal como disponible para adopción
- **Descripción:** Cambio de estado del animal a “Disponible”.
- **Actor:** Admin / Personal.
- **Prioridad:** P0
- **Dependencias:** F-ANIMALS-01
- **Estado:** Idea (según indicaste: “procesar animales para adopciones”)

### F-ADOPT-02 — Catálogo público de adopciones
- **Descripción:** Vista pública con animales disponibles, sin datos sensibles.
- **Actor:** Adoptante / Padrino.
- **Prioridad:** P0
- **Dependencias:** F-ADOPT-01
- **Estado:** Idea

### F-ADOPT-03 — Consulta pública de refugios y ubicaciones
- **Descripción:** Adoptante consulta animales y ubicación del refugio.
- **Actor:** Adoptante / Padrino.
- **Prioridad:** P0
- **Dependencias:** F-ADOPT-02, F-SHELTER-04
- **Estado:** Idea (según indicaste: “consultar animales y ubicaciones de refugios”)

### F-ADOPT-04 — Postulación pública de adoptante (invitado)
- **Descripción:** Formulario sin cuenta, asociado al animal, email de confirmación.
- **Actor:** Adoptante.
- **Prioridad:** P0
- **Dependencias:** F-ADOPT-02
- **Estado:** Idea

### F-ADOPT-05 — Evaluaciones conductuales
- **Descripción:** Apto con niños/perros/gatos, nivel de energía, reacciones.
- **Actor:** Evaluador / Admin.
- **Prioridad:** P0
- **Dependencias:** F-ANIMALS-01
- **Estado:** Idea

### F-ADOPT-06 — Gatekeeper de esterilización
- **Descripción:** Impedir adopción si `esterilizado = false`.
- **Actor:** Sistema.
- **Prioridad:** P0
- **Dependencias:** F-ADOPT-01
- **Estado:** Idea

---

## Módulo: Multitenant (SaaS)

### F-MT-01 — Aislamiento lógico por `id_refugio`
- **Descripción:** Toda consulta filtra por `id_refugio` del JWT.
- **Actor:** Sistema.
- **Prioridad:** P0
- **Dependencias:** F-AUTH-01
- **Estado:** Idea

---

# ETAPA 2 — POST-MVP (P1 / P2)

## Módulo: Clinical (Control clínico)

### F-CLIN-01 — Tratamientos biológicos y desparasitaciones
- **Prioridad:** P1
- **Dependencias:** F-ANIMALS-01, F-INV-01
- **Estado:** Idea

### F-CLIN-02 — Reubicación interna de pacientes
- **Prioridad:** P1
- **Dependencias:** F-SPACES-01, F-ANIMALS-06
- **Estado:** Idea

### F-CLIN-03 — Bitácora de rehabilitación
- **Prioridad:** P1
- **Dependencias:** F-ANIMALS-01
- **Estado:** Idea

### F-CLIN-04 — Registro quirúrgico de esterilización
- **Prioridad:** P1
- **Dependencias:** F-ANIMALS-01, F-INV-01
- **Estado:** Idea

---

## Módulo: Inventory (Inventario)

### F-INV-01 — Gestión de inventario
- **Prioridad:** P1
- **Dependencias:** F-SHELTER-02
- **Estado:** Idea

### F-INV-02 — Alertas de niveles mínimos
- **Prioridad:** P1
- **Dependencias:** F-INV-01
- **Estado:** Idea

### F-INV-03 — Descuento automático de stock (ACID)
- **Prioridad:** P1
- **Dependencias:** F-INV-01
- **Estado:** Idea

---

## Módulo: Donations (Donaciones) — *excluido del MVP*

### F-DON-01 — Registro de donaciones en especie
- **Descripción:** Tipo, artículo, cantidad, unidad, fecha, auditoría.
- **Prioridad:** P2
- **Dependencias:** F-INV-01
- **Estado:** Idea

### F-DON-02 — Análisis de flujos de donaciones
- **Prioridad:** P2
- **Dependencias:** F-DON-01
- **Estado:** Idea

---

## Módulo: Kanban (Solicitudes de adopción)

### F-KAN-01 — Tablero Kanban de solicitudes
- **Descripción:** Recibida, En Entrevista, Aprobada, Rechazada.
- **Prioridad:** P1
- **Dependencias:** F-ADOPT-04
- **Estado:** Idea

### F-KAN-02 — Notas internas por solicitud
- **Prioridad:** P1
- **Dependencias:** F-KAN-01
- **Estado:** Idea

### F-KAN-03 — Aprobación automática → animal “Adoptado”
- **Prioridad:** P1
- **Dependencias:** F-KAN-01, F-ADOPT-01
- **Estado:** Idea

---

## Módulo: Reports (Reportes)

### F-REP-01 — Reporte de capacidad volumétrica y demografía
- **Prioridad:** P1
- **Dependencias:** F-SPACES-02, F-ANIMALS-01
- **Estado:** Idea

### F-REP-02 — Exportación Excel / CSV
- **Prioridad:** P1
- **Dependencias:** F-REP-01
- **Estado:** Idea

---

# ETAPA 3 — FUTURO (P3)

### F-FUT-01 — Importación masiva CSV de expedientes
- **Prioridad:** P3
- **Estado:** Idea

### F-FUT-02 — Registro manual simplificado de datos históricos
- **Prioridad:** P3
- **Estado:** Idea

### F-FUT-03 — Generación asistida de perfiles con IA
- **Prioridad:** P3
- **Estado:** Idea

---

# Resumen por etapa

| Etapa | Features |
|---|---|
| **MVP (P0)** | 27 |
| **Post-MVP (P1–P2)** | 15 |
| **Futuro (P3)** | 3 |
| **Total** | **45** |

---

# Resumen por módulo (MVP)

| Módulo | Features MVP |
|---|---|
| Auth | 6 |
| Shelters | 5 |
| Users | 4 |
| Spaces | 4 |
| Animals | 6 |
| Adoptions | 6 |
| Multitenant | 1 |

---

# Notas importantes

1. **Donaciones queda fuera del MVP** (según indicaste: “NO”).
2. **Términos y condiciones, recuperación de contraseña y verificación de email** los incluí como P0 porque son requisitos de seguridad del RF0.
3. **“Consultar personal”** y **“dirección completa del refugio”** quedaron como P0, tal como pediste.
4. **El flujo principal de negocio** está cubierto de punta a punta en el MVP.
5. Cada feature está lista para convertirse en `docs/features/<id>-<nombre>.md` con el formato que definimos (ID, Nombre, Descripción, Actor, Problema, Módulo, Prioridad, Dependencias, Estado).
