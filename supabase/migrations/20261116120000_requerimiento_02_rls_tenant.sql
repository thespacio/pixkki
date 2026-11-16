-- ============================================================================
-- Requerimiento 02 — Corrección de RLS multitenant
-- Fecha: 2026-11-16
--
-- La migración 20261115120000 ya estaba registrada como aplicada en el
-- proyecto remoto con políticas `using (true)`, que no aíslan por refugio.
-- Editar un archivo ya aplicado no vuelve a ejecutarlo, por lo que la
-- corrección se entrega aquí como migración nueva e idempotente.
--
-- Aplica sobre: chequeos_medicos, chequeo_sintomas y altas_cuarentena.
-- ============================================================================

begin;

-- Las funciones son SECURITY DEFINER para leer `usuario` sin quedar sujetas a
-- su propio RLS y evitar recursión.
create or replace function public.current_refugio_id()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select u.id_refugio
  from public.usuario u
  where u.auth_user_id = auth.uid()
    and u.activo
  limit 1;
$$;

create or replace function public.current_user_is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.usuario u
    join public.rol r on r.id_rol = u.rol
    where u.auth_user_id = auth.uid()
      and u.activo
      and r.nombre_rol = 'Superadmin'
  );
$$;

revoke all on function public.current_refugio_id() from public, anon;
revoke all on function public.current_user_is_superadmin() from public, anon;
grant execute on function public.current_refugio_id() to authenticated;
grant execute on function public.current_user_is_superadmin() to authenticated;

alter table public.chequeos_medicos enable row level security;
alter table public.chequeo_sintomas enable row level security;
alter table public.altas_cuarentena enable row level security;

revoke all on public.chequeos_medicos from anon;
revoke all on public.chequeo_sintomas from anon;
revoke all on public.altas_cuarentena from anon;

drop policy if exists chequeos_medicos_tenant_select on public.chequeos_medicos;
drop policy if exists chequeos_medicos_tenant_write on public.chequeos_medicos;
drop policy if exists chequeos_medicos_tenant on public.chequeos_medicos;
create policy chequeos_medicos_tenant on public.chequeos_medicos
  for all to authenticated
  using (
    public.current_user_is_superadmin()
    or id_refugio = public.current_refugio_id()
  )
  with check (
    public.current_user_is_superadmin()
    or id_refugio = public.current_refugio_id()
  );

drop policy if exists chequeo_sintomas_all on public.chequeo_sintomas;
drop policy if exists chequeo_sintomas_tenant on public.chequeo_sintomas;
create policy chequeo_sintomas_tenant on public.chequeo_sintomas
  for all to authenticated
  using (
    exists (
      select 1
      from public.chequeos_medicos c
      where c.id_chequeo = chequeo_sintomas.id_chequeo
        and (
          public.current_user_is_superadmin()
          or c.id_refugio = public.current_refugio_id()
        )
    )
  )
  with check (
    exists (
      select 1
      from public.chequeos_medicos c
      where c.id_chequeo = chequeo_sintomas.id_chequeo
        and (
          public.current_user_is_superadmin()
          or c.id_refugio = public.current_refugio_id()
        )
    )
  );

drop policy if exists altas_cuarentena_tenant_select on public.altas_cuarentena;
drop policy if exists altas_cuarentena_tenant_write on public.altas_cuarentena;
drop policy if exists altas_cuarentena_tenant on public.altas_cuarentena;
create policy altas_cuarentena_tenant on public.altas_cuarentena
  for all to authenticated
  using (
    public.current_user_is_superadmin()
    or id_refugio = public.current_refugio_id()
  )
  with check (
    public.current_user_is_superadmin()
    or id_refugio = public.current_refugio_id()
  );

commit;
