import { z } from "zod";
import type { AuthenticatedUser } from "@/modules/auth/types";
import { isSuperadmin } from "@/modules/auth/authorization";
import { normalizeText } from "@/modules/animals/filters";
import { ADOPTION_PERMISSIONS } from "../access";
import { RolSinPermisoError } from "../errors";
import { AdoptionProfileRepository } from "../repositories/profile.repository";
import {
    UpsertPerfilAdopcionBodySchema,
    type UpsertPerfilAdopcionBody,
} from "../validators/public-profile.validators";
import {
    AnimalParaPerfilSchema,
    PerfilAdopcionReadSchema,
    PerfilesListSchema,
    PerfilesQuerySchema,
} from "../validators/public-profile.validators";
import type {
    EstadoPerfilVisibleDTO,
    PerfilFilaDTO,
    PerfilesListDTO,
} from "../dtos/public-profile.dto";
import {
    CODIGO_DESCRIPCION_INVALIDA,
    DESCRIPCION_MINIMA,
    evaluarElegibilidadPublicacion,
} from "./profile-eligibility";

/** Tamaño de lote para la composición G-01: evita el N+1 sin bloquear la página. */
const LOTE_SIZE = 25;
/** Tope de candidatos por consulta mientras no exista un endpoint de listado. */
const MAX_CANDIDATOS = 120;
const PAGE_SIZE = 12;

type Lote = Awaited<ReturnType<AdoptionProfileRepository["listByAnimalIds"]>>;
type PerfilBD = Lote["perfiles"][number];
type FotoBD = Lote["fotos"][number];

export class AdoptionProfileService {
    constructor(private readonly repository: AdoptionProfileRepository) {}

    private require(user: AuthenticatedUser, permission: string) {
        if (!user.permissions.includes(permission)) throw new RolSinPermisoError();
    }

    private scope(user: AuthenticatedUser): number | null {
        return isSuperadmin(user) ? null : (user.shelterId ?? 0);
    }

    async get(idAnimal: number, user: AuthenticatedUser) {
        this.require(user, ADOPTION_PERMISSIONS.view);
        return this.repository.getByAnimal(idAnimal, this.scope(user));
    }

