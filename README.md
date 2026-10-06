# PIXKKI

Plataforma SaaS multi-tenant para la gestión integral de refugios de animales. Centraliza expedientes clínicos, adopciones, inventario, donaciones y reportes operativos bajo un modelo de monolito modular con aislamiento de datos por organización.

## Tabla de contenidos

- [Descripción general](#descripción-general)
- [Arquitectura](#arquitectura)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Ejecución](#ejecución)
- [Flujo de trabajo con Git](#flujo-de-trabajo-con-git)
- [Nomenclatura de ramas y commits](#nomenclatura-de-ramas-y-commits)
- [Versionamiento](#versionamiento)
- [Pruebas](#pruebas)
- [Despliegue](#despliegue)
- [Equipo](#equipo)
- [Licencia](#licencia)

## Descripción general

Pixkki es una solución de software tipo SaaS orientada a la transformación digital de centros de rescate animal. Su núcleo arquitectónico distribuye la lógica de negocio mediante un desacoplamiento modular, eliminando redundancias y garantizando estabilidad y disponibilidad en la nube.

El sistema permite a los refugios gestionar procedimientos operativos internos de forma segura, descentralizada y en tiempo real, con trazabilidad absoluta del historial clínico y el estado de los animales, aislando los datos entre diferentes organizaciones bajo estrictos estándares de seguridad.

Principales capacidades:

- Registro y autenticación multi-tenant con verificación de correo.
- Onboarding wizard para aprovisionamiento de nuevos refugios.
- Gestión de expedientes clínicos, diagnósticos, chequeos y vacunación.
- Control de cuarentena automática y temperamento animal.
- Publicación de perfiles públicos y catálogo de adopciones.
- Pipeline de postulaciones, entrevistas y seguimiento de adopciones.
- Gestión de inventario, donaciones en especie y alertas de stock mínimo.
- Reportes de población, ocupación y donaciones.
- Aislamiento de datos por `tenant_id` con políticas RLS en PostgreSQL.

## Arquitectura

Pixkki implementa un patrón de **Monolito Modular Multi-Tenant** dentro de la jerarquía de directorios de Next.js (App Router). Este enfoque previene la saturación típica de directorios compartidos y mitiga la sobreingeniería asociada a la arquitectura de microservicios distribuidos.

Capas principales:

- Presentación: Server Components y Client Components con Next.js App Router.
- Lógica de negocio: módulos autocontenidos por dominio.
- Servicios: Supabase BaaS (Auth, Storage, Edge Functions).
- Datos: PostgreSQL con Row Level Security.
- Transversal: CI/CD con GitHub Actions, despliegue en Vercel.

Directrices técnicas destacadas:

- El directorio `app/api/` se reserva exclusivamente para endpoints públicos orientados a integraciones de terceros. Toda mutación o consulta interna se delega a los ficheros `services/` dentro de cada módulo.
- Los componentes con lógica pesada de negocio residen dentro del módulo al que pertenecen. El directorio general `components/` se mantiene únicamente para UI atómica u orgánica reusable.
- El aislamiento entre refugios se garantiza a nivel de persistencia mediante políticas RLS nativas de PostgreSQL, usando `tenant_id` como identificador único global.

Para más detalle, consultar la [Especificación Técnica de Arquitectura](docs/arquitectura.md).

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend web | TypeScript, React, Next.js 16 (Turbopack) |
| Frontend móvil | React Native |
| Estilos | Tailwind CSS |
| BaaS | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| Versionamiento | Git + GitHub |
| QA | Playwright (E2E) |
| CI/CD | GitHub Actions |
| Despliegue | Vercel |

## Estructura del proyecto

```
PIXKKI/
├── .github/
│   ├── workflows/              # Pipelines de CI/CD (GitHub Actions)
│   ├── ISSUE_TEMPLATE/         # Plantillas de incidencias
│   └── PULL_REQUEST_TEMPLATE.md
├── app/                        # CAPA DE PRESENTACIÓN (Rutas de Next.js)
│   ├── (auth)/                 # Rutas de autenticación
│   ├── (dashboard)/            # Rutas protegidas de la aplicación
│   │   ├── animales/           # Vistas del módulo de animales
│   │   ├── adopciones/         # Vistas del módulo de adopciones
│   │   ├── inventario/         # Vistas del módulo de inventario
│   │   └── layout.tsx          # Selector de Refugio (Contexto)
│   ├── api/                    # Solo endpoints públicos y webhooks
│   ├── layout.tsx
│   └── page.tsx
├── components/                 # COMPONENTES GLOBALES (UI genérica)
│   └── ui/                     # Botones, inputs, modales (Shadcn/ui o Tailwind)
├── modules/                    # CAPA DE NEGOCIO (Monolito Modular)
│   ├── auth/                   # Módulo de autenticación
│   │   ├── components/         # Formularios específicos de auth
│   │   ├── services/           # Llamadas a Supabase SDK
│   │   └── types.ts            # Tipos e interfaces de auth
│   ├── animales/               # Módulo de animales
│   ├── adopciones/             # Módulo de adopciones
│   ├── inventario/             # Módulo de inventario
│   └── superadmin/             # Aprovisionamiento de tenants
├── lib/                        # CONFIGURACIONES GLOBALES
│   ├── supabaseClient.ts       # Inicialización de Supabase SDK con RLS
│   └── context/                # Estado global (Refugio seleccionado)
├── tests/                      # CAPA DE QA (Playwright)
│   ├── e2e/                    # Pruebas integrales por flujo de negocio
│   └── api/                    # Pruebas de endpoints o RPCs de Supabase
├── supabase/                   # Migraciones y seeds
│   ├── migrations/             # Triggers de auditoría y políticas RLS
│   └── seed.sql                # Datos de prueba
├── docs/                       # Documentación técnica y de usuario
├── .env.example                # Plantilla de variables de entorno
├── .gitignore                  # Archivo de exclusiones
├── README.md                   # Este archivo
├── CONTRIBUTING.md             # Guía de contribución
├── CHANGELOG.md                # Historial de versiones
└── package.json
```

## Requisitos previos

- Node.js 20 LTS o superior
- npm 10 o superior (o pnpm/yarn)
- Git 2.40 o superior
- Cuenta en Supabase (proyecto creado)
- Cuenta en Vercel (para despliegue)
- Cuenta en GitHub con acceso al repositorio

## Instalación

Clona el repositorio e instala las dependencias:

```bash
git clone https://github.com/TU_ORG/PIXKKI.git
cd PIXKKI
npm install
```

Copia el archivo de variables de entorno y completa los valores:

```bash
cp .env.example .env.local
```

## Variables de entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima pública | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (solo servidor) | `eyJhbGci...` |
| `NEXT_PUBLIC_APP_URL` | URL base de la aplicación | `http://localhost:3000` |
| `EMAIL_PROVIDER_API_KEY` | Clave del proveedor de correo | `re_xxxx` |
| `STORAGE_BUCKET` | Nombre del bucket de imágenes | `animales` |
| `SENTRY_DSN` | DSN de Sentry (opcional) | `https://...` |

Nunca subas el archivo `.env.local` al repositorio. Está incluido en `.gitignore`.

## Ejecución

Modo desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

Modo producción local:

```bash
npm run build
npm run start
```

Linter y formateo:

```bash
npm run lint
npm run format
```
├── app/
│   ├── email-password/     # Email + Password demo
│   ├── google-login/        # Google OAuth demo
│   └── test.tsx             # Home page with demo links
├── lib/
│   └── supabase/
│       ├── browser-client.ts    # Client-side Supabase client
│       └── server-client.ts     # Server-side Supabase client
└── proxy.ts                 # Next.js proxy for protected routes
```

Luego abre una pull request hacia `develop` (o `main` según corresponda), asigna al menos un revisor, atiende las observaciones y espera la aprobación antes del merge.

## Nomenclatura de ramas y commits

Las ramas siguen el formato `tipo/descripcion-breve-en-kebab-case`. Ejemplos:

- `feature/login-jwt`
- `bugfix/validacion-email`
- `hotfix/error-cuarentena`
- `docs/actualizar-readme`

Los commits siguen la convención **Conventional Commits**:

```
<tipo>(<alcance opcional>): <descripción breve>
```

Tipos permitidos:

| Tipo | Uso |
|------|-----|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de error |
| `docs` | Cambios en documentación |
| `style` | Formato, sin cambio de lógica |
| `refactor` | Reestructuración sin cambio funcional |
| `test` | Añadir o modificar pruebas |
| `chore` | Tareas de mantenimiento |
| `perf` | Mejoras de rendimiento |
| `ci` | Cambios en pipelines de CI/CD |

Ejemplos:

```
feat(auth): agregar verificación de correo con token
fix(animales): corregir cálculo de cuarentena automática
docs(readme): documentar flujo de ramas
test(adopciones): agregar prueba E2E de postulación
```

## Versionamiento

El proyecto sigue **Semantic Versioning** (SemVer): `MAYOR.MENOR.PARCHE`.

- `MAYOR`: cambios incompatibles con versiones anteriores.
- `MENOR`: nuevas funcionalidades compatibles.
- `PARCHE`: correcciones compatibles.

Las versiones se etiquetan sobre `main` con tags anotados:

```bash
git tag -a v0.1.0 -m "Versión inicial del proyecto"
git push origin v0.1.0
```

El historial de cambios se documenta en [CHANGELOG.md](CHANGELOG.md).

## Pruebas

Pruebas end-to-end con Playwright:

```bash
npm run test:e2e
```

Modo interactivo:

```bash
npm run test:e2e:ui
```

Ver reporte de la última ejecución:

```bash
npx playwright show-report
```

Las pruebas cubren flujos críticos: autenticación, onboarding, alta de paciente, adopciones e inventario. Se ejecutan automáticamente en cada pull request mediante GitHub Actions.

## Despliegue

El despliegue es automático hacia Vercel cuando se integra un cambio en `main` y el pipeline de CI pasa exitosamente.

Flujo de despliegue:

1. Pull request aprobada y fusionada en `main`.
2. GitHub Actions compila el proyecto y ejecuta pruebas E2E.
3. Si el reporte es exitoso, Vercel despliega automáticamente.
4. Se notifica al equipo en el canal correspondiente.

Para despliegue manual:

```bash
npm run build
vercel --prod
```

Entornos:

| Entorno | Rama | URL |
|---------|------|-----|
| Producción | `main` | `https://pixkki.app` |
| Staging | `develop` | `https://staging.pixkki.app` |
| Preview | `feature/*` | Generada por Vercel por PR |

## Equipo

| Integrante | Rol |
|------------|-----|
| Jose | Product Owner / Scrum Master |
| Mauricio | Developer Full-stack / UI-UX / Documentación |
| Brenda | Developer Full-stack |
| Brandon | Developer Backend / BD / Documentación |

Para consultar la matriz completa de roles y responsabilidades, revisar [docs/roles.md](docs/roles.md).

## Licencia

Este proyecto es de uso académico y privado. Todos los derechos reservados al equipo PIXKKI.

Para dudas, sugerencias o reportes, abrir una incidencia en el repositorio o contactar al equipo mediante los canales internos.
