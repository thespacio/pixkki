-- ============================================================================
-- Migración: campañas de adopción (publicaciones sugeridas por IA)
-- Fecha: 2026-10-25
--
-- Crea:
--   1. Tablas public.campana y public.campana_animal (con RLS).
--   2. Permisos campaigns.* y su asignación a Administrador y Superadmin.
--   3. Vista public.campana_publica: lo ÚNICO que ve la landing pública.
--
-- Cómo aplicarla:
--   Supabase Dashboard > SQL Editor > New query > pegar este archivo > Run.
--
-- Es idempotente: se puede ejecutar más de una vez sin error.
-- No toca datos existentes ni modifica tablas actuales.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. TABLAS
-- ----------------------------------------------------------------------------

create table if not exists public.campana (
  id_campana           bigint generated always as identity primary key,
  id_refugio           integer     not null references public.refugio(id_refugio) on delete cascade,
  titulo               text        not null check (char_length(titulo) between 3 and 120),
  contenido            text        not null check (char_length(contenido) between 10 and 1500),
  hashtags             text[]      not null default '{}',
  llamado_accion       text                 check (llamado_accion is null or char_length(llamado_accion) <= 200),
  estado               text        not null default 'borrador'
                                   check (estado in ('borrador', 'publicada', 'archivada')),
  generada_por_ia      boolean     not null default false,
  modelo_ia            text,
  id_usuario_creador   integer              references public.usuario(id_usuario) on delete set null,
  fecha_creacion       timestamptz not null default now(),
  fecha_actualizacion  timestamptz not null default now(),
  fecha_publicacion    timestamptz
);

create index if not exists campana_refugio_estado_idx on public.campana (id_refugio, estado);

-- Animales que protagonizan cada campaña.
create table if not exists public.campana_animal (
  id_campana  bigint  not null references public.campana(id_campana) on delete cascade,
  id_animal   integer not null references public.animal(id_animal)   on delete cascade,
  primary key (id_campana, id_animal)
);

create index if not exists campana_animal_animal_idx on public.campana_animal (id_animal);


-- ----------------------------------------------------------------------------
-- 2. SEGURIDAD (RLS)
--
-- Las tablas creadas desde SQL NO traen RLS activado y Supabase da acceso
-- completo a los roles anon/authenticated por defecto: sin esto, cualquiera con
-- la clave pública podría leer y escribir campañas. Por eso se activa RLS, se
-- le quita todo acceso a `anon` y se permite gestionar solo al personal.
-- ----------------------------------------------------------------------------

create or replace function public.campanas_es_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.usuario u
    join public.rol r on r.id_rol = u.rol
    where u.auth_user_id = auth.uid()
      and u.activo
      and r.nombre_rol = 'Superadmin'
  );
$$;

create or replace function public.campanas_refugio_usuario()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select u.id_refugio
  from public.usuario u
  where u.auth_user_id = auth.uid()
    and u.activo
  limit 1;
$$;

revoke all on function public.campanas_es_superadmin()   from public, anon;
revoke all on function public.campanas_refugio_usuario() from public, anon;
grant execute on function public.campanas_es_superadmin()   to authenticated;
grant execute on function public.campanas_refugio_usuario() to authenticated;

alter table public.campana        enable row level security;
alter table public.campana_animal enable row level security;

revoke all on public.campana        from anon;
revoke all on public.campana_animal from anon;

-- El personal gestiona las campañas de su albergue; el superadmin, las de todos.
drop policy if exists campana_personal on public.campana;
create policy campana_personal on public.campana
  for all to authenticated
  using      (public.campanas_es_superadmin() or id_refugio = public.campanas_refugio_usuario())
  with check (public.campanas_es_superadmin() or id_refugio = public.campanas_refugio_usuario());

