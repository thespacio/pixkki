# Datos iniciales — Seeders de refugios, personal y animales

> **Estado:** aprobado para ejecución en producción con datos ficticios (confirmación explícita del humano).
> **Método:** `docs/ui-ux-metodologia.md`.
> **Módulos afectados:** `shelters`, `users`, `auth`, `animals` (solo datos, sin cambio de contratos).

## 1. Objetivo

Disponer de un conjunto pequeño y repetible de refugios, personal y animales de demostración para validar flujos en un entorno ya desplegado, sin alterar filas existentes.

## 2. Alcance

| Entidad | Cantidad | Regla |
| :--- | :--- | :--- |
| Refugio | 2 | Nombres y slugs prefijados `DEMO-` / `demo-`. |
| Espacio | 1 por refugio | Requerido por `animal.id_espacio`. |
| Usuario | 5 | 1 superadmin, 1 administrador y 1 veterinario por refugio. Roles 3/1/2. |
| Animal | 10 | 5 por refugio, en estado `Cuarentena`, `en_cuarentena = true`, `disponible_adopcion = false`. |

No se crean perfiles de adopción publicados, solicitudes, imágenes ni catálogos nuevos. No se modifican roles, permisos ni RLS.

## 3. Identidad de los datos demo

- Correos: `*.pixkki.test` (dominio reservado, no entrega correo real).
- Nombres visibles: prefijo `DEMO` (`DEMO-` o `DEMO `).
- Slugs: prefijo `demo-`.
- Contraseña de los usuarios Auth: **nunca hardcodeada**; se lee de `SEED_DEMO_PASSWORD`.
- Usuarios creados con `debe_cambiar_password = true` y `primer_inicio_sesion = true`.
- No se envían correos de bienvenida ni de restablecimiento.
- Las credenciales reales para probar están en `docs/usuarios-prueba.local.md` (documento local, ignorado por Git; no incluirlo en el repositorio).

## 4. Reglas de idempotencia y seguridad

1. Todo se inserta solo si no existe por su clave natural (`slug`, `correo`, `nombre_espacio` + `id_refugio`, `nombre` + `id_refugio`).
2. Si existe una fila con la misma clave pero **sin** el prefijo demo, el seed aborta antes de seguir.
3. Nunca se ejecuta `UPDATE` sobre datos existentes, salvo para vincular `usuario.auth_user_id` cuando está `NULL`.
4. Nunca se ejecuta `DELETE`.
5. `supabase/seed.sql` es la fuente canónica para `supabase db reset` (local). En producción se usa el script con service role porque no hay DSN de base de datos configurado.
6. El script es **dry-run por defecto**; escribe solo con `--apply` y exige `PIXKKI_SEED_CONFIRM=PRODUCCION`.
7. Si faltan los roles 1/2/3 o el estado `Cuarentena`, aborta con mensaje claro: no los crea (sería cambio de contrato).

## 5. Ejecución

Variables requeridas en `.env.local`:

```text
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SEED_DEMO_PASSWORD=<contraseña temporal>
PIXKKI_SEED_CONFIRM=PRODUCCION
```

Comandos:

```bash
npm run seed:production:dry   # solo lectura, imprime el plan
npm run seed:production       # aplica los cambios
```

## 6. Riesgos y mitigación

| Riesgo | Mitigación |
| :--- | :--- |
| Datos ficticios visibles para usuarios reales | Prefijos `DEMO-`, correos `.test`, creación explícita y aceptada en producción. |
| Colisión con datos reales | Aborte por clave natural antes de insertar; nunca sobrescribe. |
| Exposición de credenciales | Contraseña solo por variable de entorno; no se imprime ni se commitea. |
| Deriva entre SQL local y script de producción | Mismo conjunto de datos en ambos archivos; se revisa en `git diff`. |
| Acceso directo a Supabase fuera de repositories | Excepción de infraestructura aprobada; la app sigue usando repositories. |

## 7. Limpieza

Para retirar los datos demo después de las pruebas: eliminar animales y usuarios cuyo nombre/correo tenga el prefijo indicado, luego espacios y refugios `demo-`, y por último los usuarios de Auth con correo `*.pixkki.test`. La limpieza es manual y requiere otra aprobación.
