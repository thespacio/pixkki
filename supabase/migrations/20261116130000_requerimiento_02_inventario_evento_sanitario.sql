-- Requerimiento 02 — cierre de US10 (RF2.2 / RF2.3) y atomicidad de RF2.4.
--
-- Entrega el contrato mínimo de inventario que necesita el registro de eventos
-- sanitarios, sin simular stock: los lotes son datos reales del refugio y el
-- descuento ocurre dentro de una RPC transaccional.
--
-- También sustituye la compensación manual del alta de cuarentena por una RPC
-- atómica (UPDATE condicional + INSERT del registro de alta).
--
-- IMPORTANTE: este archivo se entrega para revisión; no se aplica al proyecto
-- remoto desde el agente. Requiere aprobación humana para `supabase db push`.

begin;

-- ---------------------------------------------------------------------------
-- 1) Esquema mínimo de inventario (Épica 6, contrato consumido por animals)
-- ---------------------------------------------------------------------------

create table if not exists public.inventario_insumo (
  id_insumo bigserial primary key,
  id_refugio integer not null references public.refugio(id_refugio) on delete cascade,
  nombre text not null,
  tipo_insumo text not null check (tipo_insumo in ('vacuna', 'desparasitante', 'otro')),
  unidad_medida text not null default 'dosis',
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.inventario_lote (
  id_lote_inventario bigserial primary key,
  id_insumo bigint not null references public.inventario_insumo(id_insumo) on delete restrict,
  id_refugio integer not null references public.refugio(id_refugio) on delete cascade,
  marca text,
  lote text,
  stock_actual integer not null default 0 check (stock_actual >= 0),
  stock_minimo integer not null default 0 check (stock_minimo >= 0),
  fecha_caducidad date,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.inventario_movimiento (
  id_movimiento bigserial primary key,
  id_lote_inventario bigint not null references public.inventario_lote(id_lote_inventario) on delete restrict,
  id_refugio integer not null references public.refugio(id_refugio) on delete cascade,
  tipo_movimiento text not null check (tipo_movimiento in ('entrada', 'salida')),
  cantidad integer not null check (cantidad > 0),
  motivo text not null,
  id_referencia text,
  id_usuario integer references public.usuario(id_usuario),
  fecha timestamptz not null default now()
);

create index if not exists inventario_insumo_refugio_idx
  on public.inventario_insumo (id_refugio);
create index if not exists inventario_lote_refugio_idx
  on public.inventario_lote (id_refugio, id_insumo);
create index if not exists inventario_movimiento_refugio_lote_idx
  on public.inventario_movimiento (id_refugio, id_lote_inventario);

-- Vínculo opcional del evento con el lote. Solo se crea si no hay filas
-- legacy apuntando a lotes que no existen (la tabla vacunacion original no
-- tenía este vínculo).
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'evento_sanitario_lote_fkey')
     and not exists (
       select 1
       from public.evento_sanitario
       where id_lote_inventario is not null
     )
  then
    alter table public.evento_sanitario
      add constraint evento_sanitario_lote_fkey
      foreign key (id_lote_inventario)
      references public.inventario_lote(id_lote_inventario);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2) RLS: las nuevas tablas y evento_sanitario se aíslan por refugio.
--    `current_refugio_id()` y `current_user_is_superadmin()` ya están definidas
--    por la migración 20261115120000 / 20261116120000.
-- ---------------------------------------------------------------------------

alter table public.inventario_insumo enable row level security;
alter table public.inventario_lote enable row level security;
alter table public.inventario_movimiento enable row level security;
alter table public.evento_sanitario enable row level security;

revoke all on public.inventario_insumo from anon;
revoke all on public.inventario_lote from anon;
revoke all on public.inventario_movimiento from anon;
revoke all on public.evento_sanitario from anon;

drop policy if exists inventario_insumo_tenant on public.inventario_insumo;
create policy inventario_insumo_tenant on public.inventario_insumo
  for all to authenticated
  using (public.current_user_is_superadmin() or id_refugio = public.current_refugio_id())
  with check (public.current_user_is_superadmin() or id_refugio = public.current_refugio_id());

drop policy if exists inventario_lote_tenant on public.inventario_lote;
create policy inventario_lote_tenant on public.inventario_lote
  for all to authenticated
  using (public.current_user_is_superadmin() or id_refugio = public.current_refugio_id())
  with check (public.current_user_is_superadmin() or id_refugio = public.current_refugio_id());

drop policy if exists inventario_movimiento_tenant on public.inventario_movimiento;
create policy inventario_movimiento_tenant on public.inventario_movimiento
  for all to authenticated
  using (public.current_user_is_superadmin() or id_refugio = public.current_refugio_id())
  with check (public.current_user_is_superadmin() or id_refugio = public.current_refugio_id());

