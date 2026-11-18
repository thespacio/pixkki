-- Requerimiento 04 — Control poblacional (RF4.1 US15, RF4.2 US16).
--
-- Completa el aislamiento multitenant de `cirugia_reproductiva`, crea la
-- relación cirugía-insumo y la bitácora de excepciones de aptitud, amplía el
-- catálogo de insumos con `insumo_quirurgico` y define:
--
--   * `evaluar_aptitud_adopcion`   -> criterios del gatekeeper (solo lectura).
--   * `registrar_cirugia_reproductiva` -> cirugía + consumo de stock atómico.
--   * `publicar_adopcion`          -> publicación/despublicación con excepción
--                                     administrativa motivada y auditada.
--
-- Idempotente: puede ejecutarse más de una vez sin duplicar objetos.

begin;

-- ---------------------------------------------------------------------------
-- 1) Rol administrador del refugio (defensa en la base, no solo en el service)
-- ---------------------------------------------------------------------------

create or replace function public.current_user_is_admin()
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
      and lower(r.nombre_rol) = 'administrador'
  );
$$;

revoke all on function public.current_user_is_admin() from public, anon;
grant execute on function public.current_user_is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- 2) Inventario: tipo de insumo quirúrgico
-- ---------------------------------------------------------------------------

do $$
declare
  v_constraint text;
begin
  for v_constraint in
    select c.conname
    from pg_constraint c
    where c.conrelid = 'public.inventario_insumo'::regclass
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%tipo_insumo%'
  loop
    execute format('alter table public.inventario_insumo drop constraint %I', v_constraint);
  end loop;

  alter table public.inventario_insumo
    add constraint inventario_insumo_tipo_insumo_check
    check (tipo_insumo in ('vacuna', 'desparasitante', 'insumo_quirurgico', 'otro'));
end $$;

-- ---------------------------------------------------------------------------
-- 3) Cirugía reproductiva: tenant, índice e idempotencia
-- ---------------------------------------------------------------------------

alter table public.cirugia_reproductiva
  add column if not exists id_refugio integer references public.refugio(id_refugio) on delete cascade;

update public.cirugia_reproductiva c
set id_refugio = a.id_refugio
from public.animal a
where c.id_animal = a.id_animal
  and c.id_refugio is null;

do $$
begin
  if exists (
    select 1
    from public.cirugia_reproductiva
    where id_refugio is null
  ) then
    raise exception
      'Requerimiento 04: existen cirugías sin id_refugio resoluble desde animal. Corrige los datos antes de aplicar la migración.';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'cirugia_reproductiva'
      and column_name = 'id_refugio'
      and is_nullable = 'YES'
  ) then
    alter table public.cirugia_reproductiva
      alter column id_refugio set not null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'cirugia_reproductiva_id_refugio_fkey'
  ) then
    alter table public.cirugia_reproductiva
      add constraint cirugia_reproductiva_id_refugio_fkey
      foreign key (id_refugio) references public.refugio(id_refugio) on delete cascade;
  end if;
end $$;

create index if not exists cirugia_reproductiva_refugio_animal_fecha_idx
  on public.cirugia_reproductiva (id_refugio, id_animal, fecha_cirugia desc);

-- Idempotencia (S9): un mismo acto no puede registrarse dos veces.
create unique index if not exists cirugia_reproductiva_idempotencia_uidx
  on public.cirugia_reproductiva (id_animal, tipo_cirugia, fecha_cirugia);

alter table public.cirugia_reproductiva enable row level security;
revoke all on public.cirugia_reproductiva from anon;

drop policy if exists cirugia_reproductiva_tenant on public.cirugia_reproductiva;
create policy cirugia_reproductiva_tenant on public.cirugia_reproductiva
  for all to authenticated
  using (public.current_user_is_superadmin() or id_refugio = public.current_refugio_id())
  with check (public.current_user_is_superadmin() or id_refugio = public.current_refugio_id());

-- ---------------------------------------------------------------------------
-- 4) Insumos consumidos por cirugía
-- ---------------------------------------------------------------------------

create table if not exists public.cirugia_insumo (
  id_cirugia_insumo bigserial primary key,
  id_cirugia integer not null references public.cirugia_reproductiva(id_cirugia) on delete cascade,
  id_lote_inventario bigint not null references public.inventario_lote(id_lote_inventario) on delete restrict,
  id_refugio integer not null references public.refugio(id_refugio) on delete cascade,
  cantidad integer not null check (cantidad > 0),
  created_at timestamptz not null default now(),
  constraint cirugia_insumo_lote_unico unique (id_cirugia, id_lote_inventario)
);

