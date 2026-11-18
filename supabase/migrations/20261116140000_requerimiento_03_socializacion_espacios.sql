-- Requerimiento 03 — Socialización y Espacios (RF3.1, RF3.2, RF3.3, RF3.4).
--
-- Normaliza los tipos de espacio, completa el aislamiento multitenant de
-- `traslado` y `evaluacion_temperamento`, crea la bitácora de rehabilitación y
-- define las RPC transaccionales de traslado y evaluación de temperamento.
--
-- Idempotente: puede ejecutarse más de una vez sin duplicar objetos.

begin;

-- ---------------------------------------------------------------------------
-- 1) Espacios: tipos canónicos y nombre único por refugio
-- ---------------------------------------------------------------------------

update public.espacio
set tipo = case lower(coalesce(tipo, 'otro'))
    when 'canil' then 'canil'
    when 'gatera' then 'gatera'
    when 'cuarentena' then 'cuarentena'
    when 'rehabilitacion' then 'rehabilitacion'
    when 'rehabilitación' then 'rehabilitacion'
    when 'otro' then 'otro'
    else 'otro'
end
where tipo is distinct from case lower(coalesce(tipo, 'otro'))
    when 'canil' then 'canil'
    when 'gatera' then 'gatera'
    when 'cuarentena' then 'cuarentena'
    when 'rehabilitacion' then 'rehabilitacion'
    when 'rehabilitación' then 'rehabilitacion'
    when 'otro' then 'otro'
    else 'otro'
end;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'espacio_tipo_check') then
    alter table public.espacio
      add constraint espacio_tipo_check
      check (tipo in ('canil', 'gatera', 'cuarentena', 'rehabilitacion', 'otro'));
  end if;
end $$;

do $$
begin
  -- Solo se crea el índice único si no hay duplicados legacy.
  if not exists (select 1 from pg_indexes where indexname = 'espacio_refugio_nombre_uidx')
     and not exists (
       select 1
       from public.espacio
       group by id_refugio, lower(nombre_espacio)
       having count(*) > 1
     )
  then
    create unique index espacio_refugio_nombre_uidx
      on public.espacio (id_refugio, lower(nombre_espacio));
  end if;
end $$;

create index if not exists espacio_refugio_tipo_idx
  on public.espacio (id_refugio, tipo);

-- ---------------------------------------------------------------------------
-- 2) Traslado: tenant, trazabilidad y RLS
-- ---------------------------------------------------------------------------

alter table public.traslado
  add column if not exists id_refugio integer references public.refugio(id_refugio) on delete cascade,
  add column if not exists id_usuario integer references public.usuario(id_usuario);

update public.traslado t
set id_refugio = a.id_refugio
from public.animal a
where t.id_animal = a.id_animal and t.id_refugio is null;

create index if not exists traslado_refugio_animal_fecha_idx
  on public.traslado (id_refugio, id_animal, fecha_traslado desc);

alter table public.traslado enable row level security;
revoke all on public.traslado from anon;

drop policy if exists traslado_tenant on public.traslado;
create policy traslado_tenant on public.traslado
  for all to authenticated
  using (public.current_user_is_superadmin() or id_refugio = public.current_refugio_id())
  with check (public.current_user_is_superadmin() or id_refugio = public.current_refugio_id());

-- ---------------------------------------------------------------------------
-- 3) Evaluación de temperamento: tenant, enums y RLS
-- ---------------------------------------------------------------------------

alter table public.evaluacion_temperamento
  add column if not exists id_refugio integer references public.refugio(id_refugio) on delete cascade;

update public.evaluacion_temperamento e
set id_refugio = a.id_refugio
from public.animal a
where e.id_animal = a.id_animal and e.id_refugio is null;

-- Las restricciones legacy usaban 'Bajo/Medio/Alto' y 'Sí/No/En evaluación'.
-- Se mapearán a los valores de la especificación y se reemplazan por checks
-- que toleran NULL en filas históricas (las nuevas inserciones siempre traen
-- todos los campos validados por Zod).
alter table public.evaluacion_temperamento drop constraint if exists chk_temp_energia;
alter table public.evaluacion_temperamento drop constraint if exists chk_temp_gatos;
alter table public.evaluacion_temperamento drop constraint if exists chk_temp_ninos;
alter table public.evaluacion_temperamento drop constraint if exists chk_temp_perros;

