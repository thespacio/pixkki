import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import type { AnimalAccess } from "../access";
import type { UpdateDisponibilidadAdopcionDTO } from "../dtos/animal-adoption-aptitude.dto";
import {
    AnimalEnCuarentenaError,
    AnimalNotFoundError,
    AptitudAdopcionInsuficienteError,
    BloqueoNoExcepcionableError,
    DatosInvalidosError,
    ErrorInternoAdopcionError,
    ExcepcionInnecesariaError,
    ExcepcionNoAutorizadaError,
    MotivoExcepcionRequeridoError,
    type AptitudAdopcionDetails,
} from "../errors";

export type AdoptionCriterion = {
    clave: string;
    etiqueta: string;
    cumple: boolean;
    omitible: boolean;
    detalle: string;
};

export type AdoptionException = {
    idExcepcion: number;
    idUsuario: number;
    motivo: string;
    criteriosOmitidos: string[];
    fechaExcepcion: string;
};

export type AdoptionAptitude = {
    idAnimal: number;
    apto: boolean;
    disponibleAdopcion: boolean;
    bloqueos: string[];
    advertencias: string[];
    criterios: AdoptionCriterion[];
    excepcionVigente: AdoptionException | null;
};

export type AdoptionPublication = {
    idAnimal: number;
    disponibleAdopcion: boolean;
    apto: boolean;
    excepcionAplicada: boolean;
    excepcion: AdoptionException | null;
    auditoriaId: number | null;
};

type RpcEnvelope = {
    ok: boolean;
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
    data?: Record<string, unknown>;
};

function parseEnvelope(value: Json | null): RpcEnvelope {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw new ErrorInternoAdopcionError();
    }
    const envelope = value as Record<string, unknown>;
    return {
        ok: envelope.ok === true,
        code: typeof envelope.code === "string" ? envelope.code : undefined,
        message: typeof envelope.message === "string" ? envelope.message : undefined,
        details:
            typeof envelope.details === "object" &&
            envelope.details !== null &&
            !Array.isArray(envelope.details)
                ? (envelope.details as Record<string, unknown>)
                : undefined,
        data:
            typeof envelope.data === "object" &&
            envelope.data !== null &&
            !Array.isArray(envelope.data)
                ? (envelope.data as Record<string, unknown>)
                : undefined,
    };
}

function readStringArray(value: unknown): string[] {
    return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

function readDetails(value: Record<string, unknown> | undefined): AptitudAdopcionDetails {
    if (!value) return {};
    return {
        bloqueos: readStringArray(value.bloqueos),
        advertencias: readStringArray(value.advertencias),
    };
}

function readException(value: unknown): AdoptionException | null {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return null;
    }
    const row = value as Record<string, unknown>;
    return {
        idExcepcion: Number(row.id_excepcion),
        idUsuario: Number(row.id_usuario),
        motivo: String(row.motivo ?? ""),
        criteriosOmitidos: readStringArray(row.criterios_omitidos),
        fechaExcepcion: String(row.fecha_excepcion ?? ""),
    };
}

function readCriteria(value: unknown): AdoptionCriterion[] {
    if (!Array.isArray(value)) return [];
    return value.map((item) => {
        const row = (item ?? {}) as Record<string, unknown>;
        return {
            clave: String(row.clave ?? ""),
            etiqueta: String(row.etiqueta ?? ""),
            cumple: Boolean(row.cumple),
            omitible: Boolean(row.omitible),
            detalle: String(row.detalle ?? ""),
        };
    });
}