create index if not exists cirugia_insumo_refugio_cirugia_idx
  on public.cirugia_insumo (id_refugio, id_cirugia);

alter table public.cirugia_insumo enable row level security;
revoke all on public.cirugia_insumo from anon;

drop policy if exists cirugia_insumo_tenant on public.cirugia_insumo;
create policy cirugia_insumo_tenant on public.cirugia_insumo
  for all to authenticated
  using (public.current_user_is_superadmin() or id_refugio = public.current_refugio_id())
  with check (public.current_user_is_superadmin() or id_refugio = public.current_refugio_id());

-- ---------------------------------------------------------------------------
-- 5) Excepciones de aptitud para adopción
-- ---------------------------------------------------------------------------

create table if not exists public.excepcion_aptitud_adopcion (
  id_excepcion bigserial primary key,
  id_animal integer not null references public.animal(id_animal) on delete cascade,
  id_refugio integer not null references public.refugio(id_refugio) on delete cascade,
  id_usuario integer not null references public.usuario(id_usuario),
  motivo text not null check (char_length(btrim(motivo)) between 20 and 1000),
  criterios_omitidos text[] not null default '{}',
  fecha_excepcion timestamptz not null default now(),
  revocada boolean not null default false,
  fecha_revocacion timestamptz
);

create index if not exists excepcion_aptitud_refugio_animal_idx
  on public.excepcion_aptitud_adopcion (id_refugio, id_animal, fecha_excepcion desc);

-- Una sola excepción vigente por animal.
create unique index if not exists excepcion_aptitud_vigente_uidx
  on public.excepcion_aptitud_adopcion (id_animal)
  where not revocada;

alter table public.excepcion_aptitud_adopcion enable row level security;
revoke all on public.excepcion_aptitud_adopcion from anon;

drop policy if exists excepcion_aptitud_adopcion_tenant on public.excepcion_aptitud_adopcion;
create policy excepcion_aptitud_adopcion_tenant on public.excepcion_aptitud_adopcion
  for all to authenticated
  using (public.current_user_is_superadmin() or id_refugio = public.current_refugio_id())
  with check (public.current_user_is_superadmin() or id_refugio = public.current_refugio_id());

-- ---------------------------------------------------------------------------
-- 6) Helper: evaluación de aptitud para adopción (US16)
--    Solo lectura. No cambia el expediente. Devuelve el envelope habitual.
-- ---------------------------------------------------------------------------

create or replace function public.evaluar_aptitud_adopcion(p_id_animal integer)
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_animal public.animal%rowtype;
  v_dx text;
  v_temp text;
  v_rehab_inicio date;
  v_excepcion jsonb := null;
  v_criterios jsonb := '[]'::jsonb;
  v_bloqueos text[] := '{}';
  v_no_omitibles text[] := '{}';
  v_advertencias text[] := '{}';
  v_cumple boolean;
  v_omitible boolean;
  v_detalle text;
  v_temp_norm text;
  v_apto boolean;
