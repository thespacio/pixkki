# Capacidad de espacios y designación de cuarentena

## Objetivo

Impedir que un espacio supere su capacidad al dar de alta o editar animales, y
hacer explícito qué espacios son de cuarentena.

## Problema

`registrar_traslado` ya validaba cupo y cuarentena, pero las altas y ediciones
del expediente escriben directamente en `animal` (Server Actions y API v1) y no
comprobaban la capacidad. Un espacio podía quedar en `5/4`.

## Cambios

### Base de datos

- Migración `20261123120000_requerimiento_03_capacidad_alta_expediente.sql`.
- Trigger `trg_animal_validar_capacidad` sobre `INSERT` y `UPDATE` de
  `id_espacio`, `activo` y `deleted_at`.
- Bloquea la fila del espacio (`SELECT ... FOR UPDATE`) antes de contar, por lo
  que dos altas concurrentes por la última plaza se serializan y solo una
  completa.
- Solo ocupan plaza los animales con `activo = true` y `deleted_at IS NULL`.
- Una edición que no mueve al animal no se bloquea aunque el espacio esté lleno.
- El error de capacidad usa `CAPACIDAD_EXCEDIDA` y se traduce en el repositorio
  a `CapacidadExcedidaError` (mensaje en español, HTTP 409).

> La migración corrige el futuro, no los datos históricos. Un espacio ya
> sobrecupado se marca con el badge **Sobrecupo**; hay que trasladar animales
> con el flujo de traslados existente.

### Dominio

- `AnimalService` recibe el puerto `SpaceOccupancyPort` de `spaces` (inyectado
  por `createAnimalService`) y valida antes de escribir:
  - el espacio existe en el albergue, está disponible y tiene cupo;
  - si el animal está en cuarentena (todo ingreso lo está), el espacio debe ser
    de tipo `cuarentena`.

### Interfaz

- `SpaceForm` incluye la casilla **Espacio de cuarentena**, que escribe el campo
  canónico `tipo: "cuarentena"` (no añade columnas ni duplica schemas).
- `SpaceCard` muestra el badge **Cuarentena** y avisa de sobrecupo.
- `AnimalForm` solo ofrece espacios de cuarentena con cupo en el alta y mientras
  el paciente esté en cuarentena; en edición conserva visible el espacio actual
  aunque esté lleno.
- `/animales` pasa espacios con ocupación calculada al formulario.

## Fuera de alcance

- Corregir automáticamente ocupaciones ya excedidas.
- Cambiar el tipo de un espacio con animales asignados sin revisión.
- Modificar la RPC `registrar_traslado`, que ya era correcta.
