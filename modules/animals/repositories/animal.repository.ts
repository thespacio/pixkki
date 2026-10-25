import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateAnimalDTO } from "../dtos/create-animal.dto";
import type { UpdateAnimalDTO } from "../dtos/update-animal.dto";
import {Database} from "@/types/database";
import {Animal} from "@/modules/animals/types/animales.types";

type AnimalRow = Database["public"]["Tables"]["animal"]["Row"];
type AnimalInsert = Database["public"]["Tables"]["animal"]["Insert"];
type AnimalUpdate = Database["public"]["Tables"]["animal"]["Update"];

// Relaciones que se traen junto con cada animal (nombre de espacio, estado y albergue).
const SELECT_WITH_RELATIONS = `
  *,
  espacio:espacio(id_espacio, nombre_espacio),
  animal_estado:animal_estado(id_estado, nombre_estado),
  refugio:refugio(id_refugio, nombre)
`;

type AnimalRowWithRelations = AnimalRow & {
    espacio: { id_espacio: number; nombre_espacio: string } | null;
    animal_estado: { id_estado: number; nombre_estado: string } | null;
    refugio: { id_refugio: number; nombre: string } | null;
};

export class AnimalRepository {
    constructor(private readonly supabase: SupabaseClient<Database>) {}

    private toDomain(row: AnimalRowWithRelations): Animal {
        return {
            idAnimal: row.id_animal,
            uuid: row.uuid,
            idRefugio: row.id_refugio,
            refugioNombre: row.refugio?.nombre ?? null,
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

            color: row.color,
            tamano: row.tamano,
            microchip: row.microchip,
            temperamento: row.temperamento,
            vacunado: row.vacunado,
            desparasitado: row.desparasitado,
            lugarRescate: row.lugar_rescate,
            fechaRescate: row.fecha_rescate,
            situacionRescate: row.situacion_rescate,
            rescatistaNombre: row.rescatista_nombre,
            rescatistaContacto: row.rescatista_contacto,
            observaciones: row.observaciones,
        };
    }

    async findAllByRefugio(idRefugio: number): Promise<Animal[]> {
        const { data, error } = await this.supabase
            .from("animal")
            .select(SELECT_WITH_RELATIONS)
            .eq("id_refugio", idRefugio)
            .is("deleted_at", null)
            .order("fecha_ingreso", { ascending: false });

        if (error) throw error;
        return (data as unknown as AnimalRowWithRelations[]).map((row) => this.toDomain(row));
    }

    /** Todos los animales de todos los albergues (uso exclusivo de superadmin). */
    async findAll(): Promise<Animal[]> {
        const { data, error } = await this.supabase
            .from("animal")
            .select(SELECT_WITH_RELATIONS)
            .is("deleted_at", null)
            .order("fecha_ingreso", { ascending: false });

        if (error) throw error;
        return (data as unknown as AnimalRowWithRelations[]).map((row) => this.toDomain(row));
    }

    async findById(id: number): Promise<Animal | null> {
        const { data, error } = await this.supabase
            .from("animal")
            .select(SELECT_WITH_RELATIONS)
            .eq("id_animal", id)
            .is("deleted_at", null)
            .maybeSingle();

        if (error) throw error;
        return data ? this.toDomain(data as unknown as AnimalRowWithRelations) : null;
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

            color: dto.color ?? null,
            tamano: dto.tamano ?? null,
            microchip: dto.microchip ?? null,
            temperamento: dto.temperamento ?? null,
            vacunado: dto.vacunado ?? false,
            desparasitado: dto.desparasitado ?? false,
            lugar_rescate: dto.lugarRescate ?? null,
            fecha_rescate: dto.fechaRescate ?? null,
            situacion_rescate: dto.situacionRescate ?? null,
            rescatista_nombre: dto.rescatistaNombre ?? null,
            rescatista_contacto: dto.rescatistaContacto ?? null,
            observaciones: dto.observaciones ?? null,
        };

        const { data, error } = await this.supabase
            .from("animal")
            .insert(insert)
            .select(SELECT_WITH_RELATIONS)
            .single();

        if (error) throw error;
        return this.toDomain(data as unknown as AnimalRowWithRelations);
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

        if (dto.color !== undefined) update.color = dto.color;
        if (dto.tamano !== undefined) update.tamano = dto.tamano;
        if (dto.microchip !== undefined) update.microchip = dto.microchip;
        if (dto.temperamento !== undefined) update.temperamento = dto.temperamento;
        if (dto.vacunado !== undefined) update.vacunado = dto.vacunado;
        if (dto.desparasitado !== undefined) update.desparasitado = dto.desparasitado;
        if (dto.lugarRescate !== undefined) update.lugar_rescate = dto.lugarRescate;
        if (dto.fechaRescate !== undefined) update.fecha_rescate = dto.fechaRescate;
        if (dto.situacionRescate !== undefined) update.situacion_rescate = dto.situacionRescate;
        if (dto.rescatistaNombre !== undefined) update.rescatista_nombre = dto.rescatistaNombre;
        if (dto.rescatistaContacto !== undefined) update.rescatista_contacto = dto.rescatistaContacto;
        if (dto.observaciones !== undefined) update.observaciones = dto.observaciones;

        const { data, error } = await this.supabase
            .from("animal")
            .update(update)
            .eq("id_animal", id)
            .select(SELECT_WITH_RELATIONS)
            .single();

        if (error) throw error;
        return this.toDomain(data as unknown as AnimalRowWithRelations);
    }

    async softDelete(id: number): Promise<void> {
        const { error } = await this.supabase
            .from("animal")
            .update({ deleted_at: new Date().toISOString() })
            .eq("id_animal", id);

        if (error) throw error;
    }

    async espacioExistsInRefugio(idEspacio: number, idRefugio: number): Promise<boolean> {
        const { count, error } = await this.supabase
            .from("espacio")
            .select("*", { count: "exact", head: true })
            .eq("id_espacio", idEspacio)
            .eq("id_refugio", idRefugio);

        if (error) throw error;
        return (count ?? 0) > 0;
    }

    async estadoExists(idEstado: number): Promise<boolean> {
        const { count, error } = await this.supabase
            .from("animal_estado")
            .select("*", { count: "exact", head: true })
            .eq("id_estado", idEstado);

        if (error) throw error;
        return (count ?? 0) > 0;
    }

    async refugioExists(idRefugio: number): Promise<boolean> {
        const { count, error } = await this.supabase
            .from("refugio")
            .select("*", { count: "exact", head: true })
            .eq("id_refugio", idRefugio);

        if (error) throw error;
        return (count ?? 0) > 0;
    }

    /** ¿Hay otro animal activo con ese microchip? (`exceptId` excluye al propio en una edición). */
    async microchipInUse(microchip: string, exceptId?: number): Promise<boolean> {
        let query = this.supabase
            .from("animal")
            .select("*", { count: "exact", head: true })
            .eq("microchip", microchip)
            .is("deleted_at", null);

        if (exceptId !== undefined) query = query.neq("id_animal", exceptId);

        const { count, error } = await query;
        if (error) throw error;
        return (count ?? 0) > 0;
    }
}