begin
  select a.* into v_animal
  from public.animal a
  where a.id_animal = p_id_animal
    and (public.current_user_is_superadmin() or a.id_refugio = public.current_refugio_id());

  if not found then
    return jsonb_build_object(
      'ok', false,
      'code', 'ANIMAL_NO_ENCONTRADO',
      'message', 'Animal no encontrado.'
    );
  end if;

  -- expediente_activo (no omitible)
  v_cumple := v_animal.activo and v_animal.deleted_at is null;
  v_omitible := false;
  v_detalle := case
    when v_cumple then 'Paciente activo y no eliminado.'
    else 'El expediente está inactivo o eliminado.'
  end;
  if not v_cumple then
    v_bloqueos := array_append(v_bloqueos, 'expediente_activo');
    v_no_omitibles := array_append(v_no_omitibles, 'expediente_activo');
  end if;
  v_criterios := v_criterios || jsonb_build_array(jsonb_build_object(
    'clave', 'expediente_activo',
    'etiqueta', 'Expediente activo',
    'cumple', v_cumple,
    'omitible', v_omitible,
    'detalle', v_detalle
  ));

  -- sin_cuarentena (no omitible)
  v_cumple := not v_animal.en_cuarentena;
  v_omitible := false;
  v_detalle := case
    when v_cumple then 'Cuarentena liberada.'
    else 'El paciente está en cuarentena.'
  end;
  if not v_cumple then
    v_bloqueos := array_append(v_bloqueos, 'sin_cuarentena');
    v_no_omitibles := array_append(v_no_omitibles, 'sin_cuarentena');
  end if;
  v_criterios := v_criterios || jsonb_build_array(jsonb_build_object(
    'clave', 'sin_cuarentena',
    'etiqueta', 'Sin cuarentena',
    'cumple', v_cumple,
    'omitible', v_omitible,
    'detalle', v_detalle
  ));

  -- esterilizado (omitible)
  v_cumple := v_animal.esterilizado;
  v_omitible := true;
  v_detalle := case
    when v_cumple then 'El paciente está esterilizado.'
    else 'No hay cirugía reproductiva exitosa registrada.'
  end;
  if not v_cumple then
    v_bloqueos := array_append(v_bloqueos, 'esterilizado');
  end if;
  v_criterios := v_criterios || jsonb_build_array(jsonb_build_object(
    'clave', 'esterilizado',
    'etiqueta', 'Esterilizado',
    'cumple', v_cumple,
    'omitible', v_omitible,
    'detalle', v_detalle
  ));

  -- salud_no_critica: último diagnóstico; ausencia y Crítico no son omitibles.
  select d.estado_general into v_dx
  from public.diagnostico_veterinario d
  where d.id_animal = p_id_animal
  order by d.fecha_diagnostico desc, d.id_diagnostico desc
  limit 1;

  if v_dx is null then
    v_cumple := false;
    v_omitible := false;
    v_detalle := 'Sin diagnóstico veterinario registrado.';
    v_bloqueos := array_append(v_bloqueos, 'salud_no_critica');
    v_no_omitibles := array_append(v_no_omitibles, 'salud_no_critica');
  elsif v_dx = 'Crítico' then
    v_cumple := false;
    v_omitible := false;
    v_detalle := 'Último diagnóstico: Crítico.';
    v_bloqueos := array_append(v_bloqueos, 'salud_no_critica');
    v_no_omitibles := array_append(v_no_omitibles, 'salud_no_critica');
  elsif v_dx = 'Delicado' then
    v_cumple := false;
    v_omitible := true;
    v_detalle := 'Último diagnóstico: Delicado.';
    v_bloqueos := array_append(v_bloqueos, 'salud_no_critica');
    v_advertencias := array_append(v_advertencias, 'salud_delicada');
  else
    v_cumple := true;
    v_omitible := true;
    v_detalle := 'Último diagnóstico: ' || v_dx || '.';
  end if;
  v_criterios := v_criterios || jsonb_build_array(jsonb_build_object(
    'clave', 'salud_no_critica',
    'etiqueta', 'Salud no crítica',
    'cumple', v_cumple,
    'omitible', v_omitible,
    'detalle', v_detalle
  ));

  -- temperamento_compatible: última evaluación o el temperamento del animal.
  select e.comportamiento into v_temp
  from public.evaluacion_temperamento e
  where e.id_animal = p_id_animal
  order by e.fecha_evaluacion desc, e.id_evaluacion_temperamento desc
  limit 1;

  if v_temp is null then
    v_temp := v_animal.temperamento;
  end if;

  v_temp_norm := lower(translate(coalesce(v_temp, ''), 'ÁÉÍÓÚáéíóú', 'AEIOUaeiou'));

  if v_temp is null then
    v_cumple := false;
    v_omitible := false;
    v_detalle := 'Sin temperamento evaluado.';
    v_bloqueos := array_append(v_bloqueos, 'temperamento_compatible');
    v_no_omitibles := array_append(v_no_omitibles, 'temperamento_compatible');
  elsif v_temp_norm = 'agresivo' then
    v_cumple := false;
    v_omitible := false;
    v_detalle := 'Última evaluación: ' || v_temp || '.';
    v_bloqueos := array_append(v_bloqueos, 'temperamento_compatible');
    v_no_omitibles := array_append(v_no_omitibles, 'temperamento_compatible');
  elsif v_temp_norm in ('reactivo', 'miedoso') then
    v_cumple := true;
    v_omitible := true;
    v_detalle := 'Última evaluación: ' || v_temp || ' (advertencia).';
    v_advertencias := array_append(
      v_advertencias,
      case when v_temp_norm = 'reactivo' then 'temperamento_reactivo' else 'temperamento_miedoso' end
    );
  else
    v_cumple := true;
    v_omitible := true;
    v_detalle := 'Última evaluación: ' || v_temp || '.';
  end if;
  v_criterios := v_criterios || jsonb_build_array(jsonb_build_object(
    'clave', 'temperamento_compatible',
    'etiqueta', 'Temperamento compatible',
    'cumple', v_cumple,
    'omitible', v_omitible,
    'detalle', v_detalle
  ));

  -- rehabilitacion_al_dia (omitible): bloquea una rehabilitación abierta.
  select min(r.fecha_inicio) into v_rehab_inicio
  from public.rehabilitacion r
  where r.id_animal = p_id_animal
    and r.fecha_fin is null;

  if v_rehab_inicio is not null then
    v_cumple := false;
    v_omitible := true;
    v_detalle := 'Existe una rehabilitación abierta desde ' || to_char(v_rehab_inicio, 'YYYY-MM-DD') || '.';
    v_bloqueos := array_append(v_bloqueos, 'rehabilitacion_al_dia');
  else
    v_cumple := true;
    v_omitible := true;
    v_detalle := 'Sin rehabilitación abierta.';
  end if;
  v_criterios := v_criterios || jsonb_build_array(jsonb_build_object(
    'clave', 'rehabilitacion_al_dia',
    'etiqueta', 'Rehabilitación al día',
    'cumple', v_cumple,
    'omitible', v_omitible,
    'detalle', v_detalle
  ));

  select jsonb_build_object(
    'id_excepcion', x.id_excepcion,
    'id_usuario', x.id_usuario,
    'motivo', x.motivo,
    'criterios_omitidos', to_jsonb(x.criterios_omitidos),
    'fecha_excepcion', x.fecha_excepcion
  ) into v_excepcion
  from public.excepcion_aptitud_adopcion x
  where x.id_animal = p_id_animal
    and not x.revocada
  order by x.fecha_excepcion desc, x.id_excepcion desc
  limit 1;

  v_apto := cardinality(v_bloqueos) = 0;

  return jsonb_build_object(
    'ok', true,
    'data', jsonb_build_object(
      'id_animal', v_animal.id_animal,
      'id_refugio', v_animal.id_refugio,
      'apto', v_apto,
      'disponible_adopcion', v_animal.disponible_adopcion,
      'bloqueos', to_jsonb(v_bloqueos),
      'bloqueos_no_omitibles', to_jsonb(v_no_omitibles),
      'advertencias', to_jsonb(v_advertencias),
      'criterios', v_criterios,
      'excepcion_vigente', v_excepcion
    )
  );
