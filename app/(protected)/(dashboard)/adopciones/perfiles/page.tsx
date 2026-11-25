import { getCurrentUser } from "@/modules/auth";
import { ADOPTION_PERMISSIONS } from "@/modules/adoptions/access";
import { ANIMAL_PERMISSIONS, getAnimalAccess } from "@/modules/animals/access";
import { createAnimalService } from "@/modules/animals/factories/create-animal-service";
import { createProfileService } from "@/modules/adoptions/factories/create-profile-service";
import { PerfilesView } from "@/modules/adoptions/components/perfiles-view";
import { PerfilesQuerySchema } from "@/modules/adoptions/validators/public-profile.validators";
import type { PerfilesQueryDTO } from "@/modules/adoptions/dtos/public-profile.dto";

type PageProps = {
    searchParams?: Record<string, string | string[] | undefined>;
};

function first(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}

export default async function PerfilesAdopcionPage({ searchParams }: PageProps) {
    const user = await getCurrentUser();
    if (!user.permissions.includes(ADOPTION_PERMISSIONS.view)) {
        return (
            <div className="p-6">
                <p className="text-sm text-muted-foreground">
                    No tienes permiso para ver perfiles de adopción.
                </p>
            </div>
        );
    }

    const puedeEditarAnimales = user.permissions.includes(ANIMAL_PERMISSIONS.edit);
    const puedePublicar = user.permissions.includes(ADOPTION_PERMISSIONS.publish);
    const puedeHabilitar = puedePublicar && puedeEditarAnimales;

    const queryCruda = {
        q: first(searchParams?.q),
        especie: first(searchParams?.especie),
        estado: first(searchParams?.estado),
        animal: first(searchParams?.animal),
        page: first(searchParams?.page),
    };
    const parseo = PerfilesQuerySchema.safeParse(queryCruda);
    const filtros: PerfilesQueryDTO = parseo.success
        ? parseo.data
        : PerfilesQuerySchema.parse({});

    // G-01: el listado de animales ya viene filtrado por tenant. El servicio de
    // perfiles compone los datos por lotes y pagina sobre esa proyección.
    const [animalService, profileService] = await Promise.all([
        createAnimalService(),
        createProfileService(),
    ]);
    const access = getAnimalAccess(user);
    const animales = await animalService.listVisible(access);
    const data = await profileService.list(animales, filtros, user);

    return (
        <PerfilesView
            data={data}
            filtros={filtros}
            puedePublicar={puedePublicar}
            puedeHabilitar={puedeHabilitar}
            puedeEditarAnimales={puedeEditarAnimales}
        />
    );
}
