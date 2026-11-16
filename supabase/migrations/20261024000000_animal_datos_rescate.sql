-- ============================================================================
-- Migración: datos de rescate y ficha completa del animal
-- Fecha: 2026-10-24
--
-- Agrega columnas OPCIONALES a public.animal para registrar animales rescatados
-- de la calle. No modifica ni elimina datos existentes: las filas actuales
-- quedan con NULL / false en las columnas nuevas.
--
-- Cómo aplicarla:
--   Supabase Dashboard > SQL Editor > New query > pegar este archivo > Run.
--
-- Es idempotente: se puede ejecutar más de una vez sin error (usa IF NOT EXISTS).
-- ============================================================================

alter table public.animal
  add column if not exists color               text,
  add column if not exists tamano              text,
  add column if not exists microchip           text,
  add column if not exists temperamento        text,
  add column if not exists vacunado            boolean not null default false,
  add column if not exists desparasitado       boolean not null default false,
  add column if not exists lugar_rescate       text,
  add column if not exists fecha_rescate       date,
  add column if not exists situacion_rescate   text,
  add column if not exists rescatista_nombre   text,
  add column if not exists rescatista_contacto text,
  add column if not exists observaciones       text;

-- Valores permitidos para tamaño (NULL sigue siendo válido).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'animal_tamano_check'
  ) then
    alter table public.animal
      add constraint animal_tamano_check
      check (tamano is null or tamano in ('Pequeño', 'Mediano', 'Grande'));
  end if;
end $$;

-- El microchip, cuando existe, no debe repetirse entre animales activos.
create unique index if not exists animal_microchip_unico
  on public.animal (microchip)
  where microchip is not null and deleted_at is null;

comment on column public.animal.lugar_rescate       is 'Dirección o referencia donde se encontró al animal';
comment on column public.animal.fecha_rescate       is 'Fecha en que fue rescatado';
comment on column public.animal.situacion_rescate   is 'Abandonado, Extraviado, Maltratado, Nacido en la calle, Accidentado u Otro';
comment on column public.animal.rescatista_nombre   is 'Persona que lo reportó o entregó';
comment on column public.animal.rescatista_contacto is 'Teléfono o correo de quien lo reportó';

-- Fuerza a la API de Supabase (PostgREST) a recargar el esquema para que
-- reconozca las columnas nuevas de inmediato.
notify pgrst, 'reload schema';

-- ============================================================================
-- Verificación (opcional): debe listar las 12 columnas nuevas.
--
--   select column_name, data_type
--   from information_schema.columns
--   where table_schema = 'public' and table_name = 'animal'
--     and column_name in ('color','tamano','microchip','temperamento','vacunado',
--       'desparasitado','lugar_rescate','fecha_rescate','situacion_rescate',
--       'rescatista_nombre','rescatista_contacto','observaciones')
--   order by column_name;
-- ============================================================================