end;
$$;

revoke all on function public.evaluar_aptitud_adopcion(integer) from public, anon;
grant execute on function public.evaluar_aptitud_adopcion(integer) to authenticated;

-- ---------------------------------------------------------------------------
-- 7) RPC: registro de cirugía reproductiva (US15)
--    Valida todos los lotes antes de escribir y ejecuta el descuento, los
--    movimientos, la relación cirugía-insumo, `esterilizado` y la auditoría en
--    la misma transacción.
-- ---------------------------------------------------------------------------

create or replace function public.registrar_cirugia_reproductiva(
  p_id_animal integer,
  p_tipo_cirugia text,
  p_fecha_cirugia timestamptz,
  p_exitosa boolean,
  p_notas_postoperatorias text,
  p_insumos jsonb,
  p_id_usuario integer
) returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_animal public.animal%rowtype;
  v_tipo text;
  v_insumos jsonb;
  v_item jsonb;
  v_id_lote bigint;
  v_cantidad integer;
  v_total integer;
  v_previo integer;
  v_lote public.inventario_lote%rowtype;
  v_insumo public.inventario_insumo%rowtype;
  v_id_cirugia integer;
  v_fecha timestamptz;
  v_indice integer := 0;
  v_lote_ids bigint[] := '{}';
  v_cantidades integer[] := '{}';
  v_nombres text[] := '{}';
  v_stocks integer[] := '{}';
  v_consumidos jsonb := '[]'::jsonb;
