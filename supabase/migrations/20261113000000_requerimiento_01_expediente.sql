-- ============================================================================
-- Migración: Requerimiento 01 — Épica 1: Ingresos y Expedientes
-- Fecha: 2026-11-12
--
-- Objetivo:
--   * Asegurar las columnas de la ficha de rescate en public.animal.
--   * Extender public.fotografia para la galería del expediente (RF1.2):
--     public_id de Cloudinary, miniatura 300x300 y orden de presentación.
--   * Restringir las categorías de public.diagnostico_veterinario (RF1.3).
--
-- La base real usa `fotografia` y `diagnostico_veterinario`; no se crean
-- tablas nuevas. Es idempotente: puede ejecutarse más de una vez.
--
-- Cómo aplicarla:
--   Supabase Dashboard > SQL Editor > New query > pegar este archivo > Run.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. Ficha de rescate del animal (misma definición que 20261024_animal_datos_rescate)
-- ---------------------------------------------------------------------------
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

create unique index if not exists animal_microchip_unico
  on public.animal (microchip)
  where microchip is not null and deleted_at is null;

-- ---------------------------------------------------------------------------
-- 2. Galería multimedia del expediente (public.fotografia)
-- ---------------------------------------------------------------------------
alter table public.fotografia
  add column if not exists public_id     text,
  add column if not exists url_thumbnail text,
  add column if not exists orden         integer not null default 0;

comment on column public.fotografia.public_id     is 'Identificador del archivo en Cloudinary (necesario para eliminarlo)';
comment on column public.fotografia.url_thumbnail is 'URL de la transformación 300x300 de Cloudinary';
comment on column public.fotografia.orden         is 'Orden de presentación dentro de la galería del expediente';

-- Máximo una imagen principal (portada) por expediente.
create unique index if not exists fotografia_principal_unica
  on public.fotografia (id_animal)
  where es_principal;

create index if not exists fotografia_animal_orden_idx
  on public.fotografia (id_animal, orden);

-- ---------------------------------------------------------------------------
-- 3. Categorías exclusivas del diagnóstico veterinario (RF1.3)
-- ---------------------------------------------------------------------------
-- NOT VALID evita fallar si ya existen filas históricas con otros valores,
-- pero sí valida todas las inserciones y actualizaciones nuevas.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'diagnostico_veterinario_estado_general_check'
  ) then
    alter table public.diagnostico_veterinario
      add constraint diagnostico_veterinario_estado_general_check
      check (estado_general in ('Crítico', 'Delicado', 'Estable', 'Sano'))
      not valid;
  end if;
end $$;

comment on column public.diagnostico_veterinario.estado_general is
  'Categoría exclusiva del diagnóstico de ingreso: Crítico, Delicado, Estable o Sano';

-- Fuerza a PostgREST a recargar el esquema.
notify pgrst, 'reload schema';

commit;

-- ============================================================================
-- Verificación (opcional)
--
--   select column_name from information_schema.columns
--   where table_schema = 'public' and table_name = 'fotografia'
--     and column_name in ('public_id', 'url_thumbnail', 'orden');
--
--   select conname from pg_constraint
--   where conname = 'diagnostico_veterinario_estado_general_check';
-- ============================================================================
