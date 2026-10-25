// app/(protected)/(dashboard)/animals/page.tsx

import { ShieldAlert } from "lucide-react";
import { CreateAnimalModal } from "@/modules/animals/components/CreateAnimalModal";
import { AnimalsTable } from "@/modules/animals/components/AnimalsTable";
import { createAnimalService } from "@/modules/animals/factories/create-animal-service";
import { createAnimalStateService } from "@/modules/animals/factories/create-animal-state-service";
import { ANIMAL_PERMISSIONS, getAnimalAccess } from "@/modules/animals/access";
import type { ShelterOption } from "@/modules/animals/components/AnimalFilterBar";
import { createSpaceService } from "@/modules/spaces/factories/factories";
import { createShelterService } from "@/modules/shelters";
import { getCurrentUser } from "@/modules/auth";

export default async function AnimalsPage() {
  const user = await getCurrentUser();

  if (!user.permissions.includes(ANIMAL_PERMISSIONS.view)) {
    return (
      <div className="p-8 max-w-6xl mx-auto text-center py-24 text-muted-foreground">
        <ShieldAlert size={40} className="mx-auto mb-3 opacity-40" aria-hidden="true" />
        <p className="font-medium text-foreground">No tienes permiso para ver los animales</p>
        <p className="text-sm mt-1">Pide acceso a un administrador si lo necesitas.</p>
      </div>
    );
  }

  const access = getAnimalAccess(user);
  const canCreate = user.permissions.includes(ANIMAL_PERMISSIONS.create);
  const canEdit = user.permissions.includes(ANIMAL_PERMISSIONS.edit);
  const canDelete = user.permissions.includes(ANIMAL_PERMISSIONS.delete);

  const [animalService, estadoService, spaceService, shelterService] = await Promise.all([
    createAnimalService(),
    createAnimalStateService(),
    createSpaceService(),
    createShelterService(),
  ]);

  // Las cuatro consultas son independientes: se piden a la vez (un solo viaje a la
  // base de datos en vez de cuatro seguidos).
  const [animales, estados, espacios, refugios] = await Promise.all([
    animalService.listVisible(access),
    estadoService.listAll(),
    // El superadmin elige albergue en el formulario, así que necesita los espacios
    // de todos; el resto solo los de su propio albergue.
    access.allShelters
      ? spaceService.getSpaces()
      : spaceService.getSpacesByShelter(user.shelterId),
    // Solo el superadmin puede asociar animales a cualquier albergue activo.
    access.allShelters
      ? shelterService
          .findAll({ activo: true }, user)
          .then(({ data }): ShelterOption[] =>
            data.map((s) => ({ id: s.id, nombre: s.nombre_albergue })),
          )
      : Promise.resolve<ShelterOption[]>([]),
  ]);

  return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Animales</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {animales.length} animal{animales.length !== 1 ? "es" : ""} registrado
              {animales.length !== 1 ? "s" : ""}
              {access.allShelters ? " en todos los albergues" : ""}
            </p>
          </div>
          {canCreate && (
            <CreateAnimalModal estados={estados} espacios={espacios} refugios={refugios} />
          )}
        </div>

        <AnimalsTable
          animales={animales}
          estados={estados}
          refugios={refugios}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      </div>
  );
}
