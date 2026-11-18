-- Requerimiento 05 — Portal de adopciones (US17, US18, US19).
--
-- Perfil público, catálogo, postulación anónima, gestión de solicitudes,
-- evaluaciones, reserva y cierre de adopción. Presupone el gatekeeper de la
-- Épica 4 (`animal.disponible_adopcion`) y lo revalida en las operaciones de
-- publicación, postulación y aprobación.
--
-- Idempotente: puede ejecutarse más de una vez sin duplicar objetos.

begin;

-- ---------------------------------------------------------------------------
-- 1) Refugio: slug público y descripción institucional
-- ---------------------------------------------------------------------------

alter table public.refugio
  add column if not exists slug text,
  add column if not exists descripcion_publica text;

-- Slug base estable por nombre; colisión resuelta con sufijo "-<id_refugio>".
with base as (
  select
    id_refugio,
    nullif(
      regexp_replace(
        regexp_replace(
          translate(
            lower(coalesce(nombre, '')),
            'áàäâãåéèëêíìïîóòöôõúùüûñçÁÀÄÂÃÅÉÈËÊÍÌÏÎÓÒÖÔÕÚÙÜÛÑÇ',
            'aaaaaaeeeeiiiiooooouuuuncAAAAAAEEEEIIIIOOOOOUUUUNC'
          ),
          '[^a-z0-9]+', '-', 'g'
        ),
        '(^-+|-+$)', '', 'g'
      ),
      ''
    ) as base_slug
  from public.refugio
), resolved as (
  select
    id_refugio,
    coalesce(base_slug, 'refugio') as base_slug,
    count(*) over (
      partition by coalesce(base_slug, 'refugio')
    ) as collisions
  from base
)
update public.refugio r
set slug = case
  when resolved.collisions > 1 then resolved.base_slug || '-' || r.id_refugio::text
  else resolved.base_slug
end
from resolved
where r.id_refugio = resolved.id_refugio
  and (r.slug is null or btrim(r.slug) = '');

-- Garantiza unicidad incluso si dos refugios comparten nombre.
update public.refugio r
set slug = r.slug || '-' || r.id_refugio::text
where r.slug in (
  select slug
  from public.refugio
  where slug is not null
  group by slug
  having count(*) > 1
);

alter table public.refugio
  alter column slug set not null;

create unique index if not exists refugio_slug_uidx on public.refugio (slug);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'refugio_descripcion_publica_len_check'
      and conrelid = 'public.refugio'::regclass
  ) then
    alter table public.refugio
      add constraint refugio_descripcion_publica_len_check
      check (
        descripcion_publica is null
        or char_length(btrim(descripcion_publica)) between 1 and 2000
      );
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2) Animal: reserva y fecha de adopción
-- ---------------------------------------------------------------------------

alter table public.animal
  add column if not exists reservado_adopcion boolean not null default false,
  add column if not exists fecha_reserva timestamptz,
  add column if not exists fecha_adopcion date;

create index if not exists animal_refugio_reservado_idx
  on public.animal (id_refugio, reservado_adopcion);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'animal_reserva_fecha_check'
      and conrelid = 'public.animal'::regclass
  ) then
    alter table public.animal
      add constraint animal_reserva_fecha_check
      check (
        (reservado_adopcion and fecha_reserva is not null)
        or (not reservado_adopcion and fecha_reserva is null)
      );
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 3) Perfil público de adopción (US17)
-- ---------------------------------------------------------------------------

create table if not exists public.perfil_adopcion (
  id_perfil_adopcion bigserial primary key,
  id_animal integer not null references public.animal(id_animal) on delete cascade,
  id_refugio integer not null references public.refugio(id_refugio) on delete cascade,
  descripcion_publica text,
  publicado boolean not null default false,
  fecha_publicacion timestamptz,
  fecha_despublicacion timestamptz,
  id_usuario_creacion integer references public.usuario(id_usuario),
  id_usuario_actualizacion integer references public.usuario(id_usuario),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint perfil_adopcion_animal_uidx unique (id_animal),
  constraint perfil_adopcion_descripcion_len_check check (
    descripcion_publica is null
    or char_length(btrim(descripcion_publica)) between 50 and 2000
  )
);

create index if not exists perfil_adopcion_refugio_publicado_idx
  on public.perfil_adopcion (id_refugio, publicado);

alter table public.perfil_adopcion enable row level security;
revoke all on public.perfil_adopcion from anon;

drop policy if exists perfil_adopcion_tenant on public.perfil_adopcion;
create policy perfil_adopcion_tenant on public.perfil_adopcion
  for all to authenticated
  using (public.current_user_is_superadmin() or id_refugio = public.current_refugio_id())
  with check (public.current_user_is_superadmin() or id_refugio = public.current_refugio_id());

-- ---------------------------------------------------------------------------
-- 4) Adoptante: datos adicionales y deduplicación por correo/refugio
-- ---------------------------------------------------------------------------

alter table public.adoptante
  add column if not exists tiene_ninos boolean not null default false,
  add column if not exists experiencia_mascotas text,
  add column if not exists declara_mayor_edad boolean not null default false,
  add column if not exists fecha_aceptacion_privacidad timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'adoptante_experiencia_len_check'
      and conrelid = 'public.adoptante'::regclass
  ) then
    alter table public.adoptante
      add constraint adoptante_experiencia_len_check
      check (experiencia_mascotas is null or char_length(experiencia_mascotas) <= 1000);
  end if;
end $$;

-- Deduplicación previa (si existieran filas históricas).
with ranked as (
  select
    id_adoptante,
    first_value(id_adoptante) over (
      partition by id_refugio, lower(correo)
      order by fecha_registro asc nulls last, id_adoptante asc
    ) as canonical_id
  from public.adoptante
), dup as (
  select id_adoptante, canonical_id
  from ranked
  where id_adoptante <> canonical_id
)
update public.solicitud_adopcion s
set id_adoptante = dup.canonical_id
from dup
where s.id_adoptante = dup.id_adoptante;

