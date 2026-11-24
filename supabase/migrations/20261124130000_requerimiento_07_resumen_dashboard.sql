-- Requerimiento 07 — RF7.5: resumen compacto para el panel.
--
-- Expone una sola función de lectura con los indicadores que consume
-- `/dashboard`. El cálculo vive en PostgreSQL (security invoker + RLS) y el
-- service solo valida, autoriza y mapea. No se crean tablas ni snapshots.
--
-- Idempotente: puede ejecutarse más de una vez sin duplicar objetos.

begin;

-- Índices de apoyo para los agregados del resumen.
create index if not exists reporte_resumen_animal_refugio_activo_idx
  on public.animal (id_refugio, activo, deleted_at);

create index if not exists reporte_resumen_animal_refugio_adopcion_idx
  on public.animal (id_refugio, fecha_adopcion);

create index if not exists reporte_resumen_espacio_refugio_disponible_idx
  on public.espacio (id_refugio, disponible);

create index if not exists reporte_resumen_donacion_refugio_fecha_idx
  on public.donacion (id_refugio, fecha_donacion);

create index if not exists reporte_resumen_lote_refugio_stock_idx
  on public.inventario_lote (id_refugio, activo, stock_actual);

-- ---------------------------------------------------------------------------
-- reporte_resumen
--   p_id_refugio: omitir o NULL = agregado global (solo Superadmin; RLS lo
--                 autoriza). Los parámetros son opcionales porque el generador
--                 de tipos de Supabase no modela la nulabilidad de argumentos
--                 SQL: omitir el tenant evita tener que forzar un `null` que no
--                 existe en los tipos generados.
--   p_desde / p_hasta: inclusivos. Si se omiten, mes en curso hasta hoy.
-- ---------------------------------------------------------------------------

create or replace function public.reporte_resumen(
  p_id_refugio integer default null,
  p_desde date default null,
  p_hasta date default null
) returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
 with parametros as (
   select
     coalesce(p_desde, date_trunc('month', current_date)::date) as desde,
     coalesce(p_hasta, current_date) as hasta
 ),
 indicadores as (
   select
     p.desde,
     p.hasta,
     (
       select count(*)
       from public.animal a
       where a.activo
         and a.deleted_at is null
         and (p_id_refugio is null or a.id_refugio = p_id_refugio)
     ) as poblacion_activa,
     (
       select count(*)
       from public.animal a
       where a.fecha_adopcion is not null
         and a.fecha_adopcion >= p.desde
         and a.fecha_adopcion <= p.hasta
         and (p_id_refugio is null or a.id_refugio = p_id_refugio)
     ) as adopciones_periodo,
     (
       select count(*)
       from public.donacion d
       where d.fecha_donacion::date >= p.desde
         and d.fecha_donacion::date <= p.hasta
         and (p_id_refugio is null or d.id_refugio = p_id_refugio)
     ) as donaciones_periodo,
     (
       select count(*)
       from public.animal a
       where a.activo
         and a.deleted_at is null
         and a.en_cuarentena
         and (p_id_refugio is null or a.id_refugio = p_id_refugio)
     ) as en_cuarentena
   from parametros p
 ),
 capacidad as (
   select
     i.*,
     coalesce((
       select sum(e.capacidad)
       from public.espacio e
       where e.disponible
         and (p_id_refugio is null or e.id_refugio = p_id_refugio)
     ), 0)::integer as capacidad_total,
     (
       select count(*)
       from public.animal a
       join public.espacio e on e.id_espacio = a.id_espacio
       where a.activo
         and a.deleted_at is null
         and e.disponible
         and (p_id_refugio is null or a.id_refugio = p_id_refugio)
     ) as ocupacion_total
   from indicadores i
 ),
 alertas_inventario as (
   select
     (
       select count(*)
       from public.inventario_lote l
       where l.activo
         and l.stock_actual <= l.stock_minimo
         and (p_id_refugio is null or l.id_refugio = p_id_refugio)
     ) as stock_bajo,
     (
       select count(*)
       from public.inventario_lote l
       where l.activo
         and l.stock_actual > 0
         and l.fecha_caducidad is not null
         and l.fecha_caducidad < current_date
         and (p_id_refugio is null or l.id_refugio = p_id_refugio)
     ) as lotes_vencidos
 )
 select jsonb_build_object(
   'periodo', jsonb_build_object(
     'desde', to_char(c.desde, 'YYYY-MM-DD'),
     'hasta', to_char(c.hasta, 'YYYY-MM-DD'),
     'zona_horaria', 'America/Mexico_City'
   ),
   'poblacion_activa', c.poblacion_activa,
   'capacidad_total', c.capacidad_total,
   'porcentaje_ocupacion',
     case
       when c.capacidad_total > 0
         then round((c.ocupacion_total::numeric * 100 / c.capacidad_total::numeric), 1)
       else null
     end,
   'adopciones_periodo', c.adopciones_periodo,
   'donaciones_periodo', c.donaciones_periodo,
   'stock_bajo', a.stock_bajo,
   'lotes_vencidos', a.lotes_vencidos,
   'alertas', jsonb_build_object(
     'sobrecupo', exists (
       select 1
       from public.espacio e
       where e.disponible
         and (p_id_refugio is null or e.id_refugio = p_id_refugio)
         and (
           select count(*)
           from public.animal a
           where a.id_espacio = e.id_espacio
             and a.activo
             and a.deleted_at is null
         ) > e.capacidad
     ),
     'cuarentena', c.en_cuarentena
   ),
   'limitaciones',
     case
       when c.capacidad_total = 0
         then jsonb_build_array(
           'No hay espacios disponibles; el porcentaje de ocupación no es calculable.'
         )
       else '[]'::jsonb
     end
 )
 from capacidad c
 cross join alertas_inventario a;