drop policy if exists evento_sanitario_tenant on public.evento_sanitario;
create policy evento_sanitario_tenant on public.evento_sanitario
  for all to authenticated
  using (public.current_user_is_superadmin() or id_refugio = public.current_refugio_id())
  with check (public.current_user_is_superadmin() or id_refugio = public.current_refugio_id());

-- ---------------------------------------------------------------------------
-- 3) RPC transaccional de eventos sanitarios (RF2.2 / RF2.3)
--    Bloquea la fila del lote (`for update`), valida pertenencia/estado/stock,
--    descuenta 1 unidad, inserta el evento, el movimiento y actualiza flags.
--    Devuelve un envelope para que la capa de aplicación traduzca los códigos
--    a errores tipados sin filtrar detalles de SQL.
-- ---------------------------------------------------------------------------

create or replace function public.registrar_evento_sanitario(
  p_id_animal integer,
  p_tipo_evento text,
  p_tipo_biologico text,
  p_fecha_aplicacion date,
  p_marca_lote text,
  p_fecha_refuerzo date,
  p_esquema_completo boolean,
  p_id_lote_inventario integer,
  p_observaciones text,
  p_id_usuario integer
) returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id_refugio integer;
  v_lote public.inventario_lote%rowtype;
  v_insumo public.inventario_insumo%rowtype;
  v_stock_restante integer;
  v_id_evento bigint;
  v_fecha_registro timestamptz;
begin
  select a.id_refugio into v_id_refugio
  from public.animal a
  where a.id_animal = p_id_animal and a.deleted_at is null;

  if v_id_refugio is null then
    return jsonb_build_object('ok', false, 'code', 'ANIMAL_NO_ENCONTRADO',
      'message', 'Animal no encontrado.');
  end if;

  if p_tipo_evento not in ('vacunacion', 'desparasitacion') then
    return jsonb_build_object('ok', false, 'code', 'TIPO_EVENTO_INVALIDO',
      'message', 'Tipo de evento sanitario inválido.');
  end if;

  if p_fecha_aplicacion > current_date then
    return jsonb_build_object('ok', false, 'code', 'FECHA_FUTURA',
      'message', 'La fecha de aplicación no puede ser futura.');
  end if;

  if p_esquema_completo and p_fecha_refuerzo is null then
    return jsonb_build_object('ok', false, 'code', 'REFUERZO_REQUERIDO',
      'message', 'Un esquema completo requiere fecha de refuerzo.');
  end if;

  if p_fecha_refuerzo is not null and p_fecha_refuerzo <= p_fecha_aplicacion then
    return jsonb_build_object('ok', false, 'code', 'FECHA_REFUERZO_INVALIDA',
      'message', 'La fecha de refuerzo debe ser posterior a la de aplicación.');
  end if;

  -- Bloqueo de fila: solo una transacción puede consumir el lote a la vez.
  select l.* into v_lote
  from public.inventario_lote l
  where l.id_lote_inventario = p_id_lote_inventario
  for update;

  if not found or v_lote.id_refugio <> v_id_refugio then
    return jsonb_build_object('ok', false, 'code', 'LOTE_NO_ENCONTRADO',
      'message', 'El lote seleccionado no existe en este refugio.');
  end if;

  if not v_lote.activo then
    return jsonb_build_object('ok', false, 'code', 'LOTE_INACTIVO',
      'message', 'El lote seleccionado está inactivo.');
  end if;

  if v_lote.fecha_caducidad is not null and v_lote.fecha_caducidad < current_date then
    return jsonb_build_object('ok', false, 'code', 'LOTE_VENCIDO',
      'message', 'El lote seleccionado está vencido.');
  end if;

  if v_lote.stock_actual <= 0 then
    return jsonb_build_object('ok', false, 'code', 'STOCK_INSUFICIENTE',
      'message', 'No hay unidades disponibles en el lote seleccionado.');
  end if;

  select i.* into v_insumo
  from public.inventario_insumo i
  where i.id_insumo = v_lote.id_insumo;

  if not found or not v_insumo.activo then
    return jsonb_build_object('ok', false, 'code', 'LOTE_INACTIVO',
      'message', 'El insumo del lote seleccionado está inactivo.');
  end if;

  if (p_tipo_evento = 'vacunacion' and v_insumo.tipo_insumo <> 'vacuna')
     or (p_tipo_evento = 'desparasitacion' and v_insumo.tipo_insumo <> 'desparasitante') then
    return jsonb_build_object('ok', false, 'code', 'TIPO_EVENTO_INVALIDO',
      'message', 'El insumo del lote no corresponde al tipo de evento.');
  end if;

  update public.inventario_lote
  set stock_actual = stock_actual - 1
  where id_lote_inventario = p_id_lote_inventario
  returning stock_actual into v_stock_restante;

  insert into public.evento_sanitario (
    id_animal, id_refugio, tipo_evento, tipo_biologico, marca_lote,
    fecha_aplicacion, fecha_refuerzo, esquema_completo,
    id_lote_inventario, cantidad, observaciones, id_usuario
  ) values (
    p_id_animal, v_id_refugio, p_tipo_evento, p_tipo_biologico, p_marca_lote,
    p_fecha_aplicacion, p_fecha_refuerzo, p_esquema_completo,
    p_id_lote_inventario, 1, p_observaciones, p_id_usuario
  )
  returning id_evento, fecha_registro into v_id_evento, v_fecha_registro;

  insert into public.inventario_movimiento (
    id_lote_inventario, id_refugio, tipo_movimiento, cantidad,
    motivo, id_referencia, id_usuario
  ) values (
    p_id_lote_inventario, v_id_refugio, 'salida', 1,
    'evento_sanitario', 'evento_sanitario:' || v_id_evento::text, p_id_usuario
  );

  if p_tipo_evento = 'vacunacion' then
    update public.animal set vacunado = true where id_animal = p_id_animal;
  else
    update public.animal set desparasitado = true where id_animal = p_id_animal;
  end if;

  return jsonb_build_object('ok', true, 'data', jsonb_build_object(
    'id_evento', v_id_evento,
    'id_animal', p_id_animal,
    'id_refugio', v_id_refugio,
    'tipo_evento', p_tipo_evento,
    'tipo_biologico', p_tipo_biologico,
    'marca_lote', p_marca_lote,
    'fecha_aplicacion', p_fecha_aplicacion,
    'fecha_refuerzo', p_fecha_refuerzo,
    'esquema_completo', p_esquema_completo,
    'id_lote_inventario', p_id_lote_inventario,
    'cantidad_descontada', 1,
    'stock_restante', v_stock_restante,
    'observaciones', p_observaciones,
    'id_usuario', p_id_usuario,
    'fecha_registro', v_fecha_registro
  ));
