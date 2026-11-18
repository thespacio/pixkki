-- Ajuste de firmas RPC (Requerimiento 05): parámetros opcionales con default.
-- Permite omitir/null en campos opcionales sin casts desde el cliente.

begin;

create or replace function public.publicar_perfil_adopcion(
  p_id_animal integer,
  p_descripcion_publica text default null,
  p_publicado boolean default false,
  p_id_usuario integer default null
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

create or replace function public.registrar_solicitud_adopcion(
  p_id_animal integer,
  p_nombre_completo text,
  p_telefono text,
  p_correo text,
  p_direccion text,
  p_tiene_otras_mascotas boolean,
  p_tiene_ninos boolean,
  p_espacio_techado boolean,
  p_tiempo_solo_horas integer default null,
  p_experiencia_mascotas text default null,
  p_motivo_adopcion text default null,
  p_comentarios_generales text default null,
  p_acepta_politica_privacidad boolean default false,
  p_declara_mayor_edad boolean default false
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

create or replace function public.cambiar_estado_solicitud_adopcion(
  p_id_solicitud integer,
  p_estado_solicitud text,
  p_motivo text default null,
  p_id_usuario integer default null
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

create or replace function public.completar_adopcion(
  p_id_solicitud integer,
  p_fecha_adopcion date,
  p_observaciones text default null,
  p_id_usuario integer default null
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
