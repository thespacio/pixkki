import type { CampaignAnimal, CampaignStatus } from "@/modules/campaigns/types";

export const STATUS_LABELS: Record<CampaignStatus, string> = {
    borrador: "Borrador",
    publicada: "Publicada",
    archivada: "Archivada",
};

/** 14 → "1 año y 2 meses", 5 → "5 meses", null → null. La edad se guarda en meses. */
export function formatAge(months: number | null): string | null {
    if (months === null || months === undefined) return null;
    if (months < 12) return months === 1 ? "1 mes" : `${months} meses`;

    const years = Math.floor(months / 12);
    const rest = months % 12;
    const y = years === 1 ? "1 año" : `${years} años`;
    return rest === 0 ? y : `${y} y ${rest === 1 ? "1 mes" : `${rest} meses`}`;
}

export function animalLabel(animal: Pick<CampaignAnimal, "nombre" | "especie">): string {
    return animal.nombre?.trim() || `${animal.especie} sin nombre`;
}

/** "Luna · Gato · 2 años" para mostrar a un animal en una línea. */
export function animalSummary(animal: CampaignAnimal): string {
    // Sin nombre, la etiqueta ya dice la especie ("Perro sin nombre"): no se repite.
    return [animalLabel(animal), animal.nombre ? animal.especie : null, formatAge(animal.edadEstimada)]
        .filter(Boolean)
        .join(" · ");
}

/** ["Adopta", "SinHogar"] → "#Adopta #SinHogar" */
export function hashtagsToText(tags: readonly string[]): string {
    return tags.map((t) => `#${t}`).join(" ");
}

/**
 * "#Adopta, sinhogar  #Perros" → ["Adopta", "sinhogar", "Perros"].
 * Solo separa; la validación (largo, caracteres, repetidos) la hace el servidor.
 */
export function textToHashtags(text: string): string[] {
    return text
        .split(/[\s,]+/)
        .map((t) => t.replace(/^#+/, "").trim())
        .filter((t) => t !== "");
}