begin
  -- Normaliza el tipo canónico (tolera variantes sin tilde del cliente).
  v_tipo := case lower(translate(coalesce(p_tipo_cirugia, ''), 'ÁÉÍÓÚáéíóú', 'AEIOUaeiou'))
    when 'esterilizacion' then 'Esterilización'
    when 'castracion' then 'Castración'
    else null
  end;

  if v_tipo is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'DATOS_INVALIDOS',
      'message', 'El tipo de cirugía debe ser Esterilización o Castración.'
    );
  end if;

  if p_fecha_cirugia is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'DATOS_INVALIDOS',
      'message', 'La fecha de la cirugía es obligatoria.'
    );
  end if;

  if p_exitosa is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'DATOS_INVALIDOS',
      'message', 'El resultado de la cirugía es obligatorio.'
    );
  end if;

  if p_fecha_cirugia > now() then
    return jsonb_build_object(
      'ok', false,
      'code', 'FECHA_FUTURA',
      'message', 'La fecha de la cirugía no puede ser futura.'
    );
  end if;

  if p_notas_postoperatorias is not null
     and char_length(btrim(p_notas_postoperatorias)) > 2000 then
    return jsonb_build_object(
      'ok', false,
      'code', 'DATOS_INVALIDOS',
      'message', 'Las notas postoperatorias admiten hasta 2000 caracteres.'
    );
  end if;

  -- Bloqueo del animal: resuelve el tenant y serializa contra otras cirugías.
  select a.* into v_animal
  from public.animal a
  where a.id_animal = p_id_animal
    and a.deleted_at is null
    and (public.current_user_is_superadmin() or a.id_refugio = public.current_refugio_id())
  for update;

  if not found then
    return jsonb_build_object(
      'ok', false,
      'code', 'ANIMAL_NO_ENCONTRADO',
      'message', 'Animal no encontrado.'
    );
  end if;

  -- Idempotencia por (animal, tipo, fecha).
  if exists (
    select 1
    from public.cirugia_reproductiva c
    where c.id_animal = p_id_animal
      and c.tipo_cirugia = v_tipo
      and c.fecha_cirugia = p_fecha_cirugia::timestamp
  ) then
    return jsonb_build_object(
      'ok', false,
      'code', 'CIRUGIA_DUPLICADA',
      'message', 'Ya existe una cirugía registrada para este paciente, tipo y fecha.'
    );
  end if;

  if p_insumos is null then
    v_insumos := '[]'::jsonb;
  elsif jsonb_typeof(p_insumos) <> 'array' then
    return jsonb_build_object(
      'ok', false,
      'code', 'DATOS_INVALIDOS',
      'message', 'La lista de insumos no es válida.'
    );
  else
    v_insumos := p_insumos;
  end if;

  select count(*) into v_total from jsonb_array_elements(v_insumos);
  if v_total > 50 then
    return jsonb_build_object(
      'ok', false,
      'code', 'DATOS_INVALIDOS',
      'message', 'Una cirugía no puede consumir más de 50 lotes.'
    );
  end if;

  -- Duplicados de lote en la misma solicitud.
  if v_total > 0 then
    if (
      select count(distinct (e.value->>'id_lote_inventario'))
      from jsonb_array_elements(v_insumos) e
    ) <> v_total then
      return jsonb_build_object(
        'ok', false,
        'code', 'INSUMOS_DUPLICADOS',
        'message', 'Un mismo lote no puede repetirse en la misma cirugía.'
      );
    end if;
  end if;

  -- Fase 1: validar y bloquear todos los lotes sin escribir nada.
  for v_item in select * from jsonb_array_elements(v_insumos)
  loop
    if (v_item->>'id_lote_inventario') is null
       or (v_item->>'id_lote_inventario') !~ '^[0-9]+$' then
      return jsonb_build_object(
        'ok', false,
        'code', 'DATOS_INVALIDOS',
        'message', 'Cada insumo debe referenciar un lote válido.'
      );
    end if;

    if (v_item->>'cantidad') is null
       or (v_item->>'cantidad') !~ '^[0-9]+$'
       or (v_item->>'cantidad')::integer < 1 then
      return jsonb_build_object(
        'ok', false,
        'code', 'CANTIDAD_INVALIDA',
        'message', 'La cantidad de cada insumo debe ser un entero mayor o igual a 1.'
      );
    end if;

    v_id_lote := (v_item->>'id_lote_inventario')::bigint;
    v_cantidad := (v_item->>'cantidad')::integer;

    -- Lectura previa al bloqueo: permite distinguir stock insuficiente real de
    -- una unidad consumida por otra transacción (regla 15).
    select l.stock_actual into v_previo
    from public.inventario_lote l
    where l.id_lote_inventario = v_id_lote;

    select l.* into v_lote
    from public.inventario_lote l
    where l.id_lote_inventario = v_id_lote
    for update;

    if not found or v_lote.id_refugio <> v_animal.id_refugio then
      return jsonb_build_object(
        'ok', false,
        'code', 'LOTE_NO_ENCONTRADO',
        'message', 'El lote seleccionado no existe en este refugio.'
      );
    end if;

    if not v_lote.activo then
      return jsonb_build_object(
        'ok', false,
        'code', 'LOTE_INACTIVO',
        'message', 'El lote seleccionado está inactivo.'
      );
    end if;

    if v_lote.fecha_caducidad is not null
       and v_lote.fecha_caducidad < current_date then
      return jsonb_build_object(
        'ok', false,
        'code', 'LOTE_VENCIDO',
        'message', 'El lote seleccionado está vencido.'
      );
    end if;

    select i.* into v_insumo
    from public.inventario_insumo i
    where i.id_insumo = v_lote.id_insumo;

    if not found or not v_insumo.activo then
      return jsonb_build_object(
        'ok', false,
        'code', 'LOTE_INACTIVO',
        'message', 'El insumo del lote seleccionado está inactivo.'
      );
    end if;

    if v_insumo.tipo_insumo <> 'insumo_quirurgico' then
      return jsonb_build_object(
        'ok', false,
        'code', 'TIPO_INSUMO_INVALIDO',
        'message', 'El lote seleccionado no es un insumo quirúrgico.'
      );
    end if;

    if v_lote.stock_actual < v_cantidad then
      if coalesce(v_previo, 0) >= v_cantidad then
        return jsonb_build_object(
          'ok', false,
          'code', 'CONFLICTO_CONCURRENCIA',
          'message', 'Otro usuario consumió las unidades necesarias. Selecciona otro lote.'
        );
      end if;
      return jsonb_build_object(
        'ok', false,
        'code', 'STOCK_INSUFICIENTE',
        'message', 'No hay unidades suficientes en el lote seleccionado.'
      );
    end if;

    v_lote_ids := array_append(v_lote_ids, v_id_lote);
    v_cantidades := array_append(v_cantidades, v_cantidad);
    v_nombres := array_append(v_nombres, v_insumo.nombre);
  end loop;

  -- Fase 2: persistir cirugía, insumos, movimientos y flag de esterilización.
  begin
    insert into public.cirugia_reproductiva (
      id_animal, id_refugio, id_usuario, tipo_cirugia, fecha_cirugia,
      notas_postoperatorias, exitosa
    ) values (
      p_id_animal, v_animal.id_refugio, p_id_usuario, v_tipo,
      p_fecha_cirugia::timestamp,
      nullif(btrim(coalesce(p_notas_postoperatorias, '')), ''), p_exitosa
    )
    returning id_cirugia, fecha_cirugia into v_id_cirugia, v_fecha;
  exception
    when unique_violation then
      return jsonb_build_object(
        'ok', false,
        'code', 'CIRUGIA_DUPLICADA',
        'message', 'Ya existe una cirugía registrada para este paciente, tipo y fecha.'
      );
  end;

  for v_indice in 1 .. coalesce(array_length(v_lote_ids, 1), 0)
  loop
    update public.inventario_lote
    set stock_actual = stock_actual - v_cantidades[v_indice]
    where id_lote_inventario = v_lote_ids[v_indice]
    returning stock_actual into v_previo;

    insert into public.cirugia_insumo (
      id_cirugia, id_lote_inventario, id_refugio, cantidad
    ) values (
      v_id_cirugia, v_lote_ids[v_indice], v_animal.id_refugio, v_cantidades[v_indice]
    );

    insert into public.inventario_movimiento (
      id_lote_inventario, id_refugio, tipo_movimiento, cantidad,
      motivo, id_referencia, id_usuario
    ) values (
      v_lote_ids[v_indice], v_animal.id_refugio, 'salida', v_cantidades[v_indice],
      'cirugia_reproductiva', 'cirugia_reproductiva:' || v_id_cirugia::text, p_id_usuario
    );

    v_consumidos := v_consumidos || jsonb_build_array(jsonb_build_object(
      'id_lote_inventario', v_lote_ids[v_indice],
      'nombre_insumo', v_nombres[v_indice],
      'cantidad', v_cantidades[v_indice],
      'stock_restante', v_previo
    ));
  end loop;

  if p_exitosa then
    update public.animal
    set esterilizado = true
    where id_animal = p_id_animal;
  end if;

  insert into public.auditoria (
    id_usuario, id_refugio, accion, modulo, entidad_id, descripcion
  ) values (
    p_id_usuario, v_animal.id_refugio, 'registro_cirugia_reproductiva', 'animals',
    p_id_animal,
    'Cirugía ' || v_tipo || ' registrada (exitosa: ' || p_exitosa::text || ').'
  );

  return jsonb_build_object(
    'ok', true,
    'data', jsonb_build_object(
      'id_cirugia', v_id_cirugia,
      'id_animal', p_id_animal,
      'id_refugio', v_animal.id_refugio,
      'tipo_cirugia', v_tipo,
      'fecha_cirugia', v_fecha,
      'exitosa', p_exitosa,
      'notas_postoperatorias', nullif(btrim(coalesce(p_notas_postoperatorias, '')), ''),
      'id_usuario', p_id_usuario,
      'esterilizado_actualizado', p_exitosa,
      'insumos_consumidos', v_consumidos
    )
  );
