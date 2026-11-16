-- Requerimiento 02: Control Clínico y Cuarentena (RF2.1, RF2.4)
-- Crea tablas de chequeos médicos y altas de cuarentena.
-- Migra vacunacion -> evento_sanitario para compatibilidad futura (US10 diferida por dependencia de inventario).
-- Nota: no se crean tablas de inventario ni RPC de descuento en esta entrega (1B).

begin;

-- 1) Chequeos médicos
create table if not exists public.chequeos_medicos (
  id_chequeo bigserial primary key,
  id_animal integer not null references public.animal(id_animal) on delete cascade,
  id_refugio integer not null references public.refugio(id_refugio) on delete cascade,
  peso_kg numeric(6,2) not null check (peso_kg > 0 and peso_kg <= 200),
  temperatura_c numeric(4,1) not null check (temperatura_c >= 30.0 and temperatura_c <= 45.0),
  frecuencia_cardiaca integer not null check (frecuencia_cardiaca >= 20 and frecuencia_cardiaca <= 300),
  frecuencia_respiratoria integer not null check (frecuencia_respiratoria >= 5 and frecuencia_respiratoria <= 150),
  sintoma_otro_detalle text,
  observaciones text,
  id_usuario integer not null references public.usuario(id_usuario),
  fecha_chequeo timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists chequeos_medicos_refugio_animal_fecha_idx
  on public.chequeos_medicos (id_refugio, id_animal, fecha_chequeo desc);

-- 2) Síntomas de chequeo (checklist normalizada)
create table if not exists public.chequeo_sintomas (
  id_chequeo bigint not null references public.chequeos_medicos(id_chequeo) on delete cascade,
  sintoma text not null check (sintoma in ('vomito','diarrea','letargia','secrecion_nasal_ocular','tos','otro')),
  primary key (id_chequeo, sintoma)
);

-- 3) Altas de cuarentena
create table if not exists public.altas_cuarentena (
  id_alta bigserial primary key,
  id_animal integer not null references public.animal(id_animal) on delete cascade,
  id_refugio integer not null references public.refugio(id_refugio) on delete cascade,
  observaciones text not null,
  id_usuario_veterinario integer not null references public.usuario(id_usuario),
  fecha_alta timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists altas_cuarentena_refugio_animal_fecha_idx
  on public.altas_cuarentena (id_refugio, id_animal, fecha_alta desc);

-- 4) Migración vacunacion -> evento_sanitario (compatibilidad, sin descuento de inventario)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'vacunacion'
  ) and not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'evento_sanitario'
  ) then
    alter table public.vacunacion rename to evento_sanitario;
  end if;
end $$;

-- Renombrar PK/columnas si vienen del esquema legacy
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='evento_sanitario' and column_name='id_vacunacion'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='evento_sanitario' and column_name='id_evento'
  ) then
    alter table public.evento_sanitario rename column id_vacunacion to id_evento;
  end if;
end $$;

alter table public.evento_sanitario
  add column if not exists id_refugio integer references public.refugio(id_refugio),
  add column if not exists tipo_evento text not null default 'vacunacion',
  add column if not exists id_lote_inventario integer,
  add column if not exists cantidad integer not null default 1,
  add column if not exists marca_lote text,
  add column if not exists id_usuario integer references public.usuario(id_usuario),
  add column if not exists fecha_registro timestamptz not null default now();

-- Backfill id_refugio desde animal cuando sea posible
update public.evento_sanitario es
set id_refugio = a.id_refugio
from public.animal a
where es.id_animal = a.id_animal and es.id_refugio is null;

-- Constraint de tipo_evento (idempotente)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'evento_sanitario_tipo_evento_check') then
    alter table public.evento_sanitario
      add constraint evento_sanitario_tipo_evento_check
      check (tipo_evento in ('vacunacion','desparasitacion'));
  end if;
end $$;

create index if not exists evento_sanitario_refugio_animal_fecha_idx
  on public.evento_sanitario (id_refugio, id_animal, fecha_aplicacion desc);

-- RLS (segunda capa de defensa). El acceso se limita al refugio del usuario
-- autenticado; el superadmin conserva acceso global.
--
-- Las funciones son SECURITY DEFINER para leer `usuario` sin quedar sujetas a
-- su propio RLS y evitar recursión. Se definen aquí (no se reutilizan las de
-- campañas) para que esta migración sea autosuficiente.
create or replace function public.current_refugio_id()
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

create or replace function public.current_user_is_superadmin()
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

revoke all on function public.current_refugio_id() from public, anon;
revoke all on function public.current_user_is_superadmin() from public, anon;
grant execute on function public.current_refugio_id() to authenticated;
grant execute on function public.current_user_is_superadmin() to authenticated;

alter table public.chequeos_medicos enable row level security;
alter table public.chequeo_sintomas enable row level security;
alter table public.altas_cuarentena enable row level security;

revoke all on public.chequeos_medicos from anon;
revoke all on public.chequeo_sintomas from anon;
revoke all on public.altas_cuarentena from anon;

drop policy if exists chequeos_medicos_tenant_select on public.chequeos_medicos;
drop policy if exists chequeos_medicos_tenant_write on public.chequeos_medicos;
drop policy if exists chequeos_medicos_tenant on public.chequeos_medicos;
create policy chequeos_medicos_tenant on public.chequeos_medicos
  for all to authenticated
  using (
    public.current_user_is_superadmin()
    or id_refugio = public.current_refugio_id()
  )
  with check (
    public.current_user_is_superadmin()
    or id_refugio = public.current_refugio_id()
  );

drop policy if exists chequeo_sintomas_all on public.chequeo_sintomas;
drop policy if exists chequeo_sintomas_tenant on public.chequeo_sintomas;
create policy chequeo_sintomas_tenant on public.chequeo_sintomas
  for all to authenticated
  using (
    exists (
      select 1
      from public.chequeos_medicos c
      where c.id_chequeo = chequeo_sintomas.id_chequeo
        and (
          public.current_user_is_superadmin()
          or c.id_refugio = public.current_refugio_id()
        )
    )
  )
  with check (
    exists (
      select 1
      from public.chequeos_medicos c
      where c.id_chequeo = chequeo_sintomas.id_chequeo
        and (
          public.current_user_is_superadmin()
          or c.id_refugio = public.current_refugio_id()
        )
    )
  );

drop policy if exists altas_cuarentena_tenant_select on public.altas_cuarentena;
drop policy if exists altas_cuarentena_tenant_write on public.altas_cuarentena;
drop policy if exists altas_cuarentena_tenant on public.altas_cuarentena;
create policy altas_cuarentena_tenant on public.altas_cuarentena
  for all to authenticated
  using (
    public.current_user_is_superadmin()
    or id_refugio = public.current_refugio_id()
  )
  with check (
    public.current_user_is_superadmin()
    or id_refugio = public.current_refugio_id()
  );

commit;