delete from public.adoptante a
using (
  select id_adoptante
  from (
    select
      id_adoptante,
      row_number() over (
        partition by id_refugio, lower(correo)
        order by fecha_registro asc nulls last, id_adoptante asc
      ) as rn
    from public.adoptante
  ) t
  where t.rn > 1
) d
where a.id_adoptante = d.id_adoptante;

create unique index if not exists adoptante_refugio_correo_uidx
  on public.adoptante (id_refugio, lower(correo));

alter table public.adoptante enable row level security;
revoke all on public.adoptante from anon;

drop policy if exists adoptante_tenant on public.adoptante;
create policy adoptante_tenant on public.adoptante
  for all to authenticated
  using (public.current_user_is_superadmin() or id_refugio = public.current_refugio_id())
  with check (public.current_user_is_superadmin() or id_refugio = public.current_refugio_id());

-- ---------------------------------------------------------------------------
-- 5) Solicitud de adopción: tenant, estados, folio y cierre
-- ---------------------------------------------------------------------------

alter table public.solicitud_adopcion
  add column if not exists id_refugio integer,
  add column if not exists codigo_seguimiento uuid,
  add column if not exists motivo_rechazo text,
  add column if not exists fecha_cierre timestamptz,
  add column if not exists id_usuario_cierre integer references public.usuario(id_usuario);

-- Backfill de tenant desde adoptante y, en su defecto, desde animal.
update public.solicitud_adopcion s
set id_refugio = ad.id_refugio
from public.adoptante ad
where s.id_adoptante = ad.id_adoptante
  and s.id_refugio is null;

update public.solicitud_adopcion s
set id_refugio = a.id_refugio
from public.animal a
where s.id_animal = a.id_animal
  and s.id_refugio is null;

-- Folio estable para registros existentes.
update public.solicitud_adopcion
set codigo_seguimiento = gen_random_uuid()
where codigo_seguimiento is null;

do $$
begin
  if exists (
    select 1 from public.solicitud_adopcion where id_refugio is null
  ) then
    raise exception
      'Requerimiento 05: existen solicitudes sin id_refugio resoluble. Corrige los datos antes de aplicar la migración.';
  end if;

  alter table public.solicitud_adopcion
    alter column id_refugio set not null,
    alter column codigo_seguimiento set not null,
    alter column codigo_seguimiento set default gen_random_uuid();

  if not exists (
    select 1 from pg_constraint
    where conname = 'solicitud_adopcion_id_refugio_fkey'
      and conrelid = 'public.solicitud_adopcion'::regclass
  ) then
    alter table public.solicitud_adopcion
      add constraint solicitud_adopcion_id_refugio_fkey
      foreign key (id_refugio) references public.refugio(id_refugio) on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'solicitud_adopcion_codigo_seguimiento_key'
      and conrelid = 'public.solicitud_adopcion'::regclass
  ) then
    alter table public.solicitud_adopcion
      add constraint solicitud_adopcion_codigo_seguimiento_key
      unique (codigo_seguimiento);
  end if;
end $$;

do $$
declare
  v_constraint text;
begin
  for v_constraint in
    select c.conname
    from pg_constraint c
    where c.conrelid = 'public.solicitud_adopcion'::regclass
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%estado_solicitud%'
  loop
    execute format('alter table public.solicitud_adopcion drop constraint %I', v_constraint);
  end loop;

  alter table public.solicitud_adopcion
    add constraint chk_solicitud_estado check (
      estado_solicitud in (
        'Recibida', 'En entrevista', 'En evaluación', 'Aprobada',
        'Rechazada', 'Cancelada', 'Completada'
      )
    );
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'solicitud_motivo_rechazo_len_check'
      and conrelid = 'public.solicitud_adopcion'::regclass
  ) then
    alter table public.solicitud_adopcion
      add constraint solicitud_motivo_rechazo_len_check
      check (motivo_rechazo is null or char_length(btrim(motivo_rechazo)) between 10 and 500);
  end if;
end $$;

create index if not exists solicitud_adopcion_refugio_estado_fecha_idx
  on public.solicitud_adopcion (id_refugio, estado_solicitud, fecha_solicitud desc);
create index if not exists solicitud_adopcion_animal_estado_idx
  on public.solicitud_adopcion (id_animal, estado_solicitud);
create index if not exists solicitud_adopcion_adoptante_idx
  on public.solicitud_adopcion (id_adoptante, estado_solicitud);

alter table public.solicitud_adopcion enable row level security;
revoke all on public.solicitud_adopcion from anon;

drop policy if exists solicitud_adopcion_tenant on public.solicitud_adopcion;
create policy solicitud_adopcion_tenant on public.solicitud_adopcion
  for all to authenticated
  using (public.current_user_is_superadmin() or id_refugio = public.current_refugio_id())
  with check (public.current_user_is_superadmin() or id_refugio = public.current_refugio_id());

-- ---------------------------------------------------------------------------
-- 6) Evaluación de adopción: tenant, tipos, resultados y puntuación 0-100
-- ---------------------------------------------------------------------------

alter table public.evaluacion_adopcion
  add column if not exists id_refugio integer;

update public.evaluacion_adopcion e
set id_refugio = s.id_refugio
from public.solicitud_adopcion s
where e.id_solicitud = s.id_solicitud
  and e.id_refugio is null;

do $$
begin
  if exists (
    select 1 from public.evaluacion_adopcion where id_refugio is null
  ) then
    raise exception
      'Requerimiento 05: existen evaluaciones sin id_refugio resoluble. Corrige los datos antes de aplicar la migración.';
  end if;

  alter table public.evaluacion_adopcion
    alter column id_refugio set not null;

  if not exists (
    select 1 from pg_constraint
    where conname = 'evaluacion_adopcion_id_refugio_fkey'
      and conrelid = 'public.evaluacion_adopcion'::regclass
  ) then
    alter table public.evaluacion_adopcion
      add constraint evaluacion_adopcion_id_refugio_fkey
      foreign key (id_refugio) references public.refugio(id_refugio) on delete cascade;
  end if;
