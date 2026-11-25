import type { UpsertPerfilAdopcionBody } from "../validators/public-profile.validators";

export type UpsertPerfilAdopcionDTO = UpsertPerfilAdopcionBody;

export type {
    PerfilFoto as PerfilFotoDTO,
    AnimalParaPerfil as AnimalParaPerfilDTO,
    PerfilAdopcionRead as PerfilAdopcionReadDTO,
    EstadoPerfilVisible as EstadoPerfilVisibleDTO,
    FiltroEstadoPerfil as FiltroEstadoPerfilDTO,
    PerfilesQuery as PerfilesQueryDTO,
    PerfilFila as PerfilFilaDTO,
    PerfilesList as PerfilesListDTO,
} from "../validators/public-profile.validators";
