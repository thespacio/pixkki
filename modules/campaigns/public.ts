// ---------------------------------------------------------------------------
// Lectura PÚBLICA de campañas para la landing page.
//
// Solo toca la vista `campana_publica`, que expone únicamente campos no sensibles
// de campañas publicadas y de animales que siguen disponibles. Usa un cliente
// anónimo (sin cookies de sesión): lo que se ve aquí es lo que ve cualquier visitante.
// ---------------------------------------------------------------------------

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { CampaignAnimal, PublicCampaign } from "@/modules/campaigns/types";

type PublicRow = Database["public"]["Views"]["campana_publica"]["Row"];

type RawAnimal = {
    id_animal?: unknown;
    nombre?: unknown;
    especie?: unknown;
    raza?: unknown;
    sexo?: unknown;
    edad_estimada?: unknown;
};

const str = (v: unknown): string | null => (typeof v === "string" && v.trim() !== "" ? v : null);
const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

function toAnimals(json: PublicRow["animales"]): CampaignAnimal[] {
    if (!Array.isArray(json)) return [];

    return (json as RawAnimal[])
        .map((a): CampaignAnimal | null => {
            const id = num(a?.id_animal);
            const especie = str(a?.especie);
            if (id === null || especie === null) return null;
            return {
                idAnimal: id,
                nombre: str(a.nombre),
                especie,
                raza: str(a.raza),
                sexo: str(a.sexo),
                edadEstimada: num(a.edad_estimada),
            };
        })
        .filter((a): a is CampaignAnimal => a !== null);
}

/** Convierte una fila de la vista en el modelo público; devuelve null si está incompleta. */
export function mapPublicRow(row: PublicRow): PublicCampaign | null {
    const animals = toAnimals(row.animales);
    if (
        row.id_campana === null ||
        !row.titulo ||
        !row.contenido ||
        !row.refugio_nombre ||
        animals.length === 0
    ) {
        return null;
    }

    return {
        id: row.id_campana,
        title: row.titulo,
        content: row.contenido,
        hashtags: row.hashtags ?? [],
        callToAction: row.llamado_accion,
        publishedAt: row.fecha_publicacion,
        shelterName: row.refugio_nombre,
        shelterCity: row.refugio_ciudad ?? "",
        shelterState: row.refugio_estado ?? "",
        animals,
    };
}

export async function listPublishedCampaigns(
    client: SupabaseClient<Database>,
    limit = 6,
): Promise<PublicCampaign[]> {
    const { data, error } = await client
        .from("campana_publica")
        .select("*")
        .order("fecha_publicacion", { ascending: false })
        .limit(limit);

    if (error) throw error;

    return (data ?? [])
        .map((row) => mapPublicRow(row))
        .filter((c): c is PublicCampaign => c !== null);
}

/**
 * Campañas publicadas para la landing. NUNCA lanza: si la base no responde o la
 * migración de campañas aún no se aplicó, la landing se muestra sin esta sección
 * en vez de caerse.
 */
export async function getPublishedCampaigns(limit = 6): Promise<PublicCampaign[]> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return [];

    try {
        const client = createClient<Database>(url, anonKey, {
            auth: { persistSession: false, autoRefreshToken: false },
        });
        return await listPublishedCampaigns(client, limit);
    } catch (error) {
        console.error("[campaigns] No se pudieron leer las campañas públicas:", error);
        return [];
    }
}