end $$;

-- Puntuación 0-100 (escala entera/decimal). numeric(4,2) no admite 100.
alter table public.evaluacion_adopcion
  alter column puntuacion type numeric(5,2)
  using case
    when puntuacion is null then null
    when puntuacion < 0 then 0
    when puntuacion > 100 then 100
    else puntuacion
  end;

do $$
declare
  v_constraint text;
begin
  for v_constraint in
    select c.conname
    from pg_constraint c
    where c.conrelid = 'public.evaluacion_adopcion'::regclass
      and c.contype = 'c'
      and (
        pg_get_constraintdef(c.oid) ilike '%tipo_evaluacion%'
        or pg_get_constraintdef(c.oid) ilike '%resultado%'
        or pg_get_constraintdef(c.oid) ilike '%puntuacion%'
      )
  loop
    execute format('alter table public.evaluacion_adopcion drop constraint %I', v_constraint);
  end loop;

  alter table public.evaluacion_adopcion
    add constraint chk_eval_tipo check (
      tipo_evaluacion in ('entrevista', 'visita_hogar', 'compatibilidad', 'referencias', 'otro')
    ),
    add constraint chk_eval_resultado check (
      resultado in ('Pendiente', 'Aprobado', 'Rechazado', 'Con observaciones')
    ),
    add constraint chk_eval_puntuacion check (
      puntuacion is null or (puntuacion >= 0 and puntuacion <= 100)
    );
end $$;

create index if not exists evaluacion_adopcion_refugio_solicitud_idx
  on public.evaluacion_adopcion (id_refugio, id_solicitud, fecha_evaluacion desc, id_evaluacion_adopcion desc);

alter table public.evaluacion_adopcion enable row level security;
revoke all on public.evaluacion_adopcion from anon;

drop policy if exists evaluacion_adopcion_tenant on public.evaluacion_adopcion;
create policy evaluacion_adopcion_tenant on public.evaluacion_adopcion
  for all to authenticated
  using (public.current_user_is_superadmin() or id_refugio = public.current_refugio_id())
  with check (public.current_user_is_superadmin() or id_refugio = public.current_refugio_id());

-- ---------------------------------------------------------------------------
-- 7) Permisos adoptions.* y asignación por rol
-- ---------------------------------------------------------------------------

insert into public.permiso (nombre_permiso, descripcion)
select v.nombre_permiso, v.descripcion
from (
  values
    ('adoptions.view', 'Ver perfiles, catálogo interno y solicitudes de adopción'),
    ('adoptions.publish', 'Publicar y despublicar perfiles de adopción'),
    ('adoptions.evaluate', 'Registrar evaluaciones de adopción'),
    ('adoptions.manage', 'Gestionar estados de solicitudes de adopción'),
    ('adoptions.complete', 'Completar adopciones')
) as v(nombre_permiso, descripcion)
where not exists (
  select 1 from public.permiso p where p.nombre_permiso = v.nombre_permiso
);

-- Asignación alineada a la matriz del requerimiento:
-- Administrador: view, publish, evaluate, manage, complete
-- Coordinador (si existe): idem
-- Evaluador (si existe): view, evaluate
-- Veterinario: view
-- Operador (si existe): view
-- Superadmin: todos
insert into public.rol_permiso (id_rol, id_permiso)
select r.id_rol, p.id_permiso
from public.rol r
join public.permiso p on p.nombre_permiso in (
  'adoptions.view', 'adoptions.publish', 'adoptions.evaluate', 'adoptions.manage', 'adoptions.complete'
)
where lower(r.nombre_rol) in ('administrador', 'superadmin', 'coordinador')
  and not exists (
    select 1 from public.rol_permiso rp
    where rp.id_rol = r.id_rol and rp.id_permiso = p.id_permiso
  );

insert into public.rol_permiso (id_rol, id_permiso)
select r.id_rol, p.id_permiso
from public.rol r
join public.permiso p on p.nombre_permiso in ('adoptions.view', 'adoptions.evaluate')
where lower(r.nombre_rol) = 'evaluador'
  and not exists (
    select 1 from public.rol_permiso rp
    where rp.id_rol = r.id_rol and rp.id_permiso = p.id_permiso
  );

insert into public.rol_permiso (id_rol, id_permiso)
select r.id_rol, p.id_permiso
from public.rol r
join public.permiso p on p.nombre_permiso = 'adoptions.view'
where lower(r.nombre_rol) in ('veterinario', 'operador')
  and not exists (
    select 1 from public.rol_permiso rp
    where rp.id_rol = r.id_rol and rp.id_permiso = p.id_permiso
  );

-- ---------------------------------------------------------------------------
-- 8) Vistas públicas (catálogo y refugios)
-- ---------------------------------------------------------------------------

