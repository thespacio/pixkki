// app/(protected)/(dashboard)/animals/page.tsx

import { CreateAnimalModal } from "@/modules/animals/components/CreateAnimalModal";
import { AnimalsTable } from "@/modules/animals/components/AnimalsTable";
import {createAnimalService} from "@/modules/animals/factories/create-animal-service";
import {createSpaceService} from "@/modules/spaces/factories/factories";
import {getCurrentUser} from "@/modules/auth";
import {createAnimalStateService} from "@/modules/animals/factories/create-animal-state-service";

export default async function AnimalsPage() {
  const user = await getCurrentUser();


  const [animalService, estadoService, spaceService] = await Promise.all([
    createAnimalService(),
    createAnimalStateService(),
    createSpaceService(),
  ]);

  const [animales, estados, espacios] = await Promise.all([
    animalService.listByRefugio(user.shelterId),
    estadoService.listAll(),
    spaceService.getSpacesByShelter(user.shelterId),
  ]);

  return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Animales</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {animales.length} animal{animales.length !== 1 ? "es" : ""} registrado
              {animales.length !== 1 ? "s" : ""}
            </p>
          </div>
          <CreateAnimalModal estados={estados} espacios={espacios} />
        </div>

        <AnimalsTable animales={animales} />
      </div>
  );
}