update public.evaluacion_temperamento
set nivel_energia = case
    when nivel_energia is null then null
    when lower(nivel_energia) in ('bajo', 'baja') then 'Baja'
    when lower(nivel_energia) in ('medio', 'media') then 'Media'
    when lower(nivel_energia) in ('alto', 'alta') then 'Alta'
    else nivel_energia
end,
apto_perros = case
    when apto_perros is null then null
    when lower(apto_perros) like 's%' then 'si'
    when lower(apto_perros) = 'no' then 'no'
    when lower(apto_perros) like 'en evaluaci%' then 'con_supervision'
    else apto_perros
end,
apto_gatos = case
    when apto_gatos is null then null
    when lower(apto_gatos) like 's%' then 'si'
    when lower(apto_gatos) = 'no' then 'no'
    when lower(apto_gatos) like 'en evaluaci%' then 'con_supervision'
    else apto_gatos
end,
apto_ninos = case
    when apto_ninos is null then null
    when lower(apto_ninos) like 's%' then 'si'
    when lower(apto_ninos) = 'no' then 'no'
    when lower(apto_ninos) like 'en evaluaci%' then 'con_supervision'
    else apto_ninos
end,
comportamiento = case
    when comportamiento is null then null
    when lower(comportamiento) = 'docil' then 'Dócil'
    when lower(comportamiento) = 'sociable' then 'Sociable'
    when lower(comportamiento) in ('timido', 'tímido') then 'Tímido'
    when lower(comportamiento) = 'miedoso' then 'Miedoso'
    when lower(comportamiento) = 'reactivo' then 'Reactivo'
    when lower(comportamiento) = 'agresivo' then 'Agresivo'
    else comportamiento
end;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'evaluacion_temperamento_energia_check') then
    alter table public.evaluacion_temperamento
      add constraint evaluacion_temperamento_energia_check
      check (nivel_energia is null or nivel_energia in ('Baja', 'Media', 'Alta'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'evaluacion_temperamento_compatibilidad_check') then
    alter table public.evaluacion_temperamento
      add constraint evaluacion_temperamento_compatibilidad_check
      check (
        (apto_perros is null or apto_perros in ('si', 'no', 'con_supervision')) and
        (apto_gatos is null or apto_gatos in ('si', 'no', 'con_supervision')) and
        (apto_ninos is null or apto_ninos in ('si', 'no', 'con_supervision'))
      );
  end if;
end $$;

create index if not exists evaluacion_temperamento_refugio_animal_fecha_idx
  on public.evaluacion_temperamento (id_refugio, id_animal, fecha_evaluacion desc);

alter table public.evaluacion_temperamento enable row level security;
revoke all on public.evaluacion_temperamento from anon;

drop policy if exists evaluacion_temperamento_tenant on public.evaluacion_temperamento;
create policy evaluacion_temperamento_tenant on public.evaluacion_temperamento
  for all to authenticated
  using (public.current_user_is_superadmin() or id_refugio = public.current_refugio_id())
  with check (public.current_user_is_superadmin() or id_refugio = public.current_refugio_id());

-- ---------------------------------------------------------------------------
-- 4) Bitácora de rehabilitación (US14)
-- ---------------------------------------------------------------------------

create table if not exists public.rehabilitacion (
  id_rehabilitacion bigserial primary key,
  id_animal integer not null references public.animal(id_animal) on delete cascade,
  id_refugio integer not null references public.refugio(id_refugio) on delete cascade,
  tipo text not null check (tipo in ('fisica', 'emocional', 'conductual')),
  fecha_inicio date not null,
  fecha_fin date,
  objetivo text not null check (char_length(btrim(objetivo)) between 1 and 500),
  observaciones text,
  id_usuario integer not null references public.usuario(id_usuario),
  fecha_registro timestamptz not null default now(),
  constraint rehabilitacion_fechas_check
    check (fecha_fin is null or fecha_fin >= fecha_inicio)
);

create index if not exists rehabilitacion_refugio_animal_fecha_idx
  on public.rehabilitacion (id_refugio, id_animal, fecha_inicio desc);

alter table public.rehabilitacion enable row level security;
revoke all on public.rehabilitacion from anon;