create or replace view public.animal_adopcion_publica as
with ultima_temp as (
  select distinct on (e.id_animal)
    e.id_animal,
    e.comportamiento,
    e.nivel_energia,
    e.apto_perros,
    e.apto_gatos,
    e.apto_ninos,
    e.fecha_evaluacion
  from public.evaluacion_temperamento e
  order by e.id_animal, e.fecha_evaluacion desc, e.id_evaluacion_temperamento desc
), fotos as (
  select
    f.id_animal,
    jsonb_agg(
      jsonb_build_object(
        'id_fotografia', f.id_fotografia,
        'url_archivo', f.url_archivo,
        'url_thumbnail', f.url_thumbnail,
        'es_principal', f.es_principal,
        'orden', f.orden
      )
      order by f.es_principal desc, f.orden asc nulls last, f.id_fotografia asc
    ) as fotos,
    (
      array_agg(f.url_archivo order by f.es_principal desc, f.orden asc nulls last, f.id_fotografia asc)
    )[1] as foto_principal
  from public.fotografia f
  group by f.id_animal
)
select
  a.id_animal,
  a.nombre,
  a.especie,
  a.raza,
  a.sexo,
  a.edad_estimada,
  a.tamano,
  a.color,
  coalesce(t.comportamiento, a.temperamento) as temperamento,
  a.vacunado,
  a.desparasitado,
  a.esterilizado,
  a.rasgos_fisicos,
  p.descripcion_publica,
  p.fecha_publicacion,
  coalesce(f.fotos, '[]'::jsonb) as fotos,
  f.foto_principal,
  jsonb_build_object(
    'comportamiento', t.comportamiento,
    'nivel_energia', t.nivel_energia,
    'apto_perros', t.apto_perros,
    'apto_gatos', t.apto_gatos,
    'apto_ninos', t.apto_ninos
  ) as compatibilidad,
  jsonb_build_object(
    'id_refugio', r.id_refugio,
    'slug', r.slug,
    'nombre', r.nombre,
    'ciudad', r.ciudad,
    'estado', r.estado,
    'correo_contacto', r.correo_contacto,
    'telefono', r.telefono
  ) as refugio
from public.perfil_adopcion p
join public.animal a on a.id_animal = p.id_animal
join public.refugio r on r.id_refugio = p.id_refugio
left join ultima_temp t on t.id_animal = a.id_animal
left join fotos f on f.id_animal = a.id_animal
where p.publicado = true
  and a.activo = true
  and a.deleted_at is null
  and a.disponible_adopcion = true
  and a.en_cuarentena = false
  and a.reservado_adopcion = false
  and r.activo = true;

create or replace view public.refugio_publico as
select
  r.slug,
  r.nombre,
  r.ciudad,
  r.estado,
  r.descripcion_publica,
  r.correo_contacto,
  r.telefono,
  count(p.id_perfil_adopcion)::int as adoptables
from public.refugio r
left join public.perfil_adopcion p
  on p.id_refugio = r.id_refugio
 and p.publicado = true
left join public.animal a
  on a.id_animal = p.id_animal
 and a.activo = true
 and a.deleted_at is null
 and a.disponible_adopcion = true
 and a.en_cuarentena = false
 and a.reservado_adopcion = false
where r.activo = true
group by r.id_refugio, r.slug, r.nombre, r.ciudad, r.estado, r.descripcion_publica, r.correo_contacto, r.telefono
having count(p.id_perfil_adopcion) filter (
  where a.id_animal is not null
) >= 0;

revoke all on public.animal_adopcion_publica from public;
revoke all on public.refugio_publico from public;
grant select on public.animal_adopcion_publica to anon, authenticated;
grant select on public.refugio_publico to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 9) Trigger: ocultamiento automático al perder disponibilidad/reserva/baja
-- ---------------------------------------------------------------------------

create or replace function public.despublicar_perfil_adopcion_si_corresponde()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.disponible_adopcion = false
     or new.en_cuarentena = true
     or new.activo = false
     or new.deleted_at is not null
     or new.reservado_adopcion = true
  then
    update public.perfil_adopcion p
    set publicado = false,
        fecha_despublicacion = coalesce(p.fecha_despublicacion, now()),
        updated_at = now()
    where p.id_animal = new.id_animal
      and p.publicado = true;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_despublicar_perfil_adopcion on public.animal;
create trigger trg_despublicar_perfil_adopcion
after update of disponible_adopcion, en_cuarentena, activo, deleted_at, reservado_adopcion
on public.animal
for each row
execute function public.despublicar_perfil_adopcion_si_corresponde();

-- ---------------------------------------------------------------------------
-- 10) RPC: publicar/despublicar perfil (US17)
-- ---------------------------------------------------------------------------

create or replace function public.publicar_perfil_adopcion(
  p_id_animal integer,
  p_descripcion_publica text,
  p_publicado boolean,
  p_id_usuario integer
) returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_animal public.animal%rowtype;
  v_perfil public.perfil_adopcion%rowtype;
  v_desc text := nullif(btrim(p_descripcion_publica), '');
  v_fotos int := 0;
  v_bloqueos text[] := '{}';
  v_fecha_pub timestamptz;
  v_fecha_despub timestamptz;
