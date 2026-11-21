-- Requerimiento 02 — control clínico y cuarentena.
--
-- El catálogo `animal_estado` no tenía seed en las migraciones y
-- `animal.id_estado` es obligatorio. Sin la fila "Cuarentena" el alta de
-- animales no puede cumplir la regla RF1.1/RF2.4 de ingresar siempre en
-- cuarentena.
--
-- Es idempotente: si el entorno ya tiene el estado, no lo duplica.

insert into public.animal_estado (nombre_estado, descripcion)
values ('Cuarentena', 'Estado de aislamiento obligatorio al ingreso')
on conflict (nombre_estado) do nothing;
