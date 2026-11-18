-- Requerimiento 03 — parámetros opcionales de RPC.
--
-- Las RPC `registrar_evento_sanitario`, `registrar_evaluacion_temperamento` y
-- `registrar_traslado` aceptan valores NULL en columnas opcionales (motivo,
-- marca de lote, fecha de refuerzo, observaciones, fecha de alta, fecha de
-- evaluación). PostgreSQL permite NULL en esos argumentos, pero los tipos
-- generados por Supabase los exponen como no anulables, lo que rompe el
-- typecheck de los repositories que envían `null`.
--
-- Se declaran con `default null`, de modo que el generador los expone como
-- argumentos opcionales y el repositorio puede omitirlos en vez de enviar
-- `null`. No cambia el comportamiento SQL: un argumento omitido recibe NULL.
--
-- Idempotente: `create or replace function` con la misma firma.

begin;

create or replace function public.registrar_evento_sanitario(
  p_id_animal integer,
  p_tipo_evento text,
  p_tipo_biologico text,
  p_fecha_aplicacion date,
  p_marca_lote text default null,
  p_fecha_refuerzo date default null,
  p_esquema_completo boolean default false,
  p_id_lote_inventario integer default null,
  p_observaciones text default null,
  p_id_usuario integer default null
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

create or replace function public.registrar_evaluacion_temperamento(
  p_id_animal integer,
  p_comportamiento text,
  p_nivel_energia text,
  p_apto_perros text,
  p_apto_gatos text,
  p_apto_ninos text,
  p_fecha_evaluacion timestamptz default null,
  p_id_usuario integer default null
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

create or replace function public.registrar_traslado(
  p_id_animal integer,
  p_id_espacio_destino integer,
  p_motivo text default null,
  p_alta_observaciones text default null,
  p_alta_fecha timestamptz default null,
  p_id_usuario integer default null
) returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_animal public.animal%rowtype;
  v_destino public.espacio%rowtype;
  v_ocupacion_previa integer;
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

  -- Lectura previa (sin bloqueo) para distinguir "ya estaba lleno" de
  -- "se llenó mientras esperábamos el bloqueo".
  select count(*)::integer into v_ocupacion_previa
  from public.animal a
  where a.id_espacio = p_id_espacio_destino
    and a.deleted_at is null
    and a.activo;

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
    if v_ocupacion_previa < v_destino.capacidad then
      return jsonb_build_object('ok', false, 'code', 'CONFLICTO_OCUPACION',
        'message', 'Otra operación ocupó la última plaza. Recarga e inténtalo de nuevo.');
    end if;
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

revoke all on function public.registrar_evento_sanitario(
  integer, text, text, date, text, date, boolean, integer, text, integer
) from public, anon;
grant execute on function public.registrar_evento_sanitario(
  integer, text, text, date, text, date, boolean, integer, text, integer
) to authenticated;

revoke all on function public.registrar_evaluacion_temperamento(
  integer, text, text, text, text, text, timestamptz, integer
) from public, anon;
grant execute on function public.registrar_evaluacion_temperamento(
  integer, text, text, text, text, text, timestamptz, integer
) to authenticated;

revoke all on function public.registrar_traslado(
  integer, integer, text, text, timestamptz, integer
) from public, anon;
grant execute on function public.registrar_traslado(
  integer, integer, text, text, timestamptz, integer
) to authenticated;

commit;
