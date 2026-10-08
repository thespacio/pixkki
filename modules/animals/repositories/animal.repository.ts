import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateAnimalDTO } from "../dtos/create-animal.dto";
import type { UpdateAnimalDTO } from "../dtos/update-animal.dto";
import {Database} from "@/types/database";
import {Animal} from "@/modules/animals/types/animales.types";

type AnimalRow = Database["public"]["Tables"]["animal"]["Row"];
type AnimalInsert = Database["public"]["Tables"]["animal"]["Insert"];
type AnimalUpdate = Database["public"]["Tables"]["animal"]["Update"];

export class AnimalRepositoryError extends Error {
    constructor(
        message: string,
        public readonly code?: string,
    ) {
        super(message);
        this.name = 'AnimalRepositoryError';
    }
}

export class AnimalRepository {
    constructor(private readonly supabase: SupabaseClient<Database>) {}

    private toDomain(
        row: AnimalRow &
        { espacio: { id_espacio: number; nombre_espacio: string } | null } &
        { animal_estado: { id_estado: number; nombre_estado: string } | null }
    ): Animal {
        return {
            idAnimal: row.id_animal,
            uuid: row.uuid,
            idRefugio: row.id_refugio,
            idEspacio: row.id_espacio,
            espacioNombre: row.espacio?.nombre_espacio ?? null,
            idEstado: row.id_estado,
            estadoNombre: row.animal_estado?.nombre_estado ?? null,
            nombre: row.nombre,
            especie: row.especie,
            raza: row.raza,
            sexo: row.sexo,
            edadEstimada: row.edad_estimada,
            peso: row.peso,
            procedencia: row.procedencia,
            rasgosFisicos: row.rasgos_fisicos,
            estadoInicial: row.estado_inicial,
            fechaIngreso: row.fecha_ingreso,
            activo: row.activo,
            disponibleAdopcion: row.disponible_adopcion,
            enCuarentena: row.en_cuarentena,
            esterilizado: row.esterilizado,
            deletedAt: row.deleted_at,
        };
    }

    async findAllByRefugio(idRefugio: number): Promise<Animal[]> {
        const { data, error } = await this.supabase
            .from("animal")
            .select(`
              *,
              espacio:espacio(id_espacio, nombre_espacio),
              animal_estado:animal_estado(id_estado, nombre_estado)
            `)
            .eq("id_refugio", idRefugio)
            .is("deleted_at", null)
            .order("fecha_ingreso", { ascending: false });

        if (error) {
            throw new AnimalRepositoryError(
                `Error al listar animales: ${error.message}`,
                error.code,
            );
        }
        return data.map((row) => this.toDomain(row));
    }

    async findById(id: number, idRefugio: number): Promise<Animal | null> {
        const { data, error } = await this.supabase
            .from("animal")
            .select(`
              *,
              espacio:espacio(id_espacio, nombre_espacio),
              animal_estado:animal_estado(id_estado, nombre_estado)
            `)
            .eq("id_animal", id)
            .eq("id_refugio", idRefugio)
            .is("deleted_at", null)
            .maybeSingle();

        if (error) {
            throw new AnimalRepositoryError(
                `Error al buscar animal: ${error.message}`,
                error.code,
            );
        }
        return data ? this.toDomain(data) : null;
    }

    async create(dto: CreateAnimalDTO, idRefugio: number): Promise<Animal> {
        const insert: AnimalInsert = {
            nombre: dto.nombre ?? null,
            especie: dto.especie,
            raza: dto.raza ?? null,
            sexo: dto.sexo ?? null,
            edad_estimada: dto.edadEstimada ?? null,
            peso: dto.peso ?? null,
            procedencia: dto.procedencia,
            rasgos_fisicos: dto.rasgosFisicos,
            estado_inicial: dto.estadoInicial,
            id_espacio: dto.idEspacio,
            id_estado: dto.idEstado,
            id_refugio: idRefugio,
            disponible_adopcion: dto.disponibleAdopcion ?? false,
            en_cuarentena: dto.enCuarentena ?? false,
            esterilizado: dto.esterilizado ?? false,
            activo: dto.activo ?? true,
        };

        const { data, error } = await this.supabase
            .from("animal")
            .insert(insert)
            .select(`
              *,
              espacio:espacio(id_espacio, nombre_espacio),
              animal_estado:animal_estado(id_estado, nombre_estado)
            `)
            .single();

        if (error) {
            throw new AnimalRepositoryError(
                `Error al crear animal: ${error.message}`,
                error.code,
            );
        }
        return this.toDomain(data);
    }

    async update(id: number, dto: UpdateAnimalDTO): Promise<Animal> {
        const update: AnimalUpdate = {};
        if (dto.nombre !== undefined) update.nombre = dto.nombre;
        if (dto.especie !== undefined) update.especie = dto.especie;
        if (dto.raza !== undefined) update.raza = dto.raza;
        if (dto.sexo !== undefined) update.sexo = dto.sexo;
        if (dto.edadEstimada !== undefined) update.edad_estimada = dto.edadEstimada;
        if (dto.peso !== undefined) update.peso = dto.peso;
        if (dto.procedencia !== undefined) update.procedencia = dto.procedencia;
        if (dto.rasgosFisicos !== undefined) update.rasgos_fisicos = dto.rasgosFisicos;
        if (dto.estadoInicial !== undefined) update.estado_inicial = dto.estadoInicial;
        if (dto.idEspacio !== undefined) update.id_espacio = dto.idEspacio;
        if (dto.idEstado !== undefined) update.id_estado = dto.idEstado;
        if (dto.disponibleAdopcion !== undefined) update.disponible_adopcion = dto.disponibleAdopcion;
        if (dto.enCuarentena !== undefined) update.en_cuarentena = dto.enCuarentena;
        if (dto.esterilizado !== undefined) update.esterilizado = dto.esterilizado;
        if (dto.activo !== undefined) update.activo = dto.activo;

        const { data, error } = await this.supabase
            .from("animal")
            .update(update)
            .eq("id_animal", id)
            .select(`
              *,
              espacio:espacio(id_espacio, nombre_espacio),
              animal_estado:animal_estado(id_estado, nombre_estado)
            `)
            .single();

        if (error) {
            throw new AnimalRepositoryError(
                `Error al actualizar animal: ${error.message}`,
                error.code,
            );
        }
        return this.toDomain(data);
    }

    async softDelete(id: number): Promise<void> {
        const { error } = await this.supabase
            .from("animal")
            .update({ deleted_at: new Date().toISOString() })
            .eq("id_animal", id);

        if (error) {
            throw new AnimalRepositoryError(
                `Error al eliminar animal: ${error.message}`,
                error.code,
            );
        }
    }

    async espacioExistsInRefugio(idEspacio: number, idRefugio: number): Promise<boolean> {
        const { count, error } = await this.supabase
            .from("espacio")
            .select("*", { count: "exact", head: true })
            .eq("id_espacio", idEspacio)
            .eq("id_refugio", idRefugio);

        if (error) {
            throw new AnimalRepositoryError(
                `Error al verificar espacio: ${error.message}`,
                error.code,
            );
        }
        return (count ?? 0) > 0;
    }

    async estadoExists(idEstado: number): Promise<boolean> {
        const { count, error } = await this.supabase
            .from("animal_estado")
            .select("*", { count: "exact", head: true })
            .eq("id_estado", idEstado);

        if (error) {
            throw new AnimalRepositoryError(
                `Error al verificar estado: ${error.message}`,
                error.code,
            );
        }
        return (count ?? 0) > 0;
    }
}