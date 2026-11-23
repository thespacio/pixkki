# Edición de datos del animal

## Objetivo

Permitir que un usuario con `animals.edit` corrija los datos del expediente de un
animal desde la ficha rápida, sin recurrir a flujos clínicos ni a cambios de
base de datos.

## Alcance

### Campos editables

- Identificación: `nombre`, `especie`, `raza`, `sexo`, `edadEstimada`, `peso`,
  `color`, `tamano`, `microchip`, `temperamento`.
- Ingreso: `procedencia`, `rasgosFisicos`, `estadoInicial`.
- Rescate: `lugarRescate`, `fechaRescate`, `situacionRescate`,
  `rescatistaNombre`, `rescatistaContacto`.
- Notas: `observaciones`.
- Ubicación: `idEspacio` (validado contra el albergue del animal).
- Salud declarativa: `vacunado`, `desparasitado`.

### Campos excluidos

| Campo | Motivo |
|---|---|
| `enCuarentena` | Solo se libera con el alta médica (RF2.4). |
| `disponibleAdopcion` | Pasa por el *gatekeeper* de adopción (RF4.2). |
| `idEstado` | Lo gestionan los flujos clínicos. |
| `idRefugio` | Operación multitenant distinta; no se mueve desde el expediente. |
| `activo` | La baja se realiza con `deleteAnimalAction` (borrado lógico). |
| `esterilizado` | Lo actualiza el historial de cirugías (Requerimiento 04). |

## Comportamiento

1. La ficha rápida muestra el botón **Editar datos** solo si el usuario tiene
   `animals.edit`.
2. El botón abre un `Sheet` con el formulario del expediente en modo edición.
3. El formulario reutiliza `createAnimalFormSchema` y `AnimalForm`; no existe un
   schema Zod duplicado.
4. Al guardar, `toUpdateAnimalInput` construye un DTO parcial:
   - Un campo vacío viaja como `null` y limpia la columna.
   - Un campo ausente (`undefined`) conserva el valor actual.
5. `updateAnimalAction` vuelve a validar con `UpdateAnimalSchema`, aplica
   `animals.edit` y delega en `AnimalService.update`.
6. La respuesta devuelve el `Animal` actualizado y la ficha abierta se refresca
   al instante; además se revalida `/animales`.

## Reglas de negocio

- El espacio debe existir y pertenecer al albergue del animal.
- Un microchip no puede repetirse entre animales activos.
- Un usuario sin `allShelters` solo puede editar animales de su albergue.
- Los errores se muestran en español, sin exponer detalles internos.

## Fuera de alcance

- Edición desde `/animales/[id]/ficha-clinica`.
- Cambio de albergue.
- Edición de cuarentena, disponibilidad de adopción, estado clínico y
  esterilización.
- Auditoría o historial de cambios del expediente.