-- Solo se pueden vincular animales del MISMO albergue que la campaña.
drop policy if exists campana_animal_personal on public.campana_animal;
create policy campana_animal_personal on public.campana_animal
  for all to authenticated
  using (
    exists (
      select 1 from public.campana c
      where c.id_campana = campana_animal.id_campana
        and (public.campanas_es_superadmin() or c.id_refugio = public.campanas_refugio_usuario())
    )
  )
  with check (
    exists (
      select 1
      from public.campana c
      join public.animal  a on a.id_refugio = c.id_refugio
      where c.id_campana = campana_animal.id_campana
        and a.id_animal  = campana_animal.id_animal
        and (public.campanas_es_superadmin() or c.id_refugio = public.campanas_refugio_usuario())
    )
  );


-- ----------------------------------------------------------------------------
-- 3. PERMISOS (RBAC)
-- ----------------------------------------------------------------------------

insert into public.permiso (nombre_permiso, descripcion)
select v.nombre, v.descripcion
from (values
  ('campaigns.view',   'Ver campañas'),
  ('campaigns.create', 'Crear campañas y generar sugerencias con IA'),
  ('campaigns.edit',   'Editar, publicar y archivar campañas'),
  ('campaigns.delete', 'Eliminar campañas')
) as v(nombre, descripcion)
where not exists (
  select 1 from public.permiso p where p.nombre_permiso = v.nombre
);

insert into public.rol_permiso (id_rol, id_permiso)
select r.id_rol, p.id_permiso
from public.rol r
join public.permiso p on p.nombre_permiso like 'campaigns.%'
where r.nombre_rol in ('Administrador', 'Superadmin')
  and not exists (
    select 1 from public.rol_permiso rp
    where rp.id_rol = r.id_rol and rp.id_permiso = p.id_permiso
  );


-- ----------------------------------------------------------------------------
-- 4. VISTA PÚBLICA PARA LA LANDING PAGE
--
-- Expone SOLO lo que puede verse sin iniciar sesión:
--   * campañas publicadas de albergues activos,
--   * únicamente los animales que SIGUEN disponibles para adopción (si un animal
--     se adopta o se da de baja, desaparece de la landing sin hacer nada),
--   * campos no sensibles: nada de rescatista, microchip, contacto del albergue
--     ni notas internas.
--
-- Es una vista con los permisos de su dueño (así lee las tablas con RLS sin dar
-- acceso a `anon` a ellas). El asesor de seguridad de Supabase avisa de las
-- "vistas security definer": en este caso es intencional.
-- ----------------------------------------------------------------------------

create or replace view public.campana_publica as
select
  c.id_campana,
  c.titulo,
  c.contenido,
  c.hashtags,
  c.llamado_accion,
  c.fecha_publicacion,
  r.nombre as refugio_nombre,
  r.ciudad as refugio_ciudad,
  r.estado as refugio_estado,
  jsonb_agg(
    jsonb_build_object(
      'id_animal',     a.id_animal,
      'nombre',        a.nombre,
      'especie',       a.especie,
      'raza',          a.raza,
      'sexo',          a.sexo,
      'edad_estimada', a.edad_estimada
    )
    order by a.id_animal
  ) as animales
from public.campana c
join public.refugio        r  on r.id_refugio = c.id_refugio and r.activo
join public.campana_animal ca on ca.id_campana = c.id_campana
join public.animal         a  on a.id_animal = ca.id_animal
                             and a.disponible_adopcion
                             and a.activo
                             and a.deleted_at is null
where c.estado = 'publicada'
group by c.id_campana, r.id_refugio;

revoke all on public.campana_publica from public;
grant select on public.campana_publica to anon, authenticated;

comment on view public.campana_publica is
  'Campañas de adopción publicadas, visibles en la landing sin sesión. Solo campos no sensibles.';

-- Recarga el esquema de la API para que reconozca las tablas y la vista nuevas.
notify pgrst, 'reload schema';

-- ============================================================================
-- Verificación (opcional):
--
--   select count(*) from public.permiso where nombre_permiso like 'campaigns.%';   -- 4
--   select * from public.campana_publica;                                           -- vacío al inicio
--   select tablename, rowsecurity from pg_tables
--     where schemaname = 'public' and tablename in ('campana', 'campana_animal');  -- rowsecurity = true
-- ============================================================================