begin
  if p_publicado is null then
    return jsonb_build_object('ok', false, 'code', 'DATOS_INVALIDOS', 'message', 'El estado de publicación es obligatorio.');
  end if;

  if p_publicado and (v_desc is null or char_length(v_desc) < 50 or char_length(v_desc) > 2000) then
    return jsonb_build_object('ok', false, 'code', 'DESCRIPCION_INVALIDA', 'message', 'La descripción pública debe tener entre 50 y 2000 caracteres.');
  end if;

  select a.* into v_animal
  from public.animal a
  where a.id_animal = p_id_animal
    and (public.current_user_is_superadmin() or a.id_refugio = public.current_refugio_id())
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'ANIMAL_NO_ENCONTRADO', 'message', 'Animal no encontrado.');
  end if;

  if p_publicado then
    select count(*) into v_fotos from public.fotografia f where f.id_animal = p_id_animal;
    if v_fotos < 1 then
      return jsonb_build_object('ok', false, 'code', 'PERFIL_SIN_FOTOGRAFIA', 'message', 'El perfil solo se publica si el animal tiene al menos una fotografía.');
    end if;
    if not v_animal.disponible_adopcion then v_bloqueos := array_append(v_bloqueos, 'no_disponible_adopcion'); end if;
    if v_animal.en_cuarentena then v_bloqueos := array_append(v_bloqueos, 'en_cuarentena'); end if;
    if not v_animal.activo or v_animal.deleted_at is not null then v_bloqueos := array_append(v_bloqueos, 'no_activo'); end if;
    if v_animal.reservado_adopcion then v_bloqueos := array_append(v_bloqueos, 'reservado_adopcion'); end if;
    if cardinality(v_bloqueos) > 0 then
      return jsonb_build_object(
        'ok', false,
        'code', 'ANIMAL_NO_DISPONIBLE',
        'message', 'El animal no cumple las condiciones para publicarse.',
        'details', jsonb_build_object('bloqueos', to_jsonb(v_bloqueos))
      );
    end if;
  end if;

  select p.* into v_perfil
  from public.perfil_adopcion p
  where p.id_animal = p_id_animal
  for update;

  if p_publicado then
    v_fecha_pub := coalesce(v_perfil.fecha_publicacion, now());
    v_fecha_despub := null;
  else
    v_fecha_pub := case when v_perfil.id_perfil_adopcion is null then null else v_perfil.fecha_publicacion end;
    v_fecha_despub := case when coalesce(v_perfil.publicado, false) then now() else v_perfil.fecha_despublicacion end;
  end if;

  insert into public.perfil_adopcion (
    id_animal, id_refugio, descripcion_publica, publicado,
    fecha_publicacion, fecha_despublicacion,
    id_usuario_creacion, id_usuario_actualizacion, updated_at
  ) values (
    p_id_animal, v_animal.id_refugio, coalesce(v_desc, v_perfil.descripcion_publica), p_publicado,
    v_fecha_pub, v_fecha_despub,
    p_id_usuario, p_id_usuario, now()
  )
  on conflict (id_animal) do update set
    descripcion_publica = coalesce(excluded.descripcion_publica, perfil_adopcion.descripcion_publica),
    publicado = excluded.publicado,
    fecha_publicacion = excluded.fecha_publicacion,
    fecha_despublicacion = excluded.fecha_despublicacion,
    id_usuario_actualizacion = excluded.id_usuario_actualizacion,
    updated_at = now()
  returning * into v_perfil;

  insert into public.auditoria (
    id_usuario, id_refugio, accion, modulo, entidad_id, descripcion
  ) values (
    p_id_usuario, v_animal.id_refugio,
    case when p_publicado then 'publicar_perfil_adopcion' else 'despublicar_perfil_adopcion' end,
    'adoptions', p_id_animal,
    case when p_publicado then 'Perfil de adopción publicado.' else 'Perfil de adopción despublicado.' end
  );

  return jsonb_build_object(
    'ok', true,
    'data', jsonb_build_object(
      'id_perfil_adopcion', v_perfil.id_perfil_adopcion,
      'id_animal', v_perfil.id_animal,
      'id_refugio', v_perfil.id_refugio,
      'descripcion_publica', v_perfil.descripcion_publica,
      'publicado', v_perfil.publicado,
      'fecha_publicacion', v_perfil.fecha_publicacion,
      'fecha_despublicacion', v_perfil.fecha_despublicacion,
      'puede_publicarse', (
        v_animal.disponible_adopcion and not v_animal.en_cuarentena and v_animal.activo
        and v_animal.deleted_at is null and not v_animal.reservado_adopcion
        and coalesce(v_perfil.descripcion_publica, '') <> ''
        and char_length(btrim(coalesce(v_perfil.descripcion_publica, ''))) between 50 and 2000
        and (select count(*) from public.fotografia f where f.id_animal = p_id_animal) > 0
      ),
      'bloqueos', '[]'::jsonb,
      'id_usuario_actualizacion', v_perfil.id_usuario_actualizacion
    )
  );
end;
$$;

revoke all on function public.publicar_perfil_adopcion(integer, text, boolean, integer) from public, anon;
grant execute on function public.publicar_perfil_adopcion(integer, text, boolean, integer) to authenticated;

-- ---------------------------------------------------------------------------
-- 11) RPC: postulación pública anónima (US18)
-- ---------------------------------------------------------------------------