drop policy if exists rehabilitacion_tenant on public.rehabilitacion;
create policy rehabilitacion_tenant on public.rehabilitacion
  for all to authenticated
  using (public.current_user_is_superadmin() or id_refugio = public.current_refugio_id())
  with check (public.current_user_is_superadmin() or id_refugio = public.current_refugio_id());

-- ---------------------------------------------------------------------------
-- 5) RPC de traslado (RF3.1 / RF3.2)
--    Bloquea el animal y el espacio destino, valida cuarentena, origen,
--    disponibilidad y capacidad, y persiste todo en una sola transacción.
-- ---------------------------------------------------------------------------

create or replace function public.registrar_traslado(
  p_id_animal integer,
  p_id_espacio_destino integer,
  p_motivo text,
  p_alta_observaciones text,
  p_alta_fecha timestamptz,
  p_id_usuario integer
) returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_animal public.animal%rowtype;
  v_destino public.espacio%rowtype;
  v_ocupacion integer;
  v_id_traslado bigint;
  v_fecha_traslado timestamptz;
  v_id_alta bigint;
  v_fecha_alta timestamptz;
  v_alta jsonb := null;
begin
  select a.* into v_animal
  from public.animal a
  where a.id_animal = p_id_animal
    and a.deleted_at is null
    and a.activo
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'ANIMAL_NO_ENCONTRADO',
      'message', 'Animal no encontrado.');
  end if;

  if p_id_espacio_destino = v_animal.id_espacio then
    return jsonb_build_object('ok', false, 'code', 'TRASLADO_MISMO_ESPACIO',
      'message', 'El destino debe ser distinto del espacio actual.');
  end if;

  select e.* into v_destino
  from public.espacio e
  where e.id_espacio = p_id_espacio_destino
    and e.id_refugio = v_animal.id_refugio
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'ESPACIO_NO_ENCONTRADO',
      'message', 'El espacio destino no existe en este refugio.');
  end if;

  if not v_destino.disponible then
    return jsonb_build_object('ok', false, 'code', 'ESPACIO_INACTIVO',
      'message', 'El espacio destino no está disponible.');
  end if;

  select count(*)::integer into v_ocupacion
  from public.animal a
  where a.id_espacio = p_id_espacio_destino
    and a.deleted_at is null
    and a.activo;

  if v_ocupacion >= v_destino.capacidad then
    return jsonb_build_object('ok', false, 'code', 'CAPACIDAD_EXCEDIDA',
      'message', 'El espacio destino no tiene cupo disponible.');
  end if;

  if v_animal.en_cuarentena then
    if coalesce(lower(v_destino.tipo), 'otro') <> 'cuarentena' then
      if p_alta_observaciones is null or btrim(p_alta_observaciones) = '' then
        return jsonb_build_object('ok', false, 'code', 'ANIMAL_EN_CUARENTENA',
          'message', 'Registra el alta médica antes de trasladar a un área general.');
      end if;

      update public.animal
      set en_cuarentena = false
      where id_animal = p_id_animal and en_cuarentena = true;

      if not found then
        return jsonb_build_object('ok', false, 'code', 'CUARENTENA_YA_LIBERADA',
          'message', 'La cuarentena del paciente ya fue liberada.');
      end if;

      insert into public.altas_cuarentena (
        id_animal, id_refugio, observaciones, id_usuario_veterinario, fecha_alta
      ) values (
        p_id_animal, v_animal.id_refugio, btrim(p_alta_observaciones),
        p_id_usuario, coalesce(p_alta_fecha, now())
      )
      returning id_alta, fecha_alta into v_id_alta, v_fecha_alta;

      v_alta := jsonb_build_object(
        'id_alta', v_id_alta,
        'observaciones', btrim(p_alta_observaciones),
        'id_usuario_veterinario', p_id_usuario,
        'fecha_alta', v_fecha_alta
      );
    end if;
  elsif p_alta_observaciones is not null and btrim(p_alta_observaciones) <> '' then
    return jsonb_build_object('ok', false, 'code', 'CUARENTENA_YA_LIBERADA',
      'message', 'El paciente ya no está en cuarentena.');
  end if;

  update public.animal
  set id_espacio = p_id_espacio_destino
  where id_animal = p_id_animal and id_espacio = v_animal.id_espacio;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'TRASLADO_ORIGEN_DESACTUALIZADO',
      'message', 'La ubicación del paciente cambió. Recarga la ficha e inténtalo de nuevo.');
  end if;

  insert into public.traslado (
    id_animal, id_espacio_origen, id_espacio_destino,
    id_refugio, id_usuario, motivo, fecha_traslado
  ) values (
    p_id_animal, v_animal.id_espacio, p_id_espacio_destino,
    v_animal.id_refugio, p_id_usuario, p_motivo, now()
  )
  returning id_traslado, fecha_traslado into v_id_traslado, v_fecha_traslado;

  return jsonb_build_object('ok', true, 'data', jsonb_build_object(
    'id_traslado', v_id_traslado,
    'id_animal', p_id_animal,
    'id_refugio', v_animal.id_refugio,
    'id_espacio_origen', v_animal.id_espacio,
    'id_espacio_destino', p_id_espacio_destino,
    'fecha_traslado', v_fecha_traslado,
    'motivo', p_motivo,
    'id_usuario', p_id_usuario,
    'ocupacion_destino', v_ocupacion + 1,
    'en_cuarentena', v_animal.en_cuarentena and coalesce(lower(v_destino.tipo), 'otro') = 'cuarentena',
    'alta', v_alta
  ));
