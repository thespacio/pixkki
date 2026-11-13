# Pruebas de API — Pixkki

Esta carpeta contiene la colección de Postman y las instrucciones para probar las APIs desarrolladas en Pixkki sin depender de la UI.

## Endpoints disponibles

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/login` | Login con correo + contraseña. Puede devolver `step=success` o `step=mfa`. | Pública |
| POST | `/api/v1/auth/logout` | Cerrar sesión | Requiere sesión |
| GET | `/api/v1/auth/me` | Usuario autenticado actual | Requiere sesión |
| POST | `/api/v1/auth/mfa/verify` | Verificar código MFA (2do paso del login) | Requiere sesión de credenciales |
| POST | `/api/v1/auth/recover-password` | Solicitar enlace de recuperación de contraseña | Pública |
| POST | `/api/v1/auth/reset-password` | Restablecer contraseña (tras enlace de recuperación) | Requiere sesión de recuperación |
| GET | `/api/v1/refugios` | Listar refugios (alcance por tenant) | Requiere sesión |
| GET | `/api/v1/refugios/{id}` | Detalle de un refugio | Requiere sesión |
| POST | `/api/v1/refugios` | Crear refugio + administrador | Superadmin |
| PATCH | `/api/v1/refugios/{id}` | Editar refugio (parcial) | Superadmin / admin del refugio |
| GET | `/api/v1/espacios` | Listar espacios (alcance por tenant) | Requiere sesión |
| GET | `/api/v1/espacios/{id}` | Detalle de un espacio | Requiere sesión |
| POST | `/api/v1/espacios` | Crear espacio | Admin / Superadmin |
| PATCH | `/api/v1/espacios/{id}` | Editar espacio (parcial) | Admin / Superadmin |
| DELETE | `/api/v1/espacios/{id}` | Eliminar espacio vacío | Admin / Superadmin |
| GET | `/api/catalogs/animal-states` | Listar estados de animales | Pública |

## Cómo importar la colección en Postman

1. Abre Postman.
2. Haz clic en **Import** → sube el archivo `pixkki-api.postman_collection.json`.
3. La colección aparecerá como "Pixkki API — v1".
4. Configura la variable de entorno `baseUrl`:
   - Desarrollo local: `http://localhost:3000`
   - Despliegue: tu URL de producción

## Cómo ejecutar el servidor localmente

```powershell
# En la raíz del proyecto
cd C:\Users\USUARIO\pixkki

# Instalar dependencias (si no están instaladas)
npm install

# Ejecutar en modo desarrollo
npm run dev
```

El servidor estará en `http://localhost:3000`.

## Flujo de prueba recomendado

### 1. Probar endpoint público (sin auth)
```
GET /api/catalogs/animal-states
```
Espera: `200 OK` con un array de nombres de estados de animales.

### 2. Probar login
```
POST /api/v1/auth/login
Body: { "email": "admin@refugio.test", "password": "Password123" }
```
Espera: `200 OK` con `{ step: "success", user: { ... } }` o `{ step: "mfa", factorId, challengeId }`.

### 3. Probar usuario autenticado (requiere cookie de sesión del paso 2)
```
GET /api/v1/auth/me
```
Espera: `200 OK` con los datos del usuario.

### 4. Probar logout
```
POST /api/v1/auth/logout
```
Espera: `200 OK` con mensaje de confirmación.

### 5. Probar recuperación de contraseña
```
POST /api/v1/auth/recover-password
Body: { "email": "usuario@refugio.test" }
```
Espera: `200 OK` con mensaje genérico (anti-enumeración de usuarios).

### 6. Probar MFA (requiere haber hecho login con step=mfa primero)
```
POST /api/v1/auth/mfa/verify
Body: { "factorId": "...", "challengeId": "...", "code": "123456" }
```
Los valores `factorId` y `challengeId` vienen de la respuesta del login con `step: "mfa"`.

## Notas importantes

- **Cookies de sesión**: Postman debe tener habilitado el envío de cookies para que `/me`, `/logout`, y `/mfa/verify` funcionen después del login. En la app de Postman, las cookies se manejan automáticamente si usas la misma sesión/colección.
- **Rate limit**: El login tiene límite por IP (10 req/15 min) y por correo (5 req/15 min). Si excedes el límite, recibirás `429 Too Many Requests`.
- **Respuestas de error**: Todos los endpoints de `/api/v1/auth/` devuelven errores con formato uniforme: `{ success: false, error: { code, message, statusCode } }`.
- **Supabase en la nube**: Las APIs se conectan a Supabase en la nube (ver `.env.local`). No hay entorno local de Supabase.

## Archivos

- `pixkki-api.postman_collection.json` — colección de Postman lista para importar.
- `README.md` — este archivo.