create or replace function public.registrar_solicitud_adopcion(
  p_id_animal integer,
  p_nombre_completo text,
  p_telefono text,
  p_correo text,
  p_direccion text,
  p_tiene_otras_mascotas boolean,
  p_tiene_ninos boolean,
  p_espacio_techado boolean,
  p_tiempo_solo_horas integer,
  p_experiencia_mascotas text,
  p_motivo_adopcion text,
  p_comentarios_generales text,
  p_acepta_politica_privacidad boolean,
  p_declara_mayor_edad boolean
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_animal public.animal%rowtype;
  v_perfil public.perfil_adopcion%rowtype;
  v_refugio_activo boolean;
  v_adoptante_id integer;
  v_activas int;
  v_solicitud public.solicitud_adopcion%rowtype;
  v_correo text := lower(btrim(coalesce(p_correo, '')));
  v_motivo text := btrim(coalesce(p_motivo_adopcion, ''));
begin
  if not coalesce(p_acepta_politica_privacidad, false) then
    return jsonb_build_object('ok', false, 'code', 'PRIVACIDAD_NO_ACEPTADA', 'message', 'Debes aceptar la política de privacidad.');
  end if;
  if not coalesce(p_declara_mayor_edad, false) then
    return jsonb_build_object('ok', false, 'code', 'MAYORIA_DE_EDAD_NO_DECLARADA', 'message', 'Debes declarar que eres mayor de edad.');
  end if;
  if char_length(btrim(coalesce(p_nombre_completo, ''))) < 2 or char_length(btrim(coalesce(p_nombre_completo, ''))) > 150
     or char_length(btrim(coalesce(p_telefono, ''))) < 7 or char_length(btrim(coalesce(p_telefono, ''))) > 20
     or position('@' in v_correo) < 2 or char_length(v_correo) > 150
     or char_length(btrim(coalesce(p_direccion, ''))) < 5 or char_length(btrim(coalesce(p_direccion, ''))) > 255
     or char_length(v_motivo) < 20 or char_length(v_motivo) > 1000
     or (p_tiempo_solo_horas is not null and (p_tiempo_solo_horas < 0 or p_tiempo_solo_horas > 24))
     or (p_experiencia_mascotas is not null and char_length(p_experiencia_mascotas) > 1000)
     or (p_comentarios_generales is not null and char_length(p_comentarios_generales) > 2000)
  then
    return jsonb_build_object('ok', false, 'code', 'DATOS_INVALIDOS', 'message', 'Los datos de la solicitud no son válidos.');
  end if;

  -- Bloqueo del animal para serializar postulaciones y reservas.
  select a.* into v_animal
  from public.animal a
  where a.id_animal = p_id_animal
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'ANIMAL_NO_DISPONIBLE', 'message', 'El animal no está disponible para adopción.');
  end if;

  select r.activo into v_refugio_activo
  from public.refugio r
  where r.id_refugio = v_animal.id_refugio;

  select p.* into v_perfil
  from public.perfil_adopcion p
  where p.id_animal = p_id_animal;

  if v_refugio_activo is not true
     or v_perfil.id_perfil_adopcion is null
     or v_perfil.publicado is not true
     or v_animal.activo is not true
     or v_animal.deleted_at is not null
     or v_animal.disponible_adopcion is not true
     or v_animal.en_cuarentena is true
     or v_animal.reservado_adopcion is true
  then
    return jsonb_build_object('ok', false, 'code', 'ANIMAL_NO_DISPONIBLE', 'message', 'El animal no está disponible para adopción.');
  end if;

  -- Adoptante único por refugio+correo.
  select ad.id_adoptante into v_adoptante_id
  from public.adoptante ad
  where ad.id_refugio = v_animal.id_refugio
    and lower(ad.correo) = v_correo
  for update;

  if v_adoptante_id is null then
    insert into public.adoptante (
      id_refugio, nombre_completo, telefono, correo, direccion,
      tiene_otras_mascotas, espacio_techado, tiempo_solo_horas,
      acepta_politica_privacidad, tiene_ninos, experiencia_mascotas,
      declara_mayor_edad, fecha_aceptacion_privacidad
    ) values (
      v_animal.id_refugio, btrim(p_nombre_completo), btrim(p_telefono), v_correo, btrim(p_direccion),
      coalesce(p_tiene_otras_mascotas, false), coalesce(p_espacio_techado, false), p_tiempo_solo_horas,
      true, coalesce(p_tiene_ninos, false), nullif(btrim(coalesce(p_experiencia_mascotas, '')), ''),
      true, now()
    )
    returning id_adoptante into v_adoptante_id;
  else
    update public.adoptante
    set nombre_completo = btrim(p_nombre_completo),
        telefono = btrim(p_telefono),
        direccion = btrim(p_direccion),
        tiene_otras_mascotas = coalesce(p_tiene_otras_mascotas, false),
        espacio_techado = coalesce(p_espacio_techado, false),
        tiempo_solo_horas = p_tiempo_solo_horas,
        acepta_politica_privacidad = true,
        tiene_ninos = coalesce(p_tiene_ninos, false),
        experiencia_mascotas = nullif(btrim(coalesce(p_experiencia_mascotas, '')), ''),
        declara_mayor_edad = true,
        fecha_aceptacion_privacidad = coalesce(fecha_aceptacion_privacidad, now())
    where id_adoptante = v_adoptante_id;
  end if;

  if exists (
    select 1
    from public.solicitud_adopcion s
    where s.id_adoptante = v_adoptante_id
      and s.id_animal = p_id_animal
      and s.estado_solicitud in ('Recibida', 'En entrevista', 'En evaluación', 'Aprobada')
  ) then
    return jsonb_build_object('ok', false, 'code', 'SOLICITUD_DUPLICADA', 'message', 'Ya existe una solicitud activa para este animal.');
  end if;

  select count(*) into v_activas
  from public.solicitud_adopcion s
  where s.id_adoptante = v_adoptante_id
    and s.id_refugio = v_animal.id_refugio
    and s.estado_solicitud in ('Recibida', 'En entrevista', 'En evaluación', 'Aprobada');

  if v_activas >= 3 then
    return jsonb_build_object('ok', false, 'code', 'LIMITE_SOLICITUDES', 'message', 'Has alcanzado el límite de solicitudes activas en este refugio.');
  end if;

  insert into public.solicitud_adopcion (
    id_adoptante, id_animal, id_refugio, estado_solicitud,
    motivo_adopcion, comentarios_generales
  ) values (
    v_adoptante_id, p_id_animal, v_animal.id_refugio, 'Recibida',
    v_motivo, nullif(btrim(coalesce(p_comentarios_generales, '')), '')
  )
  returning * into v_solicitud;

  return jsonb_build_object(
    'ok', true,
    'data', jsonb_build_object(
      'id_solicitud', v_solicitud.id_solicitud,
      'estado_solicitud', v_solicitud.estado_solicitud,
      'fecha_solicitud', v_solicitud.fecha_solicitud,
      'codigo_seguimiento', v_solicitud.codigo_seguimiento,
      'mensaje', 'Tu solicitud fue recibida. El refugio se pondrá en contacto contigo.'
    )
  );
end;
$$;

revoke all on function public.registrar_solicitud_adopcion(
  integer, text, text, text, text, boolean, boolean, boolean, integer, text, text, text, boolean, boolean
) from public;
grant execute on function public.registrar_solicitud_adopcion(
  integer, text, text, text, text, boolean, boolean, boolean, integer, text, text, text, boolean, boolean
) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 12) RPC: cambio de estado de solicitud con reserva (US19)
-- ---------------------------------------------------------------------------

