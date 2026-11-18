import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import {
    AnimalNotFoundError,
    CapacidadExcedidaError,
    ConflictoOcupacionError,
    EspacioInactivoError,
    EspacioNoEncontradoError,
    FalloTransaccionTrasladoError,
    QuarantineAlreadyReleasedError,
    TrasladoMismoEspacioError,
    TrasladoOrigenDesactualizadoError,
} from "../errors";
import { AnimalEnCuarentenaError } from "../errors";
import type { AnimalAccess } from "../access";
import type { CreateTrasladoInput } from "../validators/animal-transfer.validators";

export type AnimalTransfer = {
    idTraslado: number;
    idAnimal: number;
    idRefugio: number;
    idEspacioOrigen: number;
    idEspacioDestino: number;
    fechaTraslado: string;
    motivo: string | null;
    idUsuario: number | null;
    ocupacionDestino: number | null;
    enCuarentena: boolean | null;
    alta: {
        idAlta: number;
        observaciones: string;
        idUsuarioVeterinario: number;
        fechaAlta: string;
    } | null;
};

type TransferRow = {
    id_traslado: number;
    id_animal: number;
    id_refugio: number | null;
    id_espacio_origen: number;
    id_espacio_destino: number;
    fecha_traslado: string;
    motivo: string | null;
    id_usuario: number | null;
};

type RpcEnvelope = {
    ok: boolean;
    code?: string;
    message?: string;
    data?: Record<string, unknown>;
};

function parseEnvelope(value: Json | null): RpcEnvelope {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw new FalloTransaccionTrasladoError();
    }
    const envelope = value as Record<string, unknown>;
    return {
        ok: envelope.ok === true,
        code: typeof envelope.code === "string" ? envelope.code : undefined,
        message: typeof envelope.message === "string" ? envelope.message : undefined,
        data:
            typeof envelope.data === "object" && envelope.data !== null && !Array.isArray(envelope.data)
                ? (envelope.data as Record<string, unknown>)
                : undefined,
    };
}

function throwForCode(code: string | undefined, idAnimal: number): never {
    switch (code) {
        case "ANIMAL_NO_ENCONTRADO":
            throw new AnimalNotFoundError(idAnimal);
        case "ESPACIO_NO_ENCONTRADO":
            throw new EspacioNoEncontradoError();
        case "ESPACIO_INACTIVO":
            throw new EspacioInactivoError();
        case "CAPACIDAD_EXCEDIDA":
        case "CONFLICTO_OCUPACION":
            throw code === "CAPACIDAD_EXCEDIDA"
                ? new CapacidadExcedidaError()
                : new ConflictoOcupacionError();
        case "ANIMAL_EN_CUARENTENA":
            throw new AnimalEnCuarentenaError();
        case "CUARENTENA_YA_LIBERADA":
            throw new QuarantineAlreadyReleasedError();
        case "TRASLADO_MISMO_ESPACIO":
            throw new TrasladoMismoEspacioError();
        case "TRASLADO_ORIGEN_DESACTUALIZADO":
            throw new TrasladoOrigenDesactualizadoError();
        default:
            throw new FalloTransaccionTrasladoError();
    }
}

function toDomain(row: TransferRow): AnimalTransfer {
    return {
        idTraslado: Number(row.id_traslado),
        idAnimal: row.id_animal,
        idRefugio: row.id_refugio ?? 0,
        idEspacioOrigen: row.id_espacio_origen,
        idEspacioDestino: row.id_espacio_destino,
        fechaTraslado: row.fecha_traslado,
        motivo: row.motivo,
        idUsuario: row.id_usuario,
        ocupacionDestino: null,
        enCuarentena: null,
        alta: null,
    };
}

/** Persistencia de traslados. La creación se ejecuta íntegramente en la RPC. */
export class AnimalTransferRepository {
    constructor(private readonly supabase: SupabaseClient<Database>) {}

    private refugioDe(access: AnimalAccess): number | null {
        return access.allShelters ? null : access.shelterId;
    }

    private async assertAnimal(idAnimal: number, idRefugio: number | null): Promise<void> {
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

    async create(
        idAnimal: number,
        access: AnimalAccess,
        input: CreateTrasladoInput,
        idUsuario: number,
    ): Promise<AnimalTransfer> {
        await this.assertAnimal(idAnimal, this.refugioDe(access));

        const { data, error } = await this.supabase.rpc("registrar_traslado", {
            p_id_animal: idAnimal,
            p_id_espacio_destino: input.id_espacio_destino,
            p_motivo: input.motivo ?? undefined,
            p_alta_observaciones: input.alta_medica?.observaciones ?? undefined,
            p_alta_fecha: input.alta_medica?.fecha_alta
                ? input.alta_medica.fecha_alta.toISOString()
                : undefined,
            p_id_usuario: idUsuario,
        });
        if (error) throw error;

        const envelope = parseEnvelope(data);
        if (!envelope.ok) throwForCode(envelope.code, idAnimal);
        if (!envelope.data) throw new FalloTransaccionTrasladoError();

        const d = envelope.data;
        const altaData =
            typeof d.alta === "object" && d.alta !== null && !Array.isArray(d.alta)
                ? (d.alta as Record<string, unknown>)
                : null;

        return {
            idTraslado: Number(d.id_traslado),
            idAnimal: Number(d.id_animal),
            idRefugio: Number(d.id_refugio),
            idEspacioOrigen: Number(d.id_espacio_origen),
            idEspacioDestino: Number(d.id_espacio_destino),
            fechaTraslado: String(d.fecha_traslado ?? ""),
            motivo: (d.motivo as string | null) ?? null,
            idUsuario: (d.id_usuario as number | null) ?? null,
            ocupacionDestino:
                d.ocupacion_destino === null || d.ocupacion_destino === undefined
                    ? null
                    : Number(d.ocupacion_destino),
            enCuarentena:
                d.en_cuarentena === null || d.en_cuarentena === undefined
                    ? null
                    : Boolean(d.en_cuarentena),
            alta: altaData
                ? {
                      idAlta: Number(altaData.id_alta),
                      observaciones: String(altaData.observaciones ?? ""),
                      idUsuarioVeterinario: Number(altaData.id_usuario_veterinario),
                      fechaAlta: String(altaData.fecha_alta ?? ""),
                  }
                : null,
        };
    }

    async listByAnimal(idAnimal: number, access: AnimalAccess): Promise<AnimalTransfer[]> {
        const idRefugio = this.refugioDe(access);
        await this.assertAnimal(idAnimal, idRefugio);

        let query = this.supabase
            .from("traslado")
            .select("*")
            .eq("id_animal", idAnimal)
            .order("fecha_traslado", { ascending: false });
        if (idRefugio !== null) query = query.eq("id_refugio", idRefugio);

        const { data, error } = await query;
        if (error) throw error;
        return ((data ?? []) as unknown as TransferRow[]).map(toDomain);
    }
}