function throwForCode(
    envelope: RpcEnvelope,
    idAnimal: number,
): never {
    switch (envelope.code) {
        case "ANIMAL_NO_ENCONTRADO":
            throw new AnimalNotFoundError(idAnimal);
        case "ANIMAL_EN_CUARENTENA":
            throw new AnimalEnCuarentenaError();
        case "APTITUD_ADOPCION_INSUFICIENTE":
            throw new AptitudAdopcionInsuficienteError(readDetails(envelope.details));
        case "BLOQUEO_NO_EXCEPCIONABLE":
            throw new BloqueoNoExcepcionableError(readDetails(envelope.details));
        case "EXCEPCION_NO_AUTORIZADA":
            throw new ExcepcionNoAutorizadaError();
        case "MOTIVO_EXCEPCION_REQUERIDO":
            throw new MotivoExcepcionRequeridoError();
        case "EXCEPCION_INNECESARIA":
            throw new ExcepcionInnecesariaError();
        case "DATOS_INVALIDOS":
            throw new DatosInvalidosError(envelope.message);
        default:
            throw new ErrorInternoAdopcionError();
    }
}

/**
 * Repository de consulta de aptitud y del gatekeeper de publicación.
 * Toda lectura calcula los criterios en la base; el servidor nunca los infiere
 * desde el cliente.
 */
export class AnimalAdoptionRepository {
    constructor(private readonly supabase: SupabaseClient<Database>) {}

    private refugioDe(access: AnimalAccess): number | null {
        return access.allShelters ? null : access.shelterId;
    }

    private async assertAnimal(
        idAnimal: number,
        idRefugio: number | null,
    ): Promise<void> {
        let query = this.supabase
            .from("animal")
            .select("id_animal")
            .eq("id_animal", idAnimal)
            .is("deleted_at", null);
        if (idRefugio !== null) query = query.eq("id_refugio", idRefugio);

        const { data, error } = await query.maybeSingle();
        if (error) throw error;
        if (!data) throw new AnimalNotFoundError(idAnimal);
    }

    async evaluate(
        idAnimal: number,
        access: AnimalAccess,
    ): Promise<AdoptionAptitude> {
        await this.assertAnimal(idAnimal, this.refugioDe(access));

        const { data, error } = await this.supabase.rpc(
            "evaluar_aptitud_adopcion",
            { p_id_animal: idAnimal },
        );
        if (error) throw error;

        const envelope = parseEnvelope(data);
        if (!envelope.ok) throwForCode(envelope, idAnimal);
        if (!envelope.data) throw new ErrorInternoAdopcionError();

        const d = envelope.data;
        return {
            idAnimal: Number(d.id_animal),
            apto: Boolean(d.apto),
            disponibleAdopcion: Boolean(d.disponible_adopcion),
            bloqueos: readStringArray(d.bloqueos),
            advertencias: readStringArray(d.advertencias),
            criterios: readCriteria(d.criterios),
            excepcionVigente: readException(d.excepcion_vigente),
        };
    }

    async setDisponibility(
        idAnimal: number,
        access: AnimalAccess,
        input: UpdateDisponibilidadAdopcionDTO,
        idUsuario: number,
    ): Promise<AdoptionPublication> {
        await this.assertAnimal(idAnimal, this.refugioDe(access));

        const { data, error } = await this.supabase.rpc("publicar_adopcion", {
            p_id_animal: idAnimal,
            p_disponible: input.disponible_adopcion,
            p_autorizar_excepcion: input.autorizar_excepcion ?? false,
            p_motivo_excepcion: input.motivo_excepcion ?? "",
            p_id_usuario: idUsuario,
        });
        if (error) throw error;

        const envelope = parseEnvelope(data);
        if (!envelope.ok) throwForCode(envelope, idAnimal);
        if (!envelope.data) throw new ErrorInternoAdopcionError();

        const d = envelope.data;
        return {
            idAnimal: Number(d.id_animal),
            disponibleAdopcion: Boolean(d.disponible_adopcion),
            apto: Boolean(d.apto),
            excepcionAplicada: Boolean(d.excepcion_aplicada),
            excepcion: readException(d.excepcion),
            auditoriaId:
                d.auditoria_id === null || d.auditoria_id === undefined
                    ? null
                    : Number(d.auditoria_id),
        };
    }
}
