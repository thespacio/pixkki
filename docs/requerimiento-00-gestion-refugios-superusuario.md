# Requerimiento 00 — Épica 0: Gestión Global de Refugios y Configuración Inicial

## Título

Gestión global de refugios, autenticación RBAC, onboarding y configuración inicial de la plataforma Pixkki.

## Descripción

Pixkki es una plataforma SaaS multitenant para la gestión integral de refugios de animales. La Épica 0 cubre los cimientos del sistema: autenticación segura, control de acceso basado en roles (RBAC), gestión global de refugios por superusuario, alta de refugios con provisión automática de credenciales, modulación de estados operativos, gestión de personal interno, recuperación de contraseñas, aceptación de términos y condiciones, modelado de infraestructura física, y verificación de cuenta con asistente de onboarding.

Cada refugio es un tenant independiente identificado por `id_refugio`. El superadmin opera a nivel global sin estar asociado a ningún `id_refugio`. Cada refugio tiene su propio administrador que gestiona personal, espacios y operaciones diarias.

## Objetivo

Proveer los módulos fundamentales de autenticación, multitenancy y configuración inicial que permitan:

1. Dar de alta refugios y administrar su estado operativo desde un panel global.
2. Autenticar usuarios con control de acceso basado en roles.
3. Onboardear nuevos refugios y administradores de forma automatizada.
4. Establecer las reglas de negocio base que todos los módulos posteriores heredarán.

## Alcance

Incluye:

- RF0.1: Gestión global de refugios por superusuario (US31, US33)
- RF0.2: Alta de refugios y provisión automática de credenciales (US32)
- RF0.3: Modulación de estados operativos de refugios (US33)
- RF0.4: Gestión de personal interno del refugio (US02, US27)
- RF0.5: Autenticación segura y control de acceso basado en roles (RBAC) (US03)
- RF0.6: Recuperación autónoma de contraseñas (US04) — Should Have
- RF0.7: Gestión y aceptación de términos y condiciones (US27)
- RF0.8: Modelado de infraestructura física del refugio (US29)
- RF0.9: Verificación de cuenta y asistente de onboarding (US30, US01, US29)

No incluye:

- Gestión clínica de animales (Épica 1 y 2)
- Procesos de adopción (Épica 5)
- Donaciones e inventario (Épica 6)
- Reportes de inteligencia de datos (Épica 7)
- Migración de datos históricos (Épica 8)

## Actores

| Actor | Descripción |
|-------|-------------|
| Superadmin | Rol global con `es_superadmin = true` o tabla independiente de superusuarios. No asociado a ningún `id_refugio`. |
| Administrador de refugio | Usuario con rol `admin` asociado a un `id_refugio` específico. Gestiona su refugio. |
| Personal del refugio | Veterinario, operador, coordinador, evaluador. Acceso limitado a su refugio. |
| Usuario no autenticado | Puede acceder a rutas públicas y flujo de recuperación de contraseña. |

## Reglas de negocio

1. **Superadmin global**: Debe tener `es_superadmin = true` o pertenecer a tabla independiente de superusuarios. No está asociado a ningún `id_refugio`.
2. **Listado global de refugios**: Muestra Nombre, Ciudad/Estado, Fecha de creación, Estado operativo (Activo/Inactivo). Con filtrado y búsqueda textual.
3. **Alta de refugio**: Campos obligatorios: Nombre del Refugio, Ciudad/Estado, Correo del Administrador. Teléfono opcional. Correo debe ser único globalmente.
4. **Provisión automática**: Al crear refugio, se genera UUID (`id_refugio`), cuenta de admin con rol `admin`, contraseña temporal hasheada con bcrypt, estado inicial `activo`, y se envía correo de bienvenida con credenciales temporales.
5. **Estado operativo**: Al establecer un refugio como `inactivo`, se rechazan inmediatamente todos los intentos de autenticación de sus usuarios.
6. **Personal interno**: Solo el administrador del refugio puede gestionar personal. Correo único global. Contraseña temporal generada y hasheada con bcrypt.
7. **Autenticación RBAC**: Login con correo + contraseña. Validar rol y permisos. Cada request revalida empleado activo + rol permitido.
8. **Recuperación de contraseña**: Token temporal de 1 hora enviado por correo. Invalidar tras uso. Registrar timestamp de modificación.
9. **Términos y condiciones**: Ruta pública `/terminos` con versión vigente. Checkbox obligatorio en registro. Almacenar `terminos_aceptado_en` y `terminos_version`. Rechazar con HTTP 400 si no se acepta.
10. **Espacios físicos**: Solo rol Administrador. Campos: Nombre (obligatorio), Tipo (Canil/Gatera/Cuarentena/Rehabilitación/Otro), Capacidad Máxima (opcional, entero), Descripción. No se puede eliminar un espacio con animales asignados.
11. **Verificación de cuenta**: Token de activación con vigencia 24 horas tras alta de refugio. Bloquear login si `email_verificado = false`. `primer_inicio_sesion = true` redirige a `/onboarding`. Forzar creación de al menos 1 espacio físico antes de salir del wizard.

## Historias de usuario

