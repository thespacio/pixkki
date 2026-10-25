-- ============================================================================
-- Ubicación del albergue (Google Maps)
--
-- Agrega a `refugio` la dirección elegida en el mapa y sus coordenadas.
-- Son opcionales: los albergues existentes siguen funcionando sin ubicación.
-- Es idempotente (se puede ejecutar más de una vez).
-- ============================================================================

alter table public.refugio add column if not exists direccion text;
alter table public.refugio add column if not exists latitud   numeric(9, 6);
alter table public.refugio add column if not exists longitud  numeric(9, 6);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'refugio_direccion_largo') then
    alter table public.refugio
      add constraint refugio_direccion_largo check (direccion is null or char_length(direccion) <= 300);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'refugio_coordenadas_validas') then
    -- Rangos reales de latitud/longitud y siempre las dos juntas o ninguna.
    alter table public.refugio
      add constraint refugio_coordenadas_validas check (
        (latitud is null and longitud is null)
        or (latitud between -90 and 90 and longitud between -180 and 180)
      );
  end if;
end $$;

notify pgrst, 'reload schema';

-- Verificación:
--   select column_name from information_schema.columns
--   where table_name = 'refugio' and column_name in ('direccion', 'latitud', 'longitud');   -- 3 filas
