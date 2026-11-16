-- ============================================================================
-- Migración: Requerimiento 00 — Épica 0
--   * Superadmin (usuario.id_refugio nullable, rol "Superadmin").
--   * Aceptación de Términos y Condiciones (F-AUTH-05 / US27).
--   * Flags de onboarding y contraseña temporal (US02 / US30 / US32).
-- Fecha: 2026-11-12
--
-- La base real ya tiene los roles 1 Administrador, 2 Veterinario y
-- 3 Superadmin. No se crean roles nuevos. Es idempotente: puede ejecutarse
-- más de una vez sin error.
--
-- Cómo aplicarla:
--   Supabase Dashboard > SQL Editor > New query > pegar este archivo > Run.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. USUARIO: el superadmin no pertenece a un refugio
-- ----------------------------------------------------------------------------
alter table public.usuario
  alter column id_refugio drop not null;

-- Contraseña temporal (US02 / US32): el primer acceso obliga a cambiarla.
alter table public.usuario
  add column if not exists debe_cambiar_password boolean not null default false;

-- Onboarding (US30): true solo para cuentas recién creadas que aún no han
-- completado el asistente de configuración. Los usuarios existentes quedan en
-- false para no forzarles el wizard.
alter table public.usuario
  add column if not exists primer_inicio_sesion boolean not null default false;

-- ----------------------------------------------------------------------------
-- 2. ACEPTACIÓN DE TÉRMINOS Y CONDICIONES (F-AUTH-05 / US27)
-- ----------------------------------------------------------------------------
create table if not exists public.aceptacion_terminos (
  id_aceptacion    bigint generated always as identity primary key,
  id_usuario       integer     not null references public.usuario(id_usuario) on delete cascade,
  id_refugio       integer              references public.refugio(id_refugio) on delete set null,
  terminos_version text        not null check (char_length(terminos_version) between 1 and 20),
  aceptado_en      timestamptz not null default now(),
  unique (id_usuario, terminos_version)
);

create index if not exists aceptacion_terminos_usuario_idx
  on public.aceptacion_terminos (id_usuario);

alter table public.aceptacion_terminos enable row level security;

revoke all on public.aceptacion_terminos from anon;

-- Cada usuario solo ve y registra sus propias aceptaciones.
drop policy if exists aceptacion_terminos_propia on public.aceptacion_terminos;
create policy aceptacion_terminos_propia on public.aceptacion_terminos
  for all to authenticated
  using (
    id_usuario in (
      select u.id_usuario
      from public.usuario u
      where u.auth_user_id = auth.uid()
    )
  )
  with check (
    id_usuario in (
      select u.id_usuario
      from public.usuario u
      where u.auth_user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 3. SUPERADMIN
--
-- El rol "Superadmin" (id 3) ya existe. Para habilitar una cuenta:
--   1. Créala en Supabase Auth (Authentication > Users) y confirma el correo.
--   2. Ejecuta, reemplazando el correo:
--
--      insert into public.usuario
--        (auth_user_id, nombre_completo, correo, rol, id_refugio, activo)
--      select au.id, 'Superadmin Pixkki', au.email, 3, null, true
--      from auth.users au
--      where au.email = 'superadmin@tudominio.com'
--      on conflict do nothing;
--
-- No se inserta automáticamente porque requiere una cuenta real de Auth.
-- ----------------------------------------------------------------------------

notify pgrst, 'reload schema';

-- ============================================================================
-- Verificación (opcional):
--   select column_name, is_nullable from information_schema.columns
--     where table_schema = 'public' and table_name = 'usuario'
--       and column_name in ('id_refugio', 'debe_cambiar_password', 'primer_inicio_sesion');
--   select * from public.aceptacion_terminos;
-- ============================================================================