end;
$$;

-- ---------------------------------------------------------------------------
-- 4) RPC transaccional del alta de cuarentena (RF2.4, regla 15)
--    El UPDATE condicional evita dos altas concurrentes; el INSERT queda dentro
--    de la misma transacción, sin compensaciones posteriores.
-- ---------------------------------------------------------------------------

create or replace function public.registrar_alta_cuarentena(
  p_id_animal integer,
  p_observaciones text,
  p_fecha_alta timestamptz,
  p_id_usuario integer
) returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id_refugio integer;
  v_id_alta bigint;
  v_fecha_alta timestamptz;
begin
  update public.animal a
  set en_cuarentena = false
  where a.id_animal = p_id_animal
    and a.en_cuarentena = true
    and (public.current_user_is_superadmin() or a.id_refugio = public.current_refugio_id())
  returning a.id_refugio into v_id_refugio;

  if v_id_refugio is null then
    return jsonb_build_object('ok', false, 'code', 'CUARENTENA_YA_LIBERADA',
      'message', 'La cuarentena del paciente ya fue liberada.');
  end if;

  insert into public.altas_cuarentena (
    id_animal, id_refugio, observaciones, id_usuario_veterinario, fecha_alta
  ) values (
    p_id_animal, v_id_refugio, p_observaciones, p_id_usuario, p_fecha_alta
  )
  returning id_alta, fecha_alta into v_id_alta, v_fecha_alta;

  return jsonb_build_object('ok', true, 'data', jsonb_build_object(
    'id_alta', v_id_alta,
    'id_animal', p_id_animal,
    'id_refugio', v_id_refugio,
    'observaciones', p_observaciones,
    'id_usuario_veterinario', p_id_usuario,
    'fecha_alta', v_fecha_alta,
    'en_cuarentena', false
  ));
end;
$$;

revoke all on function public.registrar_evento_sanitario(
  integer, text, text, date, text, date, boolean, integer, text, integer
) from public, anon;
grant execute on function public.registrar_evento_sanitario(
  integer, text, text, date, text, date, boolean, integer, text, integer
) to authenticated;

revoke all on function public.registrar_alta_cuarentena(integer, text, timestamptz, integer)
  from public, anon;
grant execute on function public.registrar_alta_cuarentena(integer, text, timestamptz, integer)
  to authenticated;

commit;
