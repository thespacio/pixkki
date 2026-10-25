-- ============================================================================
-- Sección "Eventos" (calendario de Google Calendar)
--
-- Solo agrega el permiso events.view y lo asigna a los roles. Los eventos viven
-- en Google Calendar, no en esta base de datos. Es idempotente.
-- ============================================================================

insert into public.permiso (nombre_permiso, descripcion)
select 'events.view', 'Ver el calendario de eventos'
where not exists (
  select 1 from public.permiso where nombre_permiso = 'events.view'
);

insert into public.rol_permiso (id_rol, id_permiso)
select r.id_rol, p.id_permiso
from public.rol r
join public.permiso p on p.nombre_permiso = 'events.view'
where r.nombre_rol in ('Administrador', 'Veterinario', 'Superadmin')
  and not exists (
    select 1 from public.rol_permiso rp
    where rp.id_rol = r.id_rol and rp.id_permiso = p.id_permiso
  );

-- Verificación:
--   select r.nombre_rol from rol_permiso rp
--   join rol r on r.id_rol = rp.id_rol
--   join permiso p on p.id_permiso = rp.id_permiso
--   where p.nombre_permiso = 'events.view';   -- 3 filas
