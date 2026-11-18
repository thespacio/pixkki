import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import type { AnimalAccess } from "../access";
import {
    AnimalNotFoundError,
    CantidadInvalidaError,
    CirugiaDuplicadaError,
    ConflictoConcurrenciaError,
    DatosInvalidosError,
    FalloTransaccionCirugiaError,
    FechaFuturaError,
    InsumosDuplicadosError,
    LoteInactivoError,
    LoteNoEncontradoError,
    LoteVencidoError,
    StockInsuficienteError,
    TipoInsumoInvalidoError,
} from "../errors";
import type { CreateCirugiaDTO } from "../dtos/animal-surgery.dto";

export type SurgerySupplyConsumption = {
    idLoteInventario: number;
    nombreInsumo: string;
    cantidad: number;
    stockRestante: number;
};

export type AnimalSurgery = {
    idCirugia: number;
    idAnimal: number;
    idRefugio: number;
    tipoCirugia: string;
    fechaCirugia: string;
    exitosa: boolean;
    notasPostoperatorias: string | null;
    idUsuario: number;
    esterilizadoActualizado: boolean;
    insumosConsumidos: SurgerySupplyConsumption[];
};

export type SurgerySupply = {
    idLoteInventario: number;
    nombreInsumo: string;
    cantidad: number;
};

export type AnimalSurgeryHistoryItem = {
    idCirugia: number;
    tipoCirugia: string;
    fechaCirugia: string;
    exitosa: boolean;
    notasPostoperatorias: string | null;
    idUsuario: number;
    insumos: SurgerySupply[];
};

type RpcEnvelope = {
    ok: boolean;
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
    data?: Record<string, unknown>;
};

type SurgeryRow = {
    id_cirugia: number;
    tipo_cirugia: string;
    fecha_cirugia: string;
    exitosa: boolean;
    notas_postoperatorias: string | null;
    id_usuario: number;
    cirugia_insumo:
        | Array<{
              cantidad: number;
              id_lote_inventario: number;
              inventario_lote: {
                  inventario_insumo: { nombre: string } | null;
              } | null;
          }>
        | null;
};

function parseEnvelope(value: Json | null): RpcEnvelope {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw new FalloTransaccionCirugiaError();
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

function throwForCode(
    code: string | undefined,
    idAnimal: number,
    message?: string,
): never {
    switch (code) {
        case "ANIMAL_NO_ENCONTRADO":
            throw new AnimalNotFoundError(idAnimal);
        case "LOTE_NO_ENCONTRADO":
            throw new LoteNoEncontradoError();
        case "LOTE_INACTIVO":
            throw new LoteInactivoError();
        case "LOTE_VENCIDO":
            throw new LoteVencidoError();
        case "STOCK_INSUFICIENTE":
            throw new StockInsuficienteError();
        case "CONFLICTO_CONCURRENCIA":
            throw new ConflictoConcurrenciaError();
        case "TIPO_INSUMO_INVALIDO":
            throw new TipoInsumoInvalidoError();
        case "CIRUGIA_DUPLICADA":
            throw new CirugiaDuplicadaError();
        case "INSUMOS_DUPLICADOS":
            throw new InsumosDuplicadosError();
        case "CANTIDAD_INVALIDA":
            throw new CantidadInvalidaError();
        case "FECHA_FUTURA":
            throw new FechaFuturaError();
        case "DATOS_INVALIDOS":
            throw new DatosInvalidosError(message);
        default:
            throw new FalloTransaccionCirugiaError();
    }
}

function readConsumptions(value: unknown): SurgerySupplyConsumption[] {
    if (!Array.isArray(value)) return [];
    return value.map((item) => {
        const row = (item ?? {}) as Record<string, unknown>;
        return {
            idLoteInventario: Number(row.id_lote_inventario),
            nombreInsumo: String(row.nombre_insumo ?? ""),
            cantidad: Number(row.cantidad ?? 0),
            stockRestante: Number(row.stock_restante ?? 0),
        };
    });
}

/** Persistencia del acto quirúrgico. La creación se ejecuta en la RPC atómica. */
export class AnimalSurgeryRepository {
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

    async create(
        idAnimal: number,
        access: AnimalAccess,
        input: CreateCirugiaDTO,
        idUsuario: number,
    ): Promise<AnimalSurgery> {
        await this.assertAnimal(idAnimal, this.refugioDe(access));

        if (!input.fecha_cirugia) {
            throw new DatosInvalidosError("Fecha de cirugía inválida.");
        }

        const insumos = input.insumos.map((insumo) => ({
            id_lote_inventario: insumo.id_lote_inventario,
            cantidad: insumo.cantidad,
        })) as unknown as Json;

        const { data, error } = await this.supabase.rpc(
            "registrar_cirugia_reproductiva",
            {
                p_id_animal: idAnimal,
                p_tipo_cirugia: input.tipo_cirugia,
                p_fecha_cirugia: input.fecha_cirugia.toISOString(),
                p_exitosa: input.exitosa,
                p_notas_postoperatorias: input.notas_postoperatorias ?? "",
                p_insumos: insumos,
                p_id_usuario: idUsuario,
            },
        );
        if (error) throw error;

        const envelope = parseEnvelope(data);
        if (!envelope.ok) {
            throwForCode(envelope.code, idAnimal, envelope.message);
        }
        if (!envelope.data) throw new FalloTransaccionCirugiaError();

        const d = envelope.data;
        return {
            idCirugia: Number(d.id_cirugia),
            idAnimal: Number(d.id_animal),
            idRefugio: Number(d.id_refugio),
            tipoCirugia: String(d.tipo_cirugia ?? ""),
            fechaCirugia: String(d.fecha_cirugia ?? ""),
            exitosa: Boolean(d.exitosa),
            notasPostoperatorias: (d.notas_postoperatorias as string | null) ?? null,
            idUsuario: Number(d.id_usuario),
            esterilizadoActualizado: Boolean(d.esterilizado_actualizado),
            insumosConsumidos: readConsumptions(d.insumos_consumidos),
        };
    }

    async listByAnimal(
        idAnimal: number,
        access: AnimalAccess,
    ): Promise<AnimalSurgeryHistoryItem[]> {
        const idRefugio = this.refugioDe(access);
        await this.assertAnimal(idAnimal, idRefugio);

        let query = this.supabase
            .from("cirugia_reproductiva")
            .select(
                "id_cirugia, tipo_cirugia, fecha_cirugia, exitosa, notas_postoperatorias, id_usuario, cirugia_insumo(cantidad, id_lote_inventario, inventario_lote(inventario_insumo(nombre)))",
            )
            .eq("id_animal", idAnimal)
            .order("fecha_cirugia", { ascending: false });

        if (idRefugio !== null) query = query.eq("id_refugio", idRefugio);

        const { data, error } = await query;
        if (error) throw error;

        return ((data ?? []) as unknown as SurgeryRow[]).map((row) => ({
            idCirugia: row.id_cirugia,
            tipoCirugia: row.tipo_cirugia,
            fechaCirugia: row.fecha_cirugia,
            exitosa: row.exitosa,
            notasPostoperatorias: row.notas_postoperatorias,
            idUsuario: row.id_usuario,
            insumos: (row.cirugia_insumo ?? []).map((insumo) => ({
                idLoteInventario: insumo.id_lote_inventario,
                nombreInsumo: insumo.inventario_lote?.inventario_insumo?.nombre ?? "",
                cantidad: insumo.cantidad,
            })),
        }));
    }
}
