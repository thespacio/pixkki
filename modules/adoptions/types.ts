export type PerfilAdopcion = {
    id_perfil_adopcion: number;
    id_animal: number;
    id_refugio: number;
    descripcion_publica: string | null;
    publicado: boolean;
    fecha_publicacion: string | null;
    fecha_despublicacion: string | null;
    puede_publicarse?: boolean;
    bloqueos?: string[];
    id_usuario_actualizacion?: number | null;
    fotos?: PerfilFoto[];
};

export type PerfilFoto = {
    id_fotografia: number;
    url_archivo: string;
    url_thumbnail: string | null;
    es_principal: boolean;
    orden: number | null;
};

export type CatalogItem = Record<string, unknown>;
export type PublicAnimalProfile = Record<string, unknown>;
export type PublicShelter = Record<string, unknown>;

export type SolicitudAdopcion = Record<string, unknown>;
export type EvaluacionAdopcion = Record<string, unknown>;