    /**
     * Listado interno de perfiles (G-01). Los animales llegan validados desde
     * el módulo `animals`; esta capa aplica los filtros, calcula estados y
     * pagina. No accede a Supabase directamente: delega en el repositorio.
     */
    async list(animales: unknown, query: unknown, user: AuthenticatedUser): Promise<PerfilesListDTO> {
        this.require(user, ADOPTION_PERMISSIONS.view);

        const filtros = PerfilesQuerySchema.parse(query);
        const fuentes = z.array(AnimalParaPerfilSchema).parse(animales);
        const termino = normalizeText(filtros.q);

        const base = fuentes
            .filter((animal) => {
                if (filtros.especie && animal.especie !== filtros.especie) return false;
                if (!termino) return true;
                const texto = normalizeText(
                    [animal.nombre, animal.especie, animal.raza]
                        .filter((valor): valor is string => typeof valor === "string" && valor.length > 0)
                        .join(" "),
                );
                return texto.includes(termino);
            })
            .sort((a, b) => {
                const porNombre = (a.nombre ?? "").localeCompare(b.nombre ?? "", "es");
                return porNombre !== 0 ? porNombre : a.idAnimal - b.idAnimal;
            });

        const candidatos = base.slice(0, MAX_CANDIDATOS);
        const lotes: typeof candidatos[] = [];
        for (let inicio = 0; inicio < candidatos.length; inicio += LOTE_SIZE) {
            lotes.push(candidatos.slice(inicio, inicio + LOTE_SIZE));
        }

        const alcance = this.scope(user);
        const resultados = await Promise.allSettled(
            lotes.map((lote) =>
                this.repository.listByAnimalIds(
                    lote.map((animal) => animal.idAnimal),
                    alcance,
                ),
            ),
        );

        const perfilesPorAnimal = new Map<number, PerfilBD>();
        const fotosPorAnimal = new Map<number, FotoBD[]>();
        for (const resultado of resultados) {
            if (resultado.status !== "fulfilled") continue;
            for (const perfil of resultado.value.perfiles) {
                perfilesPorAnimal.set(perfil.id_animal, perfil);
            }
            for (const foto of resultado.value.fotos) {
                const lista = fotosPorAnimal.get(foto.id_animal) ?? [];
                lista.push(foto);
                fotosPorAnimal.set(foto.id_animal, lista);
            }
        }

        const filas: PerfilFilaDTO[] = candidatos.map((animal, indice) => {
            const lote = resultados[Math.floor(indice / LOTE_SIZE)];
            if (lote?.status === "rejected") {
                return {
                    animal,
                    perfil: null,
                    estados: [],
                    motivo: null,
                    error: "No pudimos cargar el perfil de este animal.",
                };
            }

            const perfilBD = perfilesPorAnimal.get(animal.idAnimal) ?? null;
            const fotosBD = fotosPorAnimal.get(animal.idAnimal) ?? [];
            const descripcion =
                typeof perfilBD?.descripcion_publica === "string"
                    ? perfilBD.descripcion_publica
                    : null;
            const elegibilidad = evaluarElegibilidadPublicacion({
                disponibleAdopcion: animal.disponibleAdopcion,
                enCuarentena: animal.enCuarentena,
                activo: animal.activo,
                eliminado: Boolean(animal.deletedAt),
                reservadoAdopcion: animal.reservadoAdopcion ?? false,
                descripcionPublica: descripcion,
                cantidadFotos: fotosBD.length,
            });

            const perfil = PerfilAdopcionReadSchema.parse({
                id_perfil_adopcion: perfilBD?.id_perfil_adopcion ?? null,
                id_animal: animal.idAnimal,
                id_refugio: perfilBD?.id_refugio ?? null,
                disponible_adopcion: animal.disponibleAdopcion,
                descripcion_publica: descripcion,
                publicado: perfilBD?.publicado ?? false,
                fecha_publicacion: perfilBD?.fecha_publicacion ?? null,
                fecha_despublicacion: perfilBD?.fecha_despublicacion ?? null,
                updated_at: perfilBD?.updated_at ?? null,
                puede_publicarse: elegibilidad.puedePublicarse,
                codigos: elegibilidad.codigos,
                bloqueos: elegibilidad.bloqueos,
                fotos: fotosBD.map((foto) => ({
                    id_fotografia: foto.id_fotografia,
                    url_archivo: foto.url_archivo,
                    url_thumbnail: foto.url_thumbnail,
                    es_principal: foto.es_principal,
                    orden: foto.orden,
                })),
            });

            const estados: EstadoPerfilVisibleDTO[] = [
                perfil.publicado ? "publicado" : "borrador",
            ];
            if (!perfil.publicado && !perfil.puede_publicarse) {
                estados.push("no-publicable");
            }
            if (perfil.fotos.length === 0) estados.push("sin-foto");
            if ((perfil.descripcion_publica?.trim().length ?? 0) < DESCRIPCION_MINIMA) {
                estados.push("sin-descripcion");
            }

            // `codigos` y `bloqueos` son paralelos. La longitud de la descripción
            // ya se comunica en el contador del editor, así que no se repite aquí.
            const motivos = perfil.bloqueos.filter(
                (_mensaje, indice) => perfil.codigos[indice] !== CODIGO_DESCRIPCION_INVALIDA,
            );

            return {
                animal,
                perfil,
                estados,
                motivo: motivos.length > 0 ? motivos.join(" · ") : null,
                error: null,
            };
        });

        const estadoFiltro = filtros.estado;
        const filtradas = filas.filter(
            (fila) => estadoFiltro === "todos" || fila.estados.includes(estadoFiltro),
        );
        const total = filtradas.length;
        const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
        const page = Math.min(filtros.page, totalPages);

        return PerfilesListSchema.parse({
            items: filtradas.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
            page,
            pageSize: PAGE_SIZE,
            total,
            totalPages,
            fallidos: filas.filter((fila) => fila.error !== null).length,
            candidatos: candidatos.length,
            limiteAplicado: base.length > candidatos.length,
        });
    }

    async upsert(idAnimal: number, body: unknown, user: AuthenticatedUser) {
        this.require(user, ADOPTION_PERMISSIONS.publish);
        const data: UpsertPerfilAdopcionBody = UpsertPerfilAdopcionBodySchema.parse(body);
        return this.repository.upsert(idAnimal, data, user.id);
    }
}
