/**
 * Única fuente de verdad (lado aplicación) de los requisitos para publicar un
 * perfil de adopción. La RPC `publicar_perfil_adopcion` sigue siendo la
 * autoridad final; esta función existe para que la UI y el repositorio no
 * calculen reglas divergentes y para poder explicar los bloqueos al usuario.
 *
 * Es una función pura: no accede a Supabase ni a React.
 */

export const DESCRIPCION_MINIMA = 50;
export const DESCRIPCION_MAXIMA = 2000;
/** Código canónico de la RPC. La UI lo oculta porque el contador ya lo explica. */
export const CODIGO_DESCRIPCION_INVALIDA = "descripcion_invalida";

const ETIQUETAS_BLOQUEO: Record<string, string> = {
    no_disponible_adopcion: "El animal aún no está habilitado para adopción.",
    en_cuarentena: "El animal está en cuarentena.",
    no_activo: "El animal no está activo o fue dado de baja.",
    reservado_adopcion: "El animal está reservado para otra adopción.",
    [CODIGO_DESCRIPCION_INVALIDA]: `La descripción pública debe tener entre ${DESCRIPCION_MINIMA} y ${DESCRIPCION_MAXIMA} caracteres.`,
    sin_fotografia: "El perfil necesita al menos una fotografía.",
};

/** Traduce los códigos devueltos por la RPC a mensajes para el usuario final. */
export function traducirBloqueos(codigos: string[]): string[] {
    return codigos.map((codigo) => ETIQUETAS_BLOQUEO[codigo] ?? codigo);
}

type EstadoAnimal = {
    disponibleAdopcion: boolean;
    enCuarentena: boolean;
    activo: boolean;
    eliminado: boolean;
    reservadoAdopcion: boolean;
};

type EntradaElegibilidad = EstadoAnimal & {
    descripcionPublica: string | null;
    cantidadFotos: number;
};

export type ElegibilidadPublicacion = {
    puedePublicarse: boolean;
    /** Mensajes listos para mostrar en la UI. */
    bloqueos: string[];
    /** Códigos canónicos (coinciden con los de la RPC). */
    codigos: string[];
};

export function evaluarElegibilidadPublicacion(
    entrada: EntradaElegibilidad,
): ElegibilidadPublicacion {
    const codigos: string[] = [];

    if (!entrada.disponibleAdopcion) codigos.push("no_disponible_adopcion");
    if (entrada.enCuarentena) codigos.push("en_cuarentena");
    if (!entrada.activo || entrada.eliminado) codigos.push("no_activo");
    if (entrada.reservadoAdopcion) codigos.push("reservado_adopcion");

    const descripcion = entrada.descripcionPublica?.trim() ?? "";
    if (
        descripcion.length < DESCRIPCION_MINIMA ||
        descripcion.length > DESCRIPCION_MAXIMA
    ) {
        codigos.push(CODIGO_DESCRIPCION_INVALIDA);
    }
    if (entrada.cantidadFotos < 1) codigos.push("sin_fotografia");

    return {
        puedePublicarse: codigos.length === 0,
        bloqueos: traducirBloqueos(codigos),
        codigos,
    };
}
