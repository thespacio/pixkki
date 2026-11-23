-- Requerimiento 03 — RF3.1 / regla 3 y 11.
--
-- El RPC `registrar_traslado` ya evita que un traslado exceda la capacidad,
-- pero las altas y ediciones del expediente escriben directamente en `animal`
-- (Server Actions y API v1) y podían dejar espacios en 5/4.
--
-- Esta restricción se aplica en la base de datos, dentro de la misma
-- transacción de la escritura, y bloquea la fila del espacio destino antes de
-- contar: dos operaciones concurrentes por la última plaza se serializan y
-- solo una puede completarse.
--
-- No corrige datos históricos: si un espacio ya está sobrecupado, hay que
-- trasladar animales a otro espacio con el flujo de traslados existente.

create or replace function public.validar_capacidad_espacio_animal()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_capacidad integer;
    v_ocupacion integer;
begin
    -- Una edición que no mueve al animal ni cambia su condición de ocupante
    -- no altera la ocupación: no debe bloquearse aunque el espacio esté lleno.
    if tg_op = 'UPDATE'
       and NEW.id_espacio is not distinct from OLD.id_espacio
       and OLD.activo is not distinct from true
       and OLD.deleted_at is null then
        return NEW;
    end if;

    -- Los animales inactivos o de baja lógica no ocupan plaza.
    if NEW.activo is distinct from true or NEW.deleted_at is not null then
        return NEW;
    end if;

    -- FOR UPDATE serializa las altas concurrentes sobre el mismo espacio.
    select capacidad
      into v_capacidad
      from public.espacio
     where id_espacio = NEW.id_espacio
       for update;

    if not found then
        raise exception using
            errcode = '23503',
            message = 'ESPACIO_NO_ENCONTRADO: El espacio seleccionado no existe.';
    end if;

    select count(*)::integer
      into v_ocupacion
      from public.animal
     where id_espacio = NEW.id_espacio
       and activo = true
       and deleted_at is null
       and (tg_op = 'INSERT' or id_animal <> NEW.id_animal);

    if v_ocupacion >= v_capacidad then
        raise exception using
            errcode = '23514',
            message = 'CAPACIDAD_EXCEDIDA: El espacio seleccionado no tiene cupo disponible.';
    end if;

    return NEW;
end;
$$;

drop trigger if exists trg_animal_validar_capacidad on public.animal;

create trigger trg_animal_validar_capacidad
before insert or update of id_espacio, activo, deleted_at on public.animal
for each row
execute function public.validar_capacidad_espacio_animal();
