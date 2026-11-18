import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import {
    AnimalNotFoundError,
    ConflictoConcurrenciaError,
    FechaRefuerzoInvalidaError,
    FalloTransaccionInventarioError,
    LoteInactivoError,
    LoteNoEncontradoError,
    LoteVencidoError,
    RefuerzoRequeridoError,
    StockInsuficienteError,
    TipoEventoInvalidoError,
} from "../errors";
import type { AnimalAccess } from "../access";
import type {
    CreateEventoSanitarioInput,
    TipoEventoSanitario,
} from "../validators/animal-sanitary-event.validators";

export type AnimalSanitaryEvent = {
    idEvento: number;
    idAnimal: number;
    idRefugio: number;
    tipoEvento: TipoEventoSanitario;
    tipoBiologico: string;
    marcaLote: string | null;
    fechaAplicacion: string;
    fechaRefuerzo: string | null;
    esquemaCompleto: boolean;
    idLoteInventario: number | null;
    cantidadDescontada: number;
    stockRestante: number | null;
    observaciones: string | null;
    idUsuario: number;
    fechaRegistro: string;
};

type EventRow = {
    id_evento: number;
    id_animal: number;
    id_refugio: number;
    tipo_evento: string;
    tipo_biologico: string;
    marca_lote: string | null;
    fecha_aplicacion: string;
    fecha_refuerzo: string | null;
    esquema_completo: boolean;
    id_lote_inventario: number | null;
    cantidad: number;
    observaciones: string | null;
    id_usuario: number;
    fecha_registro: string;
};

type RpcEnvelope = {
    ok: boolean;
    code?: string;
    message?: string;
    data?: Record<string, unknown>;
};

function parseEnvelope(value: Json | null): RpcEnvelope {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw new FalloTransaccionInventarioError();
    }
    const envelope = value as Record<string, unknown>;
    return {
        ok: envelope.ok === true,
        code: typeof envelope.code === "string" ? envelope.code : undefined,
        message: typeof envelope.message === "string" ? envelope.message : undefined,
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
    message: string | undefined,
    idAnimal: number,
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
        case "TIPO_EVENTO_INVALIDO":
            throw new TipoEventoInvalidoError();
        case "FECHA_REFUERZO_INVALIDA":
            throw new FechaRefuerzoInvalidaError();
        case "REFUERZO_REQUERIDO":
            throw new RefuerzoRequeridoError();
        default:
            if (message) {
                const error = new FalloTransaccionInventarioError();
                console.error("[animal-sanitary-event] Error de la RPC:", message);
                throw error;
            }
            throw new FalloTransaccionInventarioError();
    }
}

function toDomain(row: EventRow): AnimalSanitaryEvent {
    return {
        idEvento: Number(row.id_evento),
        idAnimal: row.id_animal,
        idRefugio: row.id_refugio,
        tipoEvento:
            row.tipo_evento === "desparasitacion" ? "desparasitacion" : "vacunacion",
        tipoBiologico: row.tipo_biologico,
        marcaLote: row.marca_lote,
        fechaAplicacion: row.fecha_aplicacion,
        fechaRefuerzo: row.fecha_refuerzo,
        esquemaCompleto: Boolean(row.esquema_completo),
        idLoteInventario: row.id_lote_inventario,
        cantidadDescontada: row.cantidad,
        stockRestante: null,
        observaciones: row.observaciones,
        idUsuario: row.id_usuario,
        fechaRegistro: row.fecha_registro,
    };
}

/**
 * Persistencia de eventos sanitarios. El listado se consulta aquí; la creación
 * se delega a la RPC `registrar_evento_sanitario`, único punto transaccional
 * donde se descuenta el stock de inventario y se actualizan los flags del
 * expediente. Este repository no accede directamente a tablas de inventario.
 */
export class AnimalSanitaryEventRepository {
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
        input: CreateEventoSanitarioInput,
        idUsuario: number,
    ): Promise<AnimalSanitaryEvent> {
        const idRefugioScope = this.refugioDe(access);
        await this.assertAnimal(idAnimal, idRefugioScope);

        const { data, error } = await this.supabase.rpc("registrar_evento_sanitario", {
            p_id_animal: idAnimal,
            p_tipo_evento: input.tipo_evento,
            p_tipo_biologico: input.tipo_biologico,
            p_fecha_aplicacion: input.fecha_aplicacion,
            p_marca_lote: input.marca_lote ?? undefined,
            p_fecha_refuerzo: input.fecha_refuerzo ?? undefined,
            p_esquema_completo: input.esquema_completo,
            p_id_lote_inventario: input.id_lote_inventario,
            p_observaciones: input.observaciones ?? undefined,
            p_id_usuario: idUsuario,
        });
        if (error) throw error;

        const envelope = parseEnvelope(data);
        if (!envelope.ok) throwForCode(envelope.code, envelope.message, idAnimal);
        if (!envelope.data) throw new FalloTransaccionInventarioError();

        const d = envelope.data;
        return {
            idEvento: Number(d.id_evento),
            idAnimal: Number(d.id_animal),
            idRefugio: Number(d.id_refugio),
            tipoEvento: d.tipo_evento === "desparasitacion" ? "desparasitacion" : "vacunacion",
            tipoBiologico: String(d.tipo_biologico ?? ""),
            marcaLote: (d.marca_lote as string | null) ?? null,
            fechaAplicacion: String(d.fecha_aplicacion ?? ""),
            fechaRefuerzo: (d.fecha_refuerzo as string | null) ?? null,
            esquemaCompleto: Boolean(d.esquema_completo),
            idLoteInventario: (d.id_lote_inventario as number | null) ?? null,
            cantidadDescontada: Number(d.cantidad_descontada ?? 1),
            stockRestante:
                d.stock_restante === null || d.stock_restante === undefined
                    ? null
                    : Number(d.stock_restante),
            observaciones: (d.observaciones as string | null) ?? null,
            idUsuario: Number(d.id_usuario),
            fechaRegistro: String(d.fecha_registro ?? ""),
        };
    }

    async listByAnimal(
        idAnimal: number,
        access: AnimalAccess,
    ): Promise<AnimalSanitaryEvent[]> {
        const idRefugio = this.refugioDe(access);
        await this.assertAnimal(idAnimal, idRefugio);

        let query = this.supabase
            .from("evento_sanitario")
            .select("*")
            .eq("id_animal", idAnimal)
            .order("fecha_aplicacion", { ascending: false });
        if (idRefugio !== null) query = query.eq("id_refugio", idRefugio);

        const { data, error } = await query;
        if (error) throw error;
        return ((data ?? []) as unknown as EventRow[]).map(toDomain);
    }
}