create or replace function public.cambiar_estado_solicitud_adopcion(
  p_id_solicitud integer,
  p_estado_solicitud text,
  p_motivo text,
  p_id_usuario integer
) returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_sol public.solicitud_adopcion%rowtype;
  v_animal public.animal%rowtype;
  v_estado text := btrim(coalesce(p_estado_solicitud, ''));
  v_motivo text := nullif(btrim(coalesce(p_motivo, '')), '');
  v_eval record;
  v_auditoria_id bigint;
  v_ok boolean;
begin
  select s.* into v_sol
  from public.solicitud_adopcion s
  where s.id_solicitud = p_id_solicitud
    and (public.current_user_is_superadmin() or s.id_refugio = public.current_refugio_id())
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'SOLICITUD_NO_ENCONTRADA', 'message', 'Solicitud no encontrada.');
  end if;

  if v_sol.estado_solicitud in ('Rechazada', 'Cancelada', 'Completada') then
    return jsonb_build_object('ok', false, 'code', 'SOLICITUD_YA_CERRADA', 'message', 'La solicitud ya está cerrada.');
  end if;

  if v_estado = v_sol.estado_solicitud then
    return jsonb_build_object('ok', false, 'code', 'TRANSICION_INVALIDA', 'message', 'La solicitud ya se encuentra en ese estado.');
  end if;

  -- Completar se realiza por RPC dedicada.
  if v_estado = 'Completada' then
    return jsonb_build_object('ok', false, 'code', 'TRANSICION_INVALIDA', 'message', 'Para completar la adopción usa la operación de cierre.');
  end if;

  if v_estado in ('Rechazada', 'Cancelada') then
    if v_motivo is null or char_length(v_motivo) < 10 or char_length(v_motivo) > 500 then
      return jsonb_build_object('ok', false, 'code', 'MOTIVO_REQUERIDO', 'message', 'Rechazar o cancelar exige un motivo de 10 a 500 caracteres.');
    end if;
  end if;

  v_ok := case
    when v_sol.estado_solicitud = 'Recibida' and v_estado in ('En entrevista', 'Rechazada', 'Cancelada') then true
    when v_sol.estado_solicitud = 'En entrevista' and v_estado in ('En evaluación', 'Rechazada', 'Cancelada') then true
    when v_sol.estado_solicitud = 'En evaluación' and v_estado in ('Aprobada', 'Rechazada', 'Cancelada') then true
    when v_sol.estado_solicitud = 'Aprobada' and v_estado = 'Cancelada' then true
    else false
  end;

  if not v_ok then
    return jsonb_build_object('ok', false, 'code', 'TRANSICION_INVALIDA', 'message', 'La transición de estado no es válida.');
  end if;

  -- Aprobación: reserva atómica.
  if v_estado = 'Aprobada' then
    select a.* into v_animal
    from public.animal a
    where a.id_animal = v_sol.id_animal
      and (public.current_user_is_superadmin() or a.id_refugio = public.current_refugio_id())
    for update;

    if not found then
      return jsonb_build_object('ok', false, 'code', 'ANIMAL_NO_DISPONIBLE', 'message', 'Animal no disponible.');
    end if;

    select e.resultado, e.fecha_evaluacion, e.id_evaluacion_adopcion
      into v_eval
    from public.evaluacion_adopcion e
    where e.id_solicitud = p_id_solicitud
    order by e.fecha_evaluacion desc, e.id_evaluacion_adopcion desc
    limit 1;

    if not found then
      return jsonb_build_object('ok', false, 'code', 'EVALUACION_REQUERIDA', 'message', 'Se requiere al menos una evaluación para aprobar.');
    end if;
    if v_eval.resultado <> 'Aprobado' then
      return jsonb_build_object('ok', false, 'code', 'ULTIMA_EVALUACION_NO_APROBADA', 'message', 'La última evaluación debe estar aprobada.');
    end if;

    if v_animal.reservado_adopcion then
      return jsonb_build_object('ok', false, 'code', 'ANIMAL_YA_RESERVADO', 'message', 'El animal ya tiene una reserva activa.');
    end if;
    if not v_animal.disponible_adopcion or v_animal.en_cuarentena or not v_animal.activo or v_animal.deleted_at is not null then
      return jsonb_build_object('ok', false, 'code', 'ANIMAL_NO_DISPONIBLE', 'message', 'El animal ya no está disponible para adopción.');
    end if;

    update public.animal
    set reservado_adopcion = true,
        fecha_reserva = now(),
        disponible_adopcion = false
    where id_animal = v_sol.id_animal;

    update public.perfil_adopcion
    set publicado = false,
        fecha_despublicacion = coalesce(fecha_despublicacion, now()),
        updated_at = now()
    where id_animal = v_sol.id_animal;

    update public.solicitud_adopcion
    set estado_solicitud = 'Aprobada',
        fecha_cierre = null,
        motivo_rechazo = null
    where id_solicitud = p_id_solicitud;

    -- Rechazo automático de competidoras activas.
    update public.solicitud_adopcion
    set estado_solicitud = 'Rechazada',
        motivo_rechazo = 'El paciente fue reservado por otra solicitud aprobada.',
        fecha_cierre = now()
    where id_animal = v_sol.id_animal
      and id_solicitud <> p_id_solicitud
      and estado_solicitud in ('Recibida', 'En entrevista', 'En evaluación');

    insert into public.auditoria (
      id_usuario, id_refugio, accion, modulo, entidad_id, descripcion
    ) values (
      p_id_usuario, v_sol.id_refugio, 'aprobar_solicitud_adopcion', 'adoptions',
      p_id_solicitud, 'Solicitud aprobada y animal reservado.'
    ) returning id_auditoria into v_auditoria_id;

    return jsonb_build_object(
      'ok', true,
      'data', jsonb_build_object(
        'id_solicitud', p_id_solicitud,
        'estado_solicitud', 'Aprobada',
        'fecha_cierre', null,
        'motivo_rechazo', null,
        'reserva', jsonb_build_object('id_animal', v_sol.id_animal, 'reservado_adopcion', true),
        'auditoria_id', v_auditoria_id
      )
    );
  end if;

  -- Cancelar una solicitud aprobada libera la reserva (animal queda no disponible).
  if v_sol.estado_solicitud = 'Aprobada' and v_estado = 'Cancelada' then
    update public.animal
    set reservado_adopcion = false,
        fecha_reserva = null,
        disponible_adopcion = false
    where id_animal = v_sol.id_animal;
  end if;

  update public.solicitud_adopcion
  set estado_solicitud = v_estado,
      motivo_rechazo = case when v_estado in ('Rechazada', 'Cancelada') then v_motivo else null end,
      fecha_cierre = case when v_estado in ('Rechazada', 'Cancelada') then now() else fecha_cierre end
  where id_solicitud = p_id_solicitud;

  insert into public.auditoria (
    id_usuario, id_refugio, accion, modulo, entidad_id, descripcion
  ) values (
    p_id_usuario, v_sol.id_refugio, 'cambiar_estado_solicitud_adopcion', 'adoptions',
    p_id_solicitud, 'Estado de solicitud cambiado a ' || v_estado || '.'
  ) returning id_auditoria into v_auditoria_id;

  return jsonb_build_object(
    'ok', true,
    'data', jsonb_build_object(
      'id_solicitud', p_id_solicitud,
      'estado_solicitud', v_estado,
      'fecha_cierre', (select fecha_cierre from public.solicitud_adopcion where id_solicitud = p_id_solicitud),
      'motivo_rechazo', (select motivo_rechazo from public.solicitud_adopcion where id_solicitud = p_id_solicitud),
      'reserva', jsonb_build_object(
        'id_animal', v_sol.id_animal,
        'reservado_adopcion', coalesce((select reservado_adopcion from public.animal where id_animal = v_sol.id_animal), false)
      ),
      'auditoria_id', v_auditoria_id
    )
  );
