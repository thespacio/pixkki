-- F-SHELTER-04: Dirección completa del refugio
-- Agrega calle, número, colonia y código postal a la tabla refugio.
-- Campos opcionales (nullable) para no romper registros existentes.
--
-- Aplicar en Supabase (SQL Editor o `supabase db push`) y luego
-- regenerar los tipos con `npm run db:types`.

alter table public.refugio
    add column if not exists calle text,
    add column if not exists numero text,
    add column if not exists colonia text,
    add column if not exists codigo_postal text;

comment on column public.refugio.calle is 'Calle de la dirección del refugio';
comment on column public.refugio.numero is 'Número exterior/interior de la dirección';
comment on column public.refugio.colonia is 'Colonia o barrio de la dirección';
comment on column public.refugio.codigo_postal is 'Código postal de 5 dígitos';
