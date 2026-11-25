import type {
    PublicCompatibilidadDTO,
    PublicRefugioPublicoDTO,
} from "../dtos/public-catalog.dto";

const COMPATIBILIDAD_LABELS: Record<string, string> = {
    si: "Sí",
    Sí: "Sí",
    no: "No",
    No: "No",
    con_supervision: "Con supervisión",
    "En evaluación": "En evaluación",
};

function nonEmpty(value: string | null | undefined): string | null {
    const text = value?.trim();
    return text ? text : null;
}

/** Traduce los códigos de la BD (`si`, `no`, `con_supervision`) a texto visible. */
export function formatCompatibilidad(value: string | null | undefined): string {
    const text = nonEmpty(value);
    if (!text) return "Sin información";
    return COMPATIBILIDAD_LABELS[text] ?? text;
}

export function formatSexo(value: string | null | undefined): string | null {
    const text = nonEmpty(value);
    if (!text) return null;
    if (text === "M") return "Macho";
    if (text === "H") return "Hembra";
    return text;
}

export function formatEdad(value: number | null | undefined): string | null {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return null;
    return value === 1 ? "1 año" : `${value} años`;
}

export function formatSiNo(value: boolean | null | undefined): string {
    if (value === true) return "Sí";
    if (value === false) return "No";
    return "Sin información";
}

export function formatUbicacion(refugio: PublicRefugioPublicoDTO): string | null {
    if (!refugio) return null;
    const partes = [nonEmpty(refugio.ciudad), nonEmpty(refugio.estado)].filter(
        (parte): parte is string => parte !== null,
    );
    return partes.length > 0 ? partes.join(", ") : null;
}

/**
 * Atributos seguros para badges: solo afirmaciones positivas, nunca datos
 * clínicos internos ni negaciones que puedan leerse como advertencia.
 */
export function formatAtributos(item: {
    vacunado?: boolean | null;
    desparasitado?: boolean | null;
    esterilizado?: boolean | null;
    temperamento?: string | null;
}): string[] {
    const atributos: string[] = [];
    if (item.vacunado === true) atributos.push("Vacunado");
    if (item.desparasitado === true) atributos.push("Desparasitado");
    if (item.esterilizado === true) atributos.push("Esterilizado");
    const temperamento = nonEmpty(item.temperamento);
    if (temperamento) atributos.push(temperamento);
    return atributos;
}

export function formatDetalleCompatibilidad(compatibilidad: PublicCompatibilidadDTO) {
    return [
        { etiqueta: "Apto con perros", valor: formatCompatibilidad(compatibilidad?.apto_perros) },
        { etiqueta: "Apto con gatos", valor: formatCompatibilidad(compatibilidad?.apto_gatos) },
        { etiqueta: "Apto con niños", valor: formatCompatibilidad(compatibilidad?.apto_ninos) },
        { etiqueta: "Nivel de energía", valor: nonEmpty(compatibilidad?.nivel_energia) ?? "Sin información" },
        { etiqueta: "Comportamiento", valor: nonEmpty(compatibilidad?.comportamiento) ?? "Sin información" },
    ];
}
