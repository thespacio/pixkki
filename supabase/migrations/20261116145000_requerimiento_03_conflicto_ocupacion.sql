-- Requerimiento 03 — ajuste de concurrencia de ocupación (RF3.1 / regla 11).
--
-- La versión anterior de `registrar_traslado` devolvía siempre
-- `CAPACIDAD_EXCEDIDA` cuando el destino estaba lleno. La especificación pide
-- `CONFLICTO_OCUPACION` para el perdedor de dos operaciones simultáneas por la
-- última plaza.
--
-- Estrategia: se toma una lectura de ocupación ANTES de bloquear la fila del
-- espacio. Tras adquirir el bloqueo se recalcula la ocupación; si la plaza se
-- agotó entre ambas lecturas, el fallo se debe a una carrera y se devuelve
-- `CONFLICTO_OCUPACION`. Si ya estaba llena antes de esperar, se devuelve
-- `CAPACIDAD_EXCEDIDA`.
--
-- Idempotente: `create or replace function` no duplica objetos.

begin;

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

revoke all on function public.registrar_traslado(
  integer, integer, text, text, timestamptz, integer
) from public, anon;
grant execute on function public.registrar_traslado(
  integer, integer, text, text, timestamptz, integer
) to authenticated;

commit;