end;
$$;

-- ---------------------------------------------------------------------------
-- 6) RPC de evaluación de temperamento (RF3.3)
--    Inserta la evaluación y actualiza el temperamento vigente del expediente
--    en la misma transacción.
-- ---------------------------------------------------------------------------

create or replace function public.registrar_evaluacion_temperamento(
  p_id_animal integer,
  p_comportamiento text,
  p_nivel_energia text,
  p_apto_perros text,
  p_apto_gatos text,
  p_apto_ninos text,
  p_fecha_evaluacion timestamptz,
  p_id_usuario integer
) returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id_refugio integer;
  v_id_evaluacion bigint;
  v_fecha timestamptz;
  v_comportamiento_vigente text;
begin
  select a.id_refugio into v_id_refugio
  from public.animal a
  where a.id_animal = p_id_animal and a.deleted_at is null;

  if v_id_refugio is null then
    return jsonb_build_object('ok', false, 'code', 'ANIMAL_NO_ENCONTRADO',
      'message', 'Animal no encontrado.');
  end if;

  insert into public.evaluacion_temperamento (
    id_animal, id_refugio, id_usuario, comportamiento, nivel_energia,
    apto_perros, apto_gatos, apto_ninos, fecha_evaluacion
  ) values (
    p_id_animal, v_id_refugio, p_id_usuario, p_comportamiento, p_nivel_energia,
    p_apto_perros, p_apto_gatos, p_apto_ninos,
    coalesce(p_fecha_evaluacion, now())
  )
  returning id_evaluacion_temperamento, fecha_evaluacion
    into v_id_evaluacion, v_fecha;

  select e.comportamiento into v_comportamiento_vigente
  from public.evaluacion_temperamento e
  where e.id_animal = p_id_animal
  order by e.fecha_evaluacion desc, e.id_evaluacion_temperamento desc
  limit 1;

  if v_comportamiento_vigente is not null then
    update public.animal set temperamento = v_comportamiento_vigente
    where id_animal = p_id_animal;
  end if;

  return jsonb_build_object('ok', true, 'data', jsonb_build_object(
    'id_evaluacion', v_id_evaluacion,
    'id_animal', p_id_animal,
    'id_refugio', v_id_refugio,
    'comportamiento', p_comportamiento,
    'nivel_energia', p_nivel_energia,
    'apto_perros', p_apto_perros,
    'apto_gatos', p_apto_gatos,
    'apto_ninos', p_apto_ninos,
    'id_usuario', p_id_usuario,
    'fecha_evaluacion', v_fecha,
    'temperamento_vigente', v_comportamiento_vigente
  ));
end;
$$;

revoke all on function public.registrar_traslado(
  integer, integer, text, text, timestamptz, integer
) from public, anon;
grant execute on function public.registrar_traslado(
  integer, integer, text, text, timestamptz, integer
) to authenticated;

revoke all on function public.registrar_evaluacion_temperamento(
  integer, text, text, text, text, text, timestamptz, integer
) from public, anon;
grant execute on function public.registrar_evaluacion_temperamento(
  integer, text, text, text, text, text, timestamptz, integer
) to authenticated;

commit;