end;
$$;

revoke all on function public.registrar_cirugia_reproductiva(
  integer, text, timestamptz, boolean, text, jsonb, integer
) from public, anon;
grant execute on function public.registrar_cirugia_reproductiva(
  integer, text, timestamptz, boolean, text, jsonb, integer
) to authenticated;

-- ---------------------------------------------------------------------------
-- 8) RPC: publicar / despublicar para adopción (US16)
-- ---------------------------------------------------------------------------

create or replace function public.publicar_adopcion(
  p_id_animal integer,
  p_disponible boolean,
  p_autorizar_excepcion boolean,
  p_motivo_excepcion text,
  p_id_usuario integer
) returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_animal public.animal%rowtype;
  v_eval jsonb;
  v_data jsonb;
  v_apto boolean;
  v_bloqueos text[];
  v_no_omitibles text[];
  v_advertencias text[];
  v_excepcion jsonb := null;
  v_id_excepcion bigint;
  v_fecha_excepcion timestamptz;
  v_auditoria_id bigint;
begin
  if p_disponible is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'DATOS_INVALIDOS',
      'message', 'La disponibilidad para adopción es obligatoria.'
    );
  end if;

  select a.* into v_animal
  from public.animal a
  where a.id_animal = p_id_animal
    and a.deleted_at is null
    and (public.current_user_is_superadmin() or a.id_refugio = public.current_refugio_id())
  for update;

  if not found then
    return jsonb_build_object(
      'ok', false,
      'code', 'ANIMAL_NO_ENCONTRADO',
      'message', 'Animal no encontrado.'
    );
  end if;

  -- Despublicar siempre es posible y revoca la excepción vigente (regla 20).
  if not p_disponible then
    update public.animal
    set disponible_adopcion = false
    where id_animal = p_id_animal;

    update public.excepcion_aptitud_adopcion
    set revocada = true, fecha_revocacion = now()
    where id_animal = p_id_animal and not revocada;

    v_eval := public.evaluar_aptitud_adopcion(p_id_animal);
    v_data := v_eval->'data';

    return jsonb_build_object(
      'ok', true,
      'data', jsonb_build_object(
        'id_animal', p_id_animal,
        'disponible_adopcion', false,
        'apto', coalesce((v_data->>'apto')::boolean, false),
        'excepcion_aplicada', false,
        'excepcion', null,
        'auditoria_id', null
      )
    );
  end if;

  v_eval := public.evaluar_aptitud_adopcion(p_id_animal);
  if not (v_eval->>'ok')::boolean then
    return v_eval;
  end if;

  v_data := v_eval->'data';
  v_apto := coalesce((v_data->>'apto')::boolean, false);
  v_bloqueos := array(select jsonb_array_elements_text(coalesce(v_data->'bloqueos', '[]'::jsonb)));
  v_no_omitibles := array(select jsonb_array_elements_text(coalesce(v_data->'bloqueos_no_omitibles', '[]'::jsonb)));
  v_advertencias := array(select jsonb_array_elements_text(coalesce(v_data->'advertencias', '[]'::jsonb)));

  if v_animal.en_cuarentena then
    return jsonb_build_object(
      'ok', false,
      'code', 'ANIMAL_EN_CUARENTENA',
      'message', 'El paciente está en cuarentena. Registra el alta médica antes de publicarlo.'
    );
  end if;

  if p_autorizar_excepcion is true and v_apto then
    return jsonb_build_object(
      'ok', false,
      'code', 'EXCEPCION_INNECESARIA',
      'message', 'El paciente ya cumple todos los criterios; no requiere excepción.'
    );
  end if;

  if v_apto then
    update public.animal
    set disponible_adopcion = true
    where id_animal = p_id_animal;

    return jsonb_build_object(
      'ok', true,
      'data', jsonb_build_object(
        'id_animal', p_id_animal,
        'disponible_adopcion', true,
        'apto', true,
        'excepcion_aplicada', false,
        'excepcion', null,
        'auditoria_id', null
      )
    );
  end if;

  if p_autorizar_excepcion is not true then
    return jsonb_build_object(
      'ok', false,
      'code', 'APTITUD_ADOPCION_INSUFICIENTE',
      'message', 'El paciente no cumple los criterios para ser publicado en adopción.',
      'details', jsonb_build_object(
        'bloqueos', to_jsonb(v_bloqueos),
        'advertencias', to_jsonb(v_advertencias)
      )
    );
  end if;

  -- Excepción: solo Administrador (o Superadmin) y con motivo obligatorio.
  if not (public.current_user_is_superadmin() or public.current_user_is_admin()) then
    return jsonb_build_object(
      'ok', false,
      'code', 'EXCEPCION_NO_AUTORIZADA',
      'message', 'Solo un administrador puede autorizar una excepción de aptitud.'
    );
  end if;

  if p_motivo_excepcion is null
     or char_length(btrim(p_motivo_excepcion)) < 20
     or char_length(btrim(p_motivo_excepcion)) > 1000 then
    return jsonb_build_object(
      'ok', false,
      'code', 'MOTIVO_EXCEPCION_REQUERIDO',
      'message', 'La excepción requiere un motivo de entre 20 y 1000 caracteres.'
    );
  end if;

  if cardinality(v_no_omitibles) > 0 then
    return jsonb_build_object(
      'ok', false,
      'code', 'BLOQUEO_NO_EXCEPCIONABLE',
      'message', 'El paciente tiene bloqueos que no pueden omitirse con una excepción.',
      'details', jsonb_build_object('bloqueos', to_jsonb(v_no_omitibles))
    );
  end if;

  -- Una sola excepción vigente: se revoca la anterior y se registra la nueva.
  update public.excepcion_aptitud_adopcion
  set revocada = true, fecha_revocacion = now()
  where id_animal = p_id_animal and not revocada;

  insert into public.excepcion_aptitud_adopcion (
    id_animal, id_refugio, id_usuario, motivo, criterios_omitidos
  ) values (
    p_id_animal, v_animal.id_refugio, p_id_usuario,
    btrim(p_motivo_excepcion), v_bloqueos
  )
  returning id_excepcion, fecha_excepcion into v_id_excepcion, v_fecha_excepcion;

  update public.animal
  set disponible_adopcion = true
  where id_animal = p_id_animal;

  insert into public.auditoria (
    id_usuario, id_refugio, accion, modulo, entidad_id, descripcion
  ) values (
    p_id_usuario, v_animal.id_refugio, 'excepcion_aptitud_adopcion', 'animals',
    p_id_animal,
    'Publicación por excepción. Motivo: ' || btrim(p_motivo_excepcion) ||
    '. Criterios omitidos: ' || array_to_string(v_bloqueos, ', ') || '.'
  )
  returning id_auditoria into v_auditoria_id;

  v_excepcion := jsonb_build_object(
    'id_excepcion', v_id_excepcion,
    'id_usuario', p_id_usuario,
    'motivo', btrim(p_motivo_excepcion),
    'criterios_omitidos', to_jsonb(v_bloqueos),
    'fecha_excepcion', v_fecha_excepcion
  );

  return jsonb_build_object(
    'ok', true,
    'data', jsonb_build_object(
      'id_animal', p_id_animal,
      'disponible_adopcion', true,
      'apto', false,
      'excepcion_aplicada', true,
      'excepcion', v_excepcion,
      'auditoria_id', v_auditoria_id
    )
  );
end;
$$;

revoke all on function public.publicar_adopcion(
  integer, boolean, boolean, text, integer
) from public, anon;
grant execute on function public.publicar_adopcion(
  integer, boolean, boolean, text, integer
) to authenticated;

notify pgrst, 'reload schema';

commit;
