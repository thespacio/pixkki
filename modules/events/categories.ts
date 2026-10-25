import type { EventCategory } from "./types";

export type CategoryInfo = {
    label: string;
    /** Clases completas (Tailwind no detecta nombres armados dinámicamente). */
    dot: string;
    chip: string;
};

export const CATEGORY_INFO: Record<EventCategory, CategoryInfo> = {
    adopcion: { label: "Campañas de adopción", dot: "bg-orange-500", chip: "bg-orange-100 text-orange-800" },
    reencuentro: { label: "Reencuentros de mascotas adoptadas", dot: "bg-pink-500", chip: "bg-pink-100 text-pink-800" },
    bazar: { label: "Bazar con causa", dot: "bg-purple-500", chip: "bg-purple-100 text-purple-800" },
    caminata: { label: "Caminata o carrera con causa", dot: "bg-green-500", chip: "bg-green-100 text-green-800" },
    vacunacion: { label: "Vacunación y esterilización", dot: "bg-sky-500", chip: "bg-sky-100 text-sky-800" },
    taller: { label: "Talleres de entrenamiento y cuidado", dot: "bg-amber-500", chip: "bg-amber-100 text-amber-800" },
    voluntariado: { label: "Días de voluntariado", dot: "bg-teal-500", chip: "bg-teal-100 text-teal-800" },
    colecta: { label: "Colectas de donativos", dot: "bg-red-500", chip: "bg-red-100 text-red-800" },
    otro: { label: "Otros eventos", dot: "bg-gray-400", chip: "bg-gray-100 text-gray-700" },
};

/** Minúsculas y sin acentos, para comparar "Esterilización" con "esterilizacion". */
function normalize(text: string): string {
    return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// El orden importa: "Reencuentro de mascotas adoptadas" también habla de adopción,
// así que "adopcion" se revisa al final.
const RULES: Array<[EventCategory, RegExp]> = [
    ["reencuentro", /reencuentro/],
    ["bazar", /bazar/],
    ["caminata", /caminata|carrera/],
    ["vacunacion", /vacuna|esteriliz|castraci/],
    ["taller", /taller|entrenamiento|curso/],
    ["voluntariado", /voluntari/],
    ["colecta", /colecta|donativ|acopio/],
    ["adopcion", /adopcion|adopta|adopt/],
];

/** Decide la categoría por el título; si el título no la define, prueba con la descripción. */
export function classifyEvent(title: string, description?: string | null): EventCategory {
    for (const text of [title, description ?? ""]) {
        const normalized = normalize(text);
        for (const [category, pattern] of RULES) {
            if (pattern.test(normalized)) return category;
        }
    }
    return "otro";
}