| ID | Historia de Usuario | Prioridad | Épica | RF relacionados |
|----|---------------------|-----------|-------|-----------------|
| US01 | Registro de nuevo refugio (Onboarding) | Must Have | Épica 0 | RF0.9 |
| US02 | Registro de usuarios y gestión de roles | Must Have | Épica 0 | RF0.4 |
| US03 | Inicio de sesión y control de acceso por rol (RBAC) | Must Have | Épica 0 | RF0.5 |
| US04 | Recuperación de contraseña | Should Have | Épica 0 | RF0.6 |
| US27 | Gestión y aceptación de términos y condiciones | Must Have | Épica 0 | RF0.4, RF0.7 |
| US29 | Modelado de infraestructura física del refugio | Must Have | Épica 0 | RF0.8 |
| US30 | Verificación de cuenta y asistente de onboarding | Must Have | Épica 0 | RF0.9 |
| US31 | Gestión global de refugios por superusuario | Must Have | Épica 0 | RF0.1 |
| US32 | Alta de refugios y provisión automática de credenciales | Must Have | Épica 0 | RF0.2 |
| US33 | Modulación de estados operativos de refugios | Must Have | Épica 0 | RF0.1, RF0.3 |

## Contrato de API

Los endpoints siguen el patrón `/api/v1/<recurso>`. La validación de entrada se hace con Zod antes de cualquier efecto. Los errores se devuelven con formato uniforme.

### Formato de respuesta de éxito

```json
{
  "success": true,
  "data": { ... }
}
```

### Formato de error uniforme

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODIGO",
    "message": "Mensaje en español para el usuario final",
    "statusCode": 400
  }
}
```

### RF0.1 / RF0.2 / RF0.3 — Gestión global de refugios (Superadmin)

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| GET | `/api/v1/refugios` | Listar refugios con filtros y búsqueda | Superadmin |
| GET | `/api/v1/refugios/{id}` | Detalle de un refugio | Superadmin |
| POST | `/api/v1/refugios` | Crear nuevo refugio | Superadmin |
| PATCH | `/api/v1/refugios/{id}` | Editar refugio | Superadmin |
| PATCH | `/api/v1/refugios/{id}/estado` | Cambiar estado operativo | Superadmin |

**Request (POST/PATCH):**

```json
{
  "nombre": "string (obligatorio)",
  "ciudad_estado": "string (obligatorio)",
  "correo_admin": "string email (obligatorio, único)",
  "telefono": "string (opcional)",
  "estado": "activo | inactivo"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id_refugio": "uuid",
    "nombre": "string",
    "ciudad_estado": "string",
    "correo_admin": "string",
    "telefono": "string | null",
    "estado": "activo",
    "fecha_creacion": "datetime"
  }
}
```

**Errores:**
- `400` — Datos inválidos o correo ya registrado
- `403` — Usuario no es superadmin
- `404` — Refugio no encontrado
- `500` — Error interno

### RF0.5 — Autenticación y RBAC

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| POST | `/api/v1/auth/login` | Autenticar usuario, emitir sesión | Público |
| POST | `/api/v1/auth/logout` | Cerrar sesión | Autenticado |
| GET | `/api/v1/auth/me` | Usuario autenticado actual | Autenticado |
| POST | `/api/v1/auth/recover-password` | Solicitar recuperación de contraseña | Público |
| POST | `/api/v1/auth/reset-password` | Restablecer contraseña con token | Público |

**Request (login):**

```json
{
  "email": "string (obligatorio)",
  "password": "string (obligatorio)"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "string",
    "role": "admin | veterinarian | operator | coordinator | evaluator | superadmin",
    "permissions": ["string"],
    "shelterId": "number | null",
    "emailVerified": true,
    "requiresOnboarding": false
  }
}
```

**Errores:**
- `401` — Credenciales inválidas
- `403` — Correo no verificado, refugio inactivo, rol sin permiso, onboarding requerido
- `429` — Rate limit excedido

### RF0.8 — Espacios físicos (infraestructura)

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| GET | `/api/v1/espacios` | Listar espacios de un refugio | Admin del refugio |
| POST | `/api/v1/espacios` | Crear espacio físico | Admin del refugio |
| PATCH | `/api/v1/espacios/{id}` | Editar espacio | Admin del refugio |
| DELETE | `/api/v1/espacios/{id}` | Eliminar espacio (si no tiene animales) | Admin del refugio |

**Errores:**
- `400` — Espacio tiene animales asignados (no se puede eliminar)
- `403` — Solo administrador del refugio
- `404` — Espacio no encontrado

## Plan de implementación backend-first

| Paso | Acción | Artefacto |
|------|--------|-----------|
| 1 | Definir OpenAPI para módulos auth y shelters | `modules/auth/contracts/openapi.yaml`, `modules/shelters/contracts/openapi.yaml` |
| 2 | Implementar Zod schemas de entrada | `modules/auth/validators/`, `modules/shelters/validators/` |
| 3 | Implementar repositories con filtro `id_refugio` | `modules/*/repositories/` |
| 4 | Implementar services (lógica pura, sin Supabase) | `modules/*/services/` |
| 5 | Implementar Route Handlers versionados `/api/v1/` | `app/api/v1/...` |
| 6 | Pruebas aisladas del backend | Equipo de QA (externo a este documento) |
| 7 | Congelar contrato v1 | Tag git `api-v1.0` |
| 8 | Frontend consume contrato vía Server Actions | Server Actions como adaptador |

## Riesgos y dependencias

| Riesgo | Mitigación |
|--------|------------|
| Superadmin sin `id_refugio` rompe filtro multitenant estándar | Repository especial para superadmin sin filtro `id_refugio` |
| Contrato OpenAPI y código divergen | Validar en CI; tipos derivados de Zod |
| Correo de bienvenida no enviado tras crear refugio | Transacción: si falla el email, revertir creación |
| Rate limit de login no implementado | Middleware de rate limiting por IP + correo |

**Dependencias:** Supabase Auth (solo nube), servicio de correo, tablas `refugios`, `usuario`, `rol`, `rol_permiso`, `espacios`, Zod.