$$;

revoke all on function public.reporte_resumen(integer, date, date) from public, anon;
grant execute on function public.reporte_resumen(integer, date, date) to authenticated;

-- ---------------------------------------------------------------------------
-- Permisos RF7.8 (solo el resumen se usa en esta entrega).
-- ---------------------------------------------------------------------------

insert into public.permiso (nombre_permiso, descripcion)
select v.nombre_permiso, v.descripcion
from (
  values
    ('reports.view', 'Consultar resumen y reportes operativos del refugio'),
    ('reports.export', 'Exportar reportes operativos a CSV')
) as v(nombre_permiso, descripcion)
where not exists (
  select 1 from public.permiso p where p.nombre_permiso = v.nombre_permiso
);

insert into public.rol_permiso (id_rol, id_permiso)
select r.id_rol, p.id_permiso
from public.rol r
join public.permiso p on p.nombre_permiso = 'reports.view'
where lower(r.nombre_rol) in (
  'administrador', 'coordinador', 'veterinario', 'operador', 'superadmin'
)
and not exists (
  select 1 from public.rol_permiso rp
  where rp.id_rol = r.id_rol and rp.id_permiso = p.id_permiso
);

insert into public.rol_permiso (id_rol, id_permiso)
select r.id_rol, p.id_permiso
from public.rol r
join public.permiso p on p.nombre_permiso = 'reports.export'
where lower(r.nombre_rol) in ('administrador', 'coordinador', 'superadmin')
and not exists (
  select 1 from public.rol_permiso rp
  where rp.id_rol = r.id_rol and rp.id_permiso = p.id_permiso
);

insert into public.rol_permiso (id_rol, id_permiso)
select r.id_rol, p.id_permiso
from public.rol r
join public.permiso p on p.nombre_permiso = 'reports.export'
where lower(r.nombre_rol) in ('veterinario', 'operador')
and not exists (
  select 1 from public.rol_permiso rp
  where rp.id_rol = r.id_rol and rp.id_permiso = p.id_permiso
);

commit;