end;
$$;

revoke all on function public.cambiar_estado_solicitud_adopcion(integer, text, text, integer) from public, anon;
grant execute on function public.cambiar_estado_solicitud_adopcion(integer, text, text, integer) to authenticated;

-- ---------------------------------------------------------------------------
-- 13) RPC: completar adopción (US19)
-- ---------------------------------------------------------------------------

create or replace function public.completar_adopcion(
  p_id_solicitud integer,
  p_fecha_adopcion date,
  p_observaciones text,
  p_id_usuario integer
) returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_sol public.solicitud_adopcion%rowtype;
  v_animal public.animal%rowtype;
  v_auditoria_id bigint;
begin
  if p_fecha_adopcion is null then
    return jsonb_build_object('ok', false, 'code', 'DATOS_INVALIDOS', 'message', 'La fecha de adopción es obligatoria.');
  end if;
  if p_fecha_adopcion > current_date then
    return jsonb_build_object('ok', false, 'code', 'FECHA_FUTURA', 'message', 'La fecha de adopción no puede ser futura.');
  end if;

  select s.* into v_sol
  from public.solicitud_adopcion s
  where s.id_solicitud = p_id_solicitud
    and (public.current_user_is_superadmin() or s.id_refugio = public.current_refugio_id())
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'SOLICITUD_NO_ENCONTRADA', 'message', 'Solicitud no encontrada.');
  end if;

  if v_sol.estado_solicitud = 'Completada' then
    return jsonb_build_object('ok', false, 'code', 'ADOPCION_YA_COMPLETADA', 'message', 'La adopción ya fue completada.');
  end if;
  if v_sol.estado_solicitud <> 'Aprobada' then
    return jsonb_build_object('ok', false, 'code', 'SOLICITUD_NO_APROBADA', 'message', 'Solo una solicitud aprobada puede completarse.');
  end if;

  select a.* into v_animal
  from public.animal a
  where a.id_animal = v_sol.id_animal
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'ANIMAL_NO_DISPONIBLE', 'message', 'Animal no encontrado.');
  end if;

  update public.solicitud_adopcion
  set estado_solicitud = 'Completada',
      fecha_cierre = now(),
      id_usuario_cierre = p_id_usuario,
      comentarios_generales = coalesce(nullif(btrim(p_observaciones), ''), comentarios_generales)
  where id_solicitud = p_id_solicitud;

  update public.animal
  set activo = false,
      disponible_adopcion = false,
      reservado_adopcion = false,
      fecha_reserva = null,
      fecha_adopcion = p_fecha_adopcion
  where id_animal = v_sol.id_animal;

  update public.perfil_adopcion
  set publicado = false,
      fecha_despublicacion = coalesce(fecha_despublicacion, now()),
      updated_at = now()
  where id_animal = v_sol.id_animal;

  insert into public.auditoria (
    id_usuario, id_refugio, accion, modulo, entidad_id, descripcion
  ) values (
    p_id_usuario, v_sol.id_refugio, 'completar_adopcion', 'adoptions',
    p_id_solicitud, 'Adopción completada.'
  ) returning id_auditoria into v_auditoria_id;

  return jsonb_build_object(
    'ok', true,
    'data', jsonb_build_object(
      'id_solicitud', p_id_solicitud,
      'estado_solicitud', 'Completada',
      'fecha_cierre', (select fecha_cierre from public.solicitud_adopcion where id_solicitud = p_id_solicitud),
      'fecha_adopcion', p_fecha_adopcion,
      'animal', jsonb_build_object(
        'id_animal', v_sol.id_animal,
        'activo', false,
        'disponible_adopcion', false,
        'reservado_adopcion', false,
        'fecha_adopcion', p_fecha_adopcion
      ),
      'auditoria_id', v_auditoria_id
    )
  );
end;
$$;

revoke all on function public.completar_adopcion(integer, date, text, integer) from public, anon;
grant execute on function public.completar_adopcion(integer, date, text, integer) to authenticated;

notify pgrst, 'reload schema';

